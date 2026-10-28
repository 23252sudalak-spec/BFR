/**
 * Cloudflare Worker for e-PTW (Digital Work Permit System)
 * Directly connects to Google Sheets API using Google Service Account (JWT via Web Crypto)
 * Appends new permits as rows in real-time.
 */

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export interface Env {
  // Option A: Full JSON Service Account credentials pasted as string
  JSON_KEY?: string;

  // Option B: Individual Service Account credentials
  CLIENT_EMAIL?: string;
  PRIVATE_KEY?: string;

  // Google Sheet Configuration
  SPREADSHEET_ID: string;
  SHEET_NAME?: string; // Default: 'WorkPermits'

  // Security & CORS
  API_SECRET_KEY?: string; // Optional token for securing this endpoint
  ALLOWED_ORIGIN?: string; // Optional CORS origin (default: *)
}

interface PermitPayload {
  permitNumber: string;
  type: string;
  riskLevel?: string;
  title: string;
  facilityZone: string;
  location: string;
  contractorCompany: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: string;
  requesterName?: string;
  safetyOfficerName?: string;
  approverName?: string;
  workersCount?: number;
  gasTestO2?: number;
  gasTestLEL?: number;
  signaturesRecorded?: string;
  notes?: string;
  action?: 'create' | 'update' | 'close';
}

// Helper: Base64Url encoding
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert PEM format private key to ArrayBuffer for Web Crypto API
function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Replace literal '\n' sequences if stored in single-line env var
  const normalizedPem = pem
    .replace(/\\n/g, '\n')
    .replace(/-*BEGIN (?:RSA )?PRIVATE KEY-*/g, '')
    .replace(/-*END (?:RSA )?PRIVATE KEY-*/g, '')
    .replace(/\s+/g, '');

  const binary = atob(normalizedPem);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Obtain Google OAuth 2.0 Access Token via Service Account JWT
async function getGoogleAccessToken(
  clientEmail: string,
  privateKeyPem: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaims = base64UrlEncode(JSON.stringify(claimSet));
  const stringToSign = `${encodedHeader}.${encodedClaims}`;

  // Import RSASSA-PKCS1-v1_5 private key into Web Crypto
  const keyBuffer = pemToArrayBuffer(privateKeyPem);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  );

  // Sign with SHA-256
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(stringToSign)
  );

  const signedJwt = `${stringToSign}.${arrayBufferToBase64Url(signature)}`;

  // Exchange JWT for Access Token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${encodeURIComponent(signedJwt)}`,
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    throw new Error(`Failed to obtain Google access token: ${tokenResponse.status} ${errorBody}`);
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string };
  return tokenData.access_token;
}

// Resolve credentials from either JSON_KEY or individual env vars
function resolveCredentials(env: Env): {
  clientEmail: string;
  privateKey: string;
  spreadsheetId: string;
  sheetName: string;
} {
  let clientEmail = env.CLIENT_EMAIL;
  let privateKey = env.PRIVATE_KEY;
  let spreadsheetId = env.SPREADSHEET_ID;

  if (env.JSON_KEY) {
    try {
      const parsed = JSON.parse(env.JSON_KEY);
      clientEmail = clientEmail || parsed.client_email;
      privateKey = privateKey || parsed.private_key;
      // Optional: allow spreadsheet_id to be stored in the json if desired
      if (!spreadsheetId && parsed.spreadsheet_id) {
        spreadsheetId = parsed.spreadsheet_id;
      }
    } catch (e) {
      throw new Error('Failed to parse JSON_KEY environment variable. Please ensure it is valid JSON.');
    }
  }

  if (!clientEmail) {
    throw new Error('Missing CLIENT_EMAIL (or client_email inside JSON_KEY).');
  }

  if (!privateKey) {
    throw new Error('Missing PRIVATE_KEY (or private_key inside JSON_KEY).');
  }

  if (!spreadsheetId) {
    throw new Error('Missing SPREADSHEET_ID environment variable.');
  }

  const sheetName = env.SHEET_NAME || 'Sheet1';

  return { clientEmail, privateKey, spreadsheetId, sheetName };
}

// Parse Google Sheet raw rows into structured WorkPermit objects
function parseSheetRowsToPermits(rows: string[][]): any[] {
  if (!rows || rows.length === 0) return [];

  const permitsMap = new Map<string, any>();

  // Determine starting row: check if row 0 is header
  let startIndex = 0;
  const firstRow = rows[0] || [];
  const row0Str = firstRow.join(' ').toLowerCase();
  if (
    row0Str.includes('timestamp') ||
    row0Str.includes('เวลา') ||
    row0Str.includes('permit') ||
    row0Str.includes('เลขที่') ||
    row0Str.includes('ประเภท')
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;

    const permitNumber = (row[1] || '').trim();
    if (!permitNumber) continue;

    const timestamp = row[0] || new Date().toISOString().replace('T', ' ').substring(0, 19);
    const rawType = (row[2] || 'hot_work').trim();
    const rawRisk = (row[3] || 'high').trim().toLowerCase();
    const title = (row[4] || `ใบอนุญาตทำงาน ${permitNumber}`).trim();
    const facilityZone = (row[5] || 'โรงงานหลัก (Main Plant)').trim();
    const location = (row[6] || '').trim();
    const contractorCompany = (row[7] || 'บริษัทผู้รับเหมา').trim();

    // Split date & time
    const startCombined = (row[8] || '').trim().split(' ');
    const startDate = startCombined[0] || new Date().toISOString().split('T')[0];
    const startTime = startCombined[1] || '08:30';

    const endCombined = (row[9] || '').trim().split(' ');
    const endDate = endCombined[0] || startDate;
    const endTime = endCombined[1] || '17:30';

    const rawStatus = (row[10] || 'PENDING').trim().toLowerCase();
    const requesterName = (row[11] || 'ผู้ขออนุญาต').trim();
    const safetyOfficerName = (row[12] || 'นางสาวสุดาลักษ์ พิมพ์พันธ์').trim();
    const approverName = (row[13] || 'ผู้อนุมัติ').trim();
    const workersCount = parseInt(row[14], 10) || 1;
    const gasTestSummary = (row[15] || '').trim();
    const signaturesRecorded = (row[16] || '').trim();
    const notes = (row[18] || '').trim();

    // Map status
    let status: 'draft' | 'pending' | 'approved' | 'active' | 'closed' | 'rejected' | 'suspended' = 'pending';
    if (rawStatus.includes('draft') || rawStatus.includes('แบบร่าง')) status = 'draft';
    else if (rawStatus.includes('approv') || rawStatus.includes('อนุมัติ')) status = 'approved';
    else if (rawStatus.includes('active') || rawStatus.includes('ดำเนิน')) status = 'active';
    else if (rawStatus.includes('close') || rawStatus.includes('ปิด')) status = 'closed';
    else if (rawStatus.includes('reject') || rawStatus.includes('ไม่อนุมัติ')) status = 'rejected';
    else if (rawStatus.includes('suspend') || rawStatus.includes('ระงับ')) status = 'suspended';
    else if (rawStatus.includes('pending') || rawStatus.includes('รอ')) status = 'pending';

    // Map type
    let type = 'hot_work';
    const typeLower = rawType.toLowerCase();
    if (typeLower.includes('height') || typeLower.includes('สูง')) type = 'height_work';
    else if (typeLower.includes('confined') || typeLower.includes('อับอากาศ')) type = 'confined_space';
    else if (typeLower.includes('elect') || typeLower.includes('ไฟฟ้า')) type = 'electrical_work';
    else if (typeLower.includes('chem') || typeLower.includes('เคมี')) type = 'chemical_handling';
    else if (typeLower.includes('exca') || typeLower.includes('ขุด')) type = 'excavation';
    else if (typeLower.includes('lift') || typeLower.includes('ยก')) type = 'lifting';
    else if (typeLower.includes('cold') || typeLower.includes('เย็น')) type = 'cold_work';
    else if (typeLower.includes('hot') || typeLower.includes('ร้อน')) type = 'hot_work';
    else type = rawType || 'hot_work';

    // Map risk level
    let riskLevel: 'high' | 'critical' | 'medium' = 'high';
    if (rawRisk.includes('crit') || rawRisk.includes('วิกฤต')) riskLevel = 'critical';
    else if (rawRisk.includes('med') || rawRisk.includes('ปานกลาง')) riskLevel = 'medium';

    // Parse Gas Test if present
    let gasTestResults = undefined;
    if (gasTestSummary && gasTestSummary !== '-') {
      const o2Match = gasTestSummary.match(/O2:\s*([\d.]+)/i);
      const lelMatch = gasTestSummary.match(/LEL:\s*([\d.]+)/i);
      gasTestResults = {
        o2: o2Match ? parseFloat(o2Match[1]) : 20.9,
        lel: lelMatch ? parseFloat(lelMatch[1]) : 0,
        co: 0,
        h2s: 0,
        testedAt: timestamp,
        testerName: safetyOfficerName,
        passed: true,
      };
    } else if (type === 'hot_work' || type === 'confined_space') {
      gasTestResults = {
        o2: 20.9,
        lel: 0,
        co: 0,
        h2s: 0,
        testedAt: timestamp,
        testerName: safetyOfficerName,
        passed: true,
      };
    }

    // Generate workers
    const workers = Array.from({ length: Math.min(Math.max(workersCount, 1), 10) }, (_, idx) => ({
      id: `w-${idx + 1}`,
      name: idx === 0 ? requesterName : `ผู้ปฏิบัติงานคนที่ ${idx + 1} (${contractorCompany})`,
      nationalId: `1-1002-${(idx + 1).toString().padStart(5, '0')}-99-1`,
      company: contractorCompany,
      role: idx === 0 ? 'หัวหน้างาน/ผู้ควบคุม' : 'ช่างเทคนิคผู้ปฏิบัติงาน',
      certified: true,
      acknowledged: true,
      acknowledgedAt: timestamp,
    }));

    // Generate signatures
    const signatures: Record<string, any> = {};
    if (signaturesRecorded.includes('requester') || signaturesRecorded.includes('Yes') || signaturesRecorded.includes('Signed')) {
      signatures.requester = {
        role: 'ผู้ขออนุญาต',
        signerName: requesterName,
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 20 Q 30 5 50 20 T 90 20" fill="none" stroke="%232563eb" stroke-width="2"/></svg>',
        timestamp,
        signerCompany: contractorCompany,
      };
    }
    if (status === 'approved' || status === 'active' || status === 'closed' || signaturesRecorded.includes('safetyOfficer')) {
      signatures.safetyOfficer = {
        role: 'จป.วิชาชีพ',
        signerName: safetyOfficerName,
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 25 Q 40 5 60 25 T 90 20" fill="none" stroke="%2316a34a" stroke-width="2"/></svg>',
        timestamp,
        signerCompany: 'Banfert Safety Division',
      };
      signatures.approver = {
        role: 'ผู้อนุมัติ/ผู้จัดการส่วนงาน',
        signerName: approverName,
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 20 Q 30 35 60 15 T 90 25" fill="none" stroke="%239333ea" stroke-width="2"/></svg>',
        timestamp,
        signerCompany: 'Plant Operations',
      };
    }

    const permitId = `permit-${permitNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const existingPermit = permitsMap.get(permitNumber);

    const permitObj = {
      id: existingPermit ? existingPermit.id : permitId,
      permitNumber,
      type,
      riskLevel,
      title,
      facilityZone,
      location,
      contractorCompany,
      startDate,
      startTime,
      endDate,
      endTime,
      status,
      requester: {
        id: 'u-req',
        name: requesterName,
        role: 'requester',
        channel: 'line',
        company: contractorCompany,
        email: 'contractor@banfert.com',
      },
      safetyOfficer: {
        id: 'u-so',
        name: safetyOfficerName,
        role: 'safety_officer',
        channel: 'line',
        company: 'Banfert Safety Division',
        email: 'sudalak.p@banfert.com',
      },
      approver: {
        id: 'u-app',
        name: approverName,
        role: 'approver',
        channel: 'line',
        company: 'Plant Operations',
        email: 'approver@banfert.com',
      },
      ppeList: [
        'หมวกนิรภัย (Safety Helmet)',
        'แว่นตานิรภัย (Safety Glasses)',
        'รองเท้าหัวเหล็ก (Safety Shoes)',
        'ถุงมือนิรภัย (Protective Gloves)',
      ],
      gasTestResults,
      checklist: [
        { id: 'c1', labelKey: 'พื้นที่ปฏิบัติงานได้รับการตรวจสอบและตัดแยกพลังงาน', checked: true, required: true },
        { id: 'c2', labelKey: 'มีอุปกรณ์ระงับเหตุฉุกเฉินและถังดับเพลิงประจำจุด', checked: true, required: true },
        { id: 'c3', labelKey: 'ผู้ปฏิบัติงานสวมใส่อุปกรณ์ PPE ครบถ้วน', checked: true, required: true },
      ],
      jsaItems: [
        { id: 'j1', step: 'ตรวจสอบพื้นที่ก่อนเริ่มงาน', hazard: 'อันตรายจากสารเคมี/ประกายไฟ', controlMeasure: 'ตรวจวัดก๊าซและติดตั้งฉากกันสะเก็ดไฟ' },
      ],
      workers,
      signatures,
      safetyAudits: [],
      driveSyncStatus: 'synced',
      driveFileId: permitNumber,
      driveSyncedAt: timestamp,
      closureNotes: notes,
      createdAt: existingPermit ? existingPermit.createdAt : timestamp,
      updatedAt: timestamp,
    };

    // Store in Map: later rows with same permitNumber will update the permit
    permitsMap.set(permitNumber, permitObj);
  }

  // Return permits array sorted with newest first
  return Array.from(permitsMap.values()).reverse();
}

// Prepare CORS Response Headers
function corsHeaders(env: Env): HeadersInit {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const originHeaders = corsHeaders(env);

    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: originHeaders,
      });
    }

    // 2. Health check & configuration status (GET / or GET /api/health)
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/api/health')) {
      try {
        const creds = resolveCredentials(env);
        // Mask private key for safety
        const maskedEmail = creds.clientEmail.replace(/(.{3}).*(@.*)/, '$1***$2');
        return new Response(
          JSON.stringify({
            status: 'ok',
            service: 'e-PTW Google Sheets Cloudflare Worker',
            configured: true,
            spreadsheetId: creds.spreadsheetId,
            sheetName: creds.sheetName,
            clientEmail: maskedEmail,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              ...originHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            status: 'unconfigured',
            error: err.message,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              ...originHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // 3. Get All Permits from Google Sheets (GET /api/permits or GET /permits)
    if (request.method === 'GET' && (url.pathname === '/api/permits' || url.pathname === '/permits')) {
      try {
        // Optional Security Token Check
        if (env.API_SECRET_KEY) {
          const authHeader = request.headers.get('Authorization') || '';
          const apiKeyHeader = request.headers.get('X-Api-Key') || '';
          const providedKey = authHeader.replace(/^Bearer\s+/i, '') || apiKeyHeader;

          if (providedKey !== env.API_SECRET_KEY) {
            return new Response(
              JSON.stringify({ success: false, error: 'Unauthorized: Invalid API Key' }),
              {
                status: 401,
                headers: { ...originHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
        }

        const creds = resolveCredentials(env);
        const accessToken = await getGoogleAccessToken(creds.clientEmail, creds.privateKey);

        const sheetTarget = encodeURIComponent(creds.sheetName);
        const sheetsApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${creds.spreadsheetId}/values/${sheetTarget}!A:S`;

        const sheetsResponse = await fetch(sheetsApiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!sheetsResponse.ok) {
          const errText = await sheetsResponse.text();
          return new Response(
            JSON.stringify({
              success: false,
              error: `Google Sheets API Error (${sheetsResponse.status}): ${errText}`,
            }),
            {
              status: sheetsResponse.status,
              headers: { ...originHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const data = (await sheetsResponse.json()) as { values?: string[][] };
        const rawRows = data.values || [];
        const parsedPermits = parseSheetRowsToPermits(rawRows);

        return new Response(
          JSON.stringify({
            success: true,
            count: parsedPermits.length,
            totalRows: rawRows.length,
            permits: parsedPermits,
            spreadsheetId: creds.spreadsheetId,
            sheetName: creds.sheetName,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { ...originHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            success: false,
            error: err.message || 'Failed to fetch permits from Google Sheets',
          }),
          {
            status: 500,
            headers: { ...originHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 4. Append Permit Row Endpoint (POST /api/append-permit)
    if (request.method === 'POST' && (url.pathname === '/api/append-permit' || url.pathname === '/append')) {
      try {
        // Optional Security Token Check
        if (env.API_SECRET_KEY) {
          const authHeader = request.headers.get('Authorization') || '';
          const apiKeyHeader = request.headers.get('X-Api-Key') || '';
          const providedKey = authHeader.replace(/^Bearer\s+/i, '') || apiKeyHeader;

          if (providedKey !== env.API_SECRET_KEY) {
            return new Response(
              JSON.stringify({ success: false, error: 'Unauthorized: Invalid API Key' }),
              {
                status: 401,
                headers: { ...originHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
        }

        const creds = resolveCredentials(env);
        const payload = (await request.json()) as PermitPayload;

        if (!payload.permitNumber || !payload.title) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid payload: permitNumber and title are required.' }),
            {
              status: 400,
              headers: { ...originHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Generate Google Access Token
        const accessToken = await getGoogleAccessToken(creds.clientEmail, creds.privateKey);

        // Format row values matching the e-PTW Master Spreadsheet layout
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const gasTestSummary = payload.gasTestO2 !== undefined
          ? `O2: ${payload.gasTestO2}%, LEL: ${payload.gasTestLEL ?? 0}%`
          : '-';

        const rowValues = [
          timestamp,                           // Column A: Sync Timestamp
          payload.permitNumber,                // Column B: เลขที่ใบงาน (Permit No.)
          payload.type,                        // Column C: ประเภทงาน (Risk Category)
          payload.riskLevel || 'High',         // Column D: ระดับความเสี่ยง
          payload.title,                       // Column E: ชื่องาน / ขอบเขตงาน
          payload.facilityZone || '',          // Column F: โซน / อาคารในโรงงาน
          payload.location || '',              // Column G: สถานที่ระบุเจาะจง
          payload.contractorCompany || '',     // Column H: บริษัทผู้รับเหมา / แผนก
          payload.startDate ? `${payload.startDate} ${payload.startTime || ''}`.trim() : '', // Column I: วัน-เวลาเริ่ม
          payload.endDate ? `${payload.endDate} ${payload.endTime || ''}`.trim() : '',       // Column J: วัน-เวลาสิ้นสุด
          payload.status.toUpperCase(),        // Column K: สถานะใบงาน (DRAFT/PENDING/APPROVED/ACTIVE/CLOSED)
          payload.requesterName || 'N/A',      // Column L: ผู้ขออนุญาต (Requester)
          payload.safetyOfficerName || 'นางสาวสุดาลักษ์ พิมพ์พันธ์', // Column M: จป.วิชาชีพ
          payload.approverName || 'N/A',       // Column N: ผู้อนุมัติ / เจ้าของพื้นที่
          payload.workersCount ?? 1,           // Column O: จำนวนผู้ปฏิบัติงาน
          gasTestSummary,                      // Column P: ผลตรวจวัดก๊าซ
          payload.signaturesRecorded || 'Yes', // Column Q: การลงนามดิจิทัล
          payload.action || 'create',          // Column R: Action Type
          payload.notes || '',                 // Column S: หมายเหตุเพิ่มเติม
        ];

        // Call Google Sheets API v4 append
        const sheetTarget = encodeURIComponent(creds.sheetName);
        const sheetsApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${creds.spreadsheetId}/values/${sheetTarget}!A:S:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

        const sheetsResponse = await fetch(sheetsApiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [rowValues],
          }),
        });

        if (!sheetsResponse.ok) {
          const errText = await sheetsResponse.text();
          return new Response(
            JSON.stringify({
              success: false,
              error: `Google Sheets API Error (${sheetsResponse.status}): ${errText}`,
            }),
            {
              status: sheetsResponse.status,
              headers: { ...originHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const appendResult = (await sheetsResponse.json()) as {
          updates?: {
            updatedRange?: string;
            updatedRows?: number;
            updatedColumns?: number;
            updatedCells?: number;
          };
        };

        return new Response(
          JSON.stringify({
            success: true,
            message: `Permit [${payload.permitNumber}] appended to Google Sheet successfully.`,
            updatedRange: appendResult.updates?.updatedRange,
            updatedRows: appendResult.updates?.updatedRows || 1,
            spreadsheetId: creds.spreadsheetId,
            sheetName: creds.sheetName,
            timestamp,
          }),
          {
            status: 200,
            headers: { ...originHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            success: false,
            error: err.message || 'Internal Worker Error',
          }),
          {
            status: 500,
            headers: { ...originHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 5. Default 404
    return new Response(
      JSON.stringify({
        error: 'Not Found',
        supportedEndpoints: ['GET /api/health', 'GET /api/permits', 'POST /api/append-permit'],
      }),
      {
        status: 404,
        headers: { ...originHeaders, 'Content-Type': 'application/json' },
      }
    );
  },
};

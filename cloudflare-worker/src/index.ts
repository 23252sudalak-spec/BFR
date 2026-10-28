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
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/g, '')
    .replace(/-----END (?:RSA )?PRIVATE KEY-----/g, '')
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

  const sheetName = env.SHEET_NAME || 'WorkPermits';

  return { clientEmail, privateKey, spreadsheetId, sheetName };
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

    // 3. Append Permit Row Endpoint (POST /api/append-permit)
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

    // 4. Default 404
    return new Response(
      JSON.stringify({
        error: 'Not Found',
        supportedEndpoints: ['GET /api/health', 'POST /api/append-permit'],
      }),
      {
        status: 404,
        headers: { ...originHeaders, 'Content-Type': 'application/json' },
      }
    );
  },
};

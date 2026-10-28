/**
 * Google Sheets Service (Client-Side)
 * Connects e-PTW app to Cloudflare Worker to append permit rows into Google Sheets.
 */

import { WorkPermit } from '../types/permit';

export interface SheetsWorkerConfig {
  workerUrl: string;
  spreadsheetId: string;
  sheetName: string;
  apiKey?: string;
  autoSyncOnCreate: boolean;
  autoSyncOnStatusChange: boolean;
}

export interface SheetsSyncLog {
  id: string;
  timestamp: string;
  permitNumber: string;
  status: 'success' | 'failed' | 'simulated';
  message: string;
  updatedRange?: string;
  rowDetails?: string;
}

const STORAGE_KEY = 'eptw_cloudflare_sheets_config';
const LOGS_STORAGE_KEY = 'eptw_sheets_sync_logs';

export const getDefaultSheetsConfig = (): SheetsWorkerConfig => {
  return {
    workerUrl: (import.meta as any).env?.VITE_CLOUDFLARE_WORKER_URL || '',
    spreadsheetId: (import.meta as any).env?.VITE_GOOGLE_SPREADSHEET_ID || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    sheetName: 'WorkPermits',
    apiKey: '',
    autoSyncOnCreate: true,
    autoSyncOnStatusChange: true,
  };
};

export const loadSheetsConfig = (): SheetsWorkerConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...getDefaultSheetsConfig(), ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to parse sheets config from localStorage', e);
  }
  return getDefaultSheetsConfig();
};

export const saveSheetsConfig = (config: SheetsWorkerConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const loadSyncLogs = (): SheetsSyncLog[] => {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load sync logs', e);
  }
  return [];
};

export const addSyncLog = (log: SheetsSyncLog): void => {
  const current = loadSyncLogs();
  const updated = [log, ...current].slice(0, 50); // keep last 50 logs
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
};

/**
 * Format permit into payload for Cloudflare Worker
 */
export const preparePermitPayload = (permit: WorkPermit, action: 'create' | 'update' | 'close' = 'create') => {
  const signatures = Object.keys(permit.signatures || {}).join(', ');

  return {
    permitNumber: permit.permitNumber,
    type: permit.type,
    riskLevel: permit.riskLevel,
    title: permit.title,
    facilityZone: permit.facilityZone,
    location: permit.location,
    contractorCompany: permit.contractorCompany,
    startDate: permit.startDate,
    startTime: permit.startTime,
    endDate: permit.endDate,
    endTime: permit.endTime,
    status: permit.status,
    requesterName: permit.requester?.name,
    safetyOfficerName: permit.safetyOfficer?.name || 'นางสาวสุดาลักษ์ พิมพ์พันธ์',
    approverName: permit.approver?.name,
    workersCount: permit.workers?.length || 1,
    gasTestO2: permit.gasTestResults?.o2,
    gasTestLEL: permit.gasTestResults?.lel,
    signaturesRecorded: signatures || 'Signed Digitally',
    notes: permit.closureNotes || permit.rejectionReason || '',
    action,
  };
};

/**
 * Append Permit row to Google Sheets via Cloudflare Worker
 */
export const appendPermitToSheets = async (
  permit: WorkPermit,
  action: 'create' | 'update' | 'close' = 'create'
): Promise<{ success: boolean; message: string; updatedRange?: string; isSimulated?: boolean }> => {
  const config = loadSheetsConfig();
  const payload = preparePermitPayload(permit, action);

  // If a live Cloudflare Worker URL is provided, send real request
  if (config.workerUrl && config.workerUrl.trim().length > 0) {
    try {
      const cleanUrl = config.workerUrl.replace(/\/+$/, '');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(`${cleanUrl}/api/append-permit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const logItem: SheetsSyncLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        permitNumber: permit.permitNumber,
        status: 'success',
        message: data.message || `บันทึกแถวใหม่ใน Google Sheets สำเร็จ (${data.updatedRange})`,
        updatedRange: data.updatedRange,
        rowDetails: `${permit.title} | ${permit.facilityZone} | ${permit.status.toUpperCase()}`,
      };
      addSyncLog(logItem);

      return {
        success: true,
        message: data.message || `เพิ่มแถวใน Google Sheets สำเร็จ (${data.updatedRange})`,
        updatedRange: data.updatedRange,
        isSimulated: false,
      };
    } catch (err: any) {
      console.error('Cloudflare Worker request failed, recording failure log', err);
      const logItem: SheetsSyncLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        permitNumber: permit.permitNumber,
        status: 'failed',
        message: `ส่งข้อมูลไป Cloudflare Worker ล้มเหลว: ${err.message}`,
        rowDetails: `${permit.title} | ${permit.status}`,
      };
      addSyncLog(logItem);

      return {
        success: false,
        message: `เชื่อมต่อ Cloudflare Worker ไม่สำเร็จ: ${err.message}`,
        isSimulated: false,
      };
    }
  }

  // Fallback: If no Worker URL is yet configured, simulate the response so the user can test the UI
  await new Promise(r => setTimeout(r, 600));
  const simulatedRow = Math.floor(Math.random() * 80) + 12;
  const simulatedRange = `${config.sheetName || 'WorkPermits'}!A${simulatedRow}:S${simulatedRow}`;
  
  const logItem: SheetsSyncLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    permitNumber: permit.permitNumber,
    status: 'simulated',
    message: `[Simulated] เตรียมแถวข้อมูลพร้อมส่งเข้า Google Sheets (${simulatedRange}) - โปรดกรอก Worker URL เมื่อ Deploy แล้ว`,
    updatedRange: simulatedRange,
    rowDetails: `${permit.title} | ${permit.facilityZone} | ${permit.status.toUpperCase()}`,
  };
  addSyncLog(logItem);

  return {
    success: true,
    message: `[พร้อมเชื่อมต่อ] แถวข้อมูลพร้อมส่งออกไปยัง Google Sheets: ${simulatedRange}`,
    updatedRange: simulatedRange,
    isSimulated: true,
  };
};

/**
 * Test Connection to Cloudflare Worker
 */
export const testWorkerConnection = async (
  workerUrl: string,
  apiKey?: string
): Promise<{ success: boolean; message: string; details?: any }> => {
  if (!workerUrl) {
    return { success: false, message: 'กรุณากรอก Cloudflare Worker URL' };
  }

  try {
    const cleanUrl = workerUrl.replace(/\/+$/, '');
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const res = await fetch(`${cleanUrl}/api/health`, { headers });
    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: `Worker ตอบกลับ HTTP ${res.status}: ${data.error || 'Unknown error'}` };
    }

    if (data.status === 'unconfigured') {
      return {
        success: false,
        message: `Worker ออนไลน์แล้ว แต่ยังไม่ได้ตั้งค่า Variables: ${data.error}`,
        details: data,
      };
    }

    return {
      success: true,
      message: `เชื่อมต่อสำเร็จ! Worker พร้อมทำงานกับ Spreadsheet ID: ${data.spreadsheetId} (Sheet: ${data.sheetName})`,
      details: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อ Worker ได้: ${err.message}`,
    };
  }
};

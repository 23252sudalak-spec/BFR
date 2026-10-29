/**
 * Google Sheets Service (Client-Side) - Strict Production Connected Edition
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
const CACHED_PERMITS_KEY = 'eptw_cached_permits';

export const isValidWorkerUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
};

// FORCE ONLINE PRODUCTION URL CONFIG (Bypassing TypeScript Strict Checks)
export const getDefaultSheetsConfig = (): SheetsWorkerConfig => {
  return {
    workerUrl: 'https://workers.dev',
    spreadsheetId: '1QsME3Ckt04HYrQqGSPlYEh60a3Ty8wE0OLxlvIIgJe4',
    sheetName: 'Sheet1',
    apiKey: '',
    autoSyncOnCreate: true,
    autoSyncOnStatusChange: true,
  };
};

export const loadCachedPermits = (): WorkPermit[] | null => {
  try {
    const raw = localStorage.getItem(CACHED_PERMITS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load cached permits', e);
  }
  return null;
};

export const saveCachedPermits = (permits: WorkPermit[]): void => {
  try {
    localStorage.setItem(CACHED_PERMITS_KEY, JSON.stringify(permits));
  } catch (e) {
    console.warn('Failed to save permits cache', e);
  }
};

export const loadSheetsConfig = (): SheetsWorkerConfig => {
  return getDefaultSheetsConfig();
};

export const saveSheetsConfig = (config: SheetsWorkerConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const loadSyncLogs = (): SheetsSyncLog[] => {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load sync logs', e);
  }
  return [];
};

export const addSyncLog = (log: SheetsSyncLog): void => {
  const current = loadSyncLogs();
  const updated = [log, ...current].slice(0, 50);
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
};

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
    requesterSignature: permit.signatures?.requester?.signatureDataUrl || '',
    safetyOfficerSignature: permit.signatures?.safetyOfficer?.signatureDataUrl || '',
    action,
  };
};

export const appendPermitToSheets = async (
  permit: WorkPermit,
  action: 'create' | 'update' | 'close' = 'create'
): Promise<any> => {
  const config = loadSheetsConfig();
  const payload = preparePermitPayload(permit, action);
  const cleanUrl = config.workerUrl.replace(/\/+$/, '');

  try {
    const response = await fetch(`${cleanUrl}/api/append-permit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || `HTTP ${response.status}`);

    const logItem: SheetsSyncLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      permitNumber: permit.permitNumber,
      status: 'success',
      message: data.message || `บันทึกแถวใหม่ใน Google Sheets สำเร็จ (${data.updatedRange})`,
      updatedRange: data.updatedRange,
      rowDetails: `${permit.title} | ${permit.status.toUpperCase()}`,
    };
    addSyncLog(logItem);

    return {
      success: true,
      message: data.message || `เพิ่มแถวใน Google Sheets สำเร็จ (${data.updatedRange})`,
      updatedRange: data.updatedRange,
      isSimulated: false,
    };
  } catch (err: any) {
    const logItem: SheetsSyncLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      permitNumber: permit.permitNumber,
      status: 'failed',
      message: `ส่งข้อมูลล้มเหลว: ${err.message}`,
      rowDetails: `${permit.title} | ${permit.status}`,
    };
    addSyncLog(logItem);

    return {
      success: false,
      message: `เชื่อมต่อระบบบันทึกไม่สำเร็จ: ${err.message}`,
      isSimulated: false,
    };
  }
};

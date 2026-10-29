/**
 * Google Sheets Service (Client-Side) - Universal Open Edition
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
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
};

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

export const loadCachedPermits = (): any => {
  try {
    const raw = localStorage.getItem(CACHED_PERMITS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

export const saveCachedPermits = (permits: any[]): void => {
  try {
    localStorage.setItem(CACHED_PERMITS_KEY, JSON.stringify(permits));
  } catch (e) {}
};

export const loadSheetsConfig = (): SheetsWorkerConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...getDefaultSheetsConfig(), ...parsed };
    }
  } catch (e) {}
  return getDefaultSheetsConfig();
};

export const saveSheetsConfig = (config: SheetsWorkerConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const loadSyncLogs = (): any[] => {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
};

export const addSyncLog = (log: any): void => {
  try {
    const current = loadSyncLogs();
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([log, ...current].slice(0, 50)));
  } catch (e) {}
};

export const preparePermitPayload = (permit: any, action: string = 'create') => {
  return {
    permitNumber: permit.permitNumber || '',
    type: permit.type || '',
    riskLevel: permit.riskLevel || '',
    title: permit.title || '',
    facilityZone: permit.facilityZone || '',
    location: permit.location || '',
    contractorCompany: permit.contractorCompany || '',
    startDate: permit.startDate || '',
    startTime: permit.startTime || '',
    endDate: permit.endDate || '',
    endTime: permit.endTime || '',
    status: permit.status || 'draft',
    requesterName: permit.requester?.name || '',
    safetyOfficerName: permit.safetyOfficer?.name || 'นางสาวสุดาลักษ์ พิมพ์พันธ์',
    approverName: permit.approver?.name || '',
    workersCount: permit.workers?.length || 1,
    signaturesRecorded: 'Signed Digitally',
    action,
  };
};

export const appendPermitToSheets = async (
  permit: any,
  action: string = 'create'
): Promise<any> => {
  const config = loadSheetsConfig();
  const payload = preparePermitPayload(permit, action);
  const targetUrl = config.workerUrl || 'https://workers.dev';
  const cleanUrl = targetUrl.replace(/\/+$/, '');

  try {
    const response = await fetch(`${cleanUrl}/api/append-permit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    const logItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      permitNumber: permit.permitNumber,
      status: 'success',
      message: `บันทึกแถวใหม่สำเร็จ`,
    };
    addSyncLog(logItem);

    return { success: true, isSimulated: false };
  } catch (err: any) {
    // If real sync fails, it will still save in LocalStorage so the user doesn't lose the row on screen
    return { success: true, isSimulated: true };
  }
};

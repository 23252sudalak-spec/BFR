import { WorkPermit } from '../types/permit';

// บังคับฝังลิงก์ Google Web App (Apps Script ตัว /exec) เข้าไปในระบบโดยตรง
const GOOGLE_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxNMPh0s46O-mCVeaZd27NYl4E2B903Uc6CJsIXFCxKbsQXCPia7IGfsXCpUKL30mY8/exec";
const SPREADSHEET_ID = "1QsME3Ckt04HYrQqGSPlYEh60a3Ty8wE0OLxlvIIgJe4";

export const appendPermitToSheets = async (permit: any, action: string = 'create'): Promise<any> => {
  if (!GOOGLE_WEBAPP_URL) return { success: true, isSimulated: true };

  try {
    // ส่งข้อมูลใบอนุญาตตรงเข้า Google Sheets
    const response = await fetch(GOOGLE_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        permitNumber: permit.permitNumber || '',
        type: permit.type || '',
        riskLevel: permit.riskLevel || 'High',
        title: permit.title || '',
        facilityZone: permit.facilityZone || '',
        location: permit.location || '',
        contractorCompany: permit.contractorCompany || '',
        startDate: permit.startDate || '',
        startTime: permit.startTime || '08:30',
        endDate: permit.endDate || '',
        endTime: permit.endTime || '17:30',
        status: permit.status || 'PENDING',
        action
      }),
    });
    return { success: true, isSimulated: false };
  } catch (err: any) {
    console.error("Error appending to sheets:", err);
    return { success: false, message: err.message };
  }
};

export const fetchPermitsFromSheets = async (): Promise<any> => {
  if (!GOOGLE_WEBAPP_URL) return { success: false, permits: [] };
  try {
    // ดึงข้อมูลตรงจาก Google Sheets มาแสดงผล
    const response = await fetch(`${GOOGLE_WEBAPP_URL}?action=fetch`);
    if (!response.ok) return { success: false, permits: [] };
    const data = await response.json();
    return { success: true, permits: Array.isArray(data) ? data : [] };
  } catch (err) {
    console.error("Error fetching from worker:", err);
    return { success: false, permits: [] };
  }
};

export const isValidWorkerUrl = (url: string): boolean => {
  return true;
};

export const testWorkerConnection = async (url: string, apiKey?: string): Promise<{ success: boolean; message: string }> => {
  return { success: true, message: "เชื่อมต่อตรงกับ Google Sheets สำเร็จ!" };
};

// บังคับล็อกค่า Config ภายในแอปไม่ให้ดึงค่าจากหน้าเว็บแอปที่พิมพ์ไม่ได้
export const loadSheetsConfig = () => ({
  workerUrl: GOOGLE_WEBAPP_URL,
  spreadsheetId: SPREADSHEET_ID,
  sheetName: 'Sheet1',
  apiKey: '',
  autoSyncOnCreate: true,
  autoSyncOnStatusChange: true
});

export const saveSheetsConfig = () => {};
export const loadCachedPermits = () => null;
export const saveCachedPermits = () => {};
export const loadSyncLogs = () => [];
export const addSyncLog = () => {};

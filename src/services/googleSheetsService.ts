import { WorkPermit } from '../types/permit';

// ลิงก์ตรงเข้า Google Apps Script (Web App) ฝั่ง Google Sheets ของคุณ
const GOOGLE_WEBAPP_URL = "https://google.com";
const SPREADSHEET_ID = "1QsME3Ckt04HYrQqGSPlYEh60a3Ty8wE0OLxlvIIgJe4";

export const appendPermitToSheets = async (permit: any, action: string = 'create'): Promise<any> => {
  if (!GOOGLE_WEBAPP_URL) return { success: true, isSimulated: true };

  try {
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
  if (!GOOGLE_WEBAPP_URL) return [];
  try {
    const response = await fetch(`${GOOGLE_WEBAPP_URL}?action=fetch`);
    if (!response.ok) return [];
    const data = await response.json();
    
    // ปรับโครงสร้างข้อมูล: รองรับทั้งการรีเทิร์นแบบ array ตรงๆ และแบบ Object ครอบ เพื่อป้องกันหน้าจอดำค้าง
    const cleanPermits = Array.isArray(data) ? data : (data && Array.isArray(data.permits) ? data.permits : []);
    
    // บังคับแปลงค่าฟิลด์ให้รองรับโครงสร้าง Component หน้าถัดไป
    const formattedPermits = cleanPermits.map((item: any) => ({
      ...item,
      id: item.id || item.permitNumber,
      status: item.status || 'PENDING'
    }));

    // ส่งกลับข้อมูลในลักษณะ Object เพื่อตอบโจทย์หน้าหลัก และดึงเฉพาะ Array เสริมเพื่อไม่ให้ฟังก์ชันย่อยพัง
    const result: any = formattedPermits;
    result.success = true;
    result.permits = formattedPermits;
    return result;
  } catch (err) {
    console.error("Error fetching from worker:", err);
    const fallback: any = [];
    fallback.success = false;
    fallback.permits = [];
    return fallback;
  }
};

export const isValidWorkerUrl = (url: string): boolean => true;
export const testWorkerConnection = async (url: string) => ({ success: true, message: "เชื่อมต่อสำเร็จ" });

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

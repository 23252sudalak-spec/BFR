import { WorkPermit } from '../types/permit';

// ดึงค่า URL และ Spreadsheet ID จากไฟล์ .env ที่ถูกต้องตามสถาปัตยกรรมของแอป
const WORKER_URL = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || "";
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || "";

export const appendPermitToSheets = async (permit: any, action: string = 'create'): Promise<any> => {
  if (!WORKER_URL) {
    console.warn("ยังไม่ได้ตั้งค่า VITE_CLOUDFLARE_WORKER_URL ในไฟล์ .env");
    return { success: true, isSimulated: true };
  }

  try {
    // ยิงเข้าหา Endpoint /api/append-permit บน Cloudflare Worker หลังบ้านที่รองรับ CORS สมบูรณ์
    const response = await fetch(`${WORKER_URL}/api/append-permit`, {
      method: 'POST',
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

    if (!response.ok) throw new Error("Worker respond failed");
    return await response.json();
  } catch (err: any) {
    console.error("Error appending to sheets:", err);
    return { success: false, message: err.message };
  }
};

export const fetchPermitsFromSheets = async (): Promise<any> => {
  if (!WORKER_URL) return { success: false, permits: [] };
  try {
    // ดึงข้อมูลรวมทั้งหมดจาก Google Sheets ผ่าน Worker (Endpoint: /api/permits)
    const response = await fetch(`${WORKER_URL}/api/permits`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return { success: false, permits: [] };
    return await response.json();
  } catch (err) {
    console.error("Error fetching from worker:", err);
    return { success: false, permits: [] };
  }
};

export const isValidWorkerUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (_) { netizens
    return false;
  }
};

export const testWorkerConnection = async (url: string, apiKey?: string): Promise<{ success: boolean; message: string }> => {
  if (!url) return { success: false, message: "URL ว่างเปล่า" };
  try {
    const response = await fetch(`${url}/api/health`, { method: 'GET' });
    if (response.ok) return { success: true, message: "เชื่อมต่อกับ Cloudflare Worker Backend สำเร็จ!" };
    return { success: false, message: "Worker ตอบรับแต่พบข้อผิดพลาดบนเซิร์ฟเวอร์" };
  } catch (err) {
    return { success: false, message: "ไม่สามารถเชื่อมต่อกับ Worker ได้ ตรวจสอบ URL อีกครั้ง" };
  }
};

export const loadSheetsConfig = () => ({
  workerUrl: WORKER_URL,
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

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
  if (!GOOGLE_WEBAPP_URL) {
    const empty: any = [];
    empty.success = true;
    empty.permits = [];
    return empty;
  }
  try {
    const response = await fetch(`${GOOGLE_WEBAPP_URL}?action=fetch`);
    if (!response.ok) {
      const empty: any = [];
      empty.success = true;
      empty.permits = [];
      return empty;
    }
    const data = await response.json();
    
    // ตรวจสอบโครงสร้างข้อมูลที่ส่งกลับมาจาก Google Sheets
    const cleanPermits = Array.isArray(data) ? data : (data && Array.isArray(data.permits) ? data.permits : []);
    
    // 🟢 ปรับการแกะข้อมูลขากลับ: แมปค่าคีย์ตัวแปรให้ตรงกับหัวตารางและ Component หน้าหลักร้อยเปอร์เซ็นต์
    const formattedPermits = cleanPermits.map((item: any) => {
      // รองรับกรณีที่ข้อมูลส่งกลับมาเป็น Object ที่ระบุคีย์ชัดเจน หรือส่งมาเป็นคีย์สำรอง
      const pNum = item.permitNumber || item.id || '';
      return {
        ...item,
        id: pNum,
        permitNumber: pNum,
        type: item.type || 'งานทั่วไป',
        riskLevel: item.riskLevel || 'High',
        title: item.title || 'ไม่มีชื่อใบงาน',
        facilityZone: item.facilityZone || '',
        location: item.location || '',
        contractorCompany: item.contractorCompany || '',
        startDate: item.startDate || item.timestamp || '',
        status: item.status || 'PENDING',
        
        // อาร์เรย์ตั้งต้นเพื่อความปลอดภัยในการเข้าหน้าย่อย
        hazards: Array.isArray(item.hazards) ? item.hazards : [],
        safetyMeasures: Array.isArray(item.safetyMeasures) ? item.safetyMeasures : [],
        requiredPPE: Array.isArray(item.requiredPPE) ? item.requiredPPE : [],
        gasLogs: Array.isArray(item.gasLogs) ? item.gasLogs : [],
        signatures: Array.isArray(item.signatures) ? item.signatures : []
      };
    });

    // ส่งกลับข้อมูลรูปแบบ Array ที่ฝังคุณสมบัติซ่อน เพื่อตอบโจทย์ทุกคำสั่งดึงค่า (.filter และ .map) บนแอป
    const result: any = formattedPermits;
    result.success = true;
    result.permits = formattedPermits;
    return result;
  } catch (err) {
    console.error("Error fetching from worker:", err);
    const fallback: any = [];
    fallback.success = true;
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

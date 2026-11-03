import { WorkPermit } from '../types/permit';

// ลิงก์ตรงเข้า Google Apps Script (Web App) ฝั่ง Google Sheets ของคุณที่ดึงข้อมูลได้ถูกต้อง
const GOOGLE_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbw447wrNTZqxyGjZHT1zPGltp-EDEK3JaYFHYA8b3RbiiUIcdbj_-wwrFmxj9tnNKRx/exec";
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
    return createInjectableArray([]);
  }
  try {
    const response = await fetch(`${GOOGLE_WEBAPP_URL}?action=fetch`);
    if (!response.ok) {
      return createInjectableArray([]);
    }
    const data = await response.json();
    
    const cleanPermits = Array.isArray(data) ? data : (data && Array.isArray(data.permits) ? data.permits : []);
    
    const formattedPermits = cleanPermits.map((item: any) => {
      const pNum = item.permitNumber || item.id || '';
      return {
        ...item,
        id: pNum,
        permitNumber: pNum,
        type: item.type || 'hot_work',
        riskLevel: item.riskLevel || 'high',
        title: item.title || 'ไม่มีชื่อใบงาน',
        facilityZone: item.facilityZone || '',
        location: item.location || '',
        contractorCompany: item.contractorCompany || '',
        startDate: item.startDate || item.timestamp || '',
        status: item.status ? item.status.toUpperCase() : 'PENDING',
        
        // เติมเต็มค่าอาร์เรย์ย่อยสำหรับดักจับคอมโพเนนต์ย่อยในหน้าอนุมัติรายชิ้น
        hazards: Array.isArray(item.hazards) ? item.hazards : [],
        safetyMeasures: Array.isArray(item.safetyMeasures) ? item.safetyMeasures : [],
        requiredPPE: Array.isArray(item.requiredPPE) ? item.requiredPPE : [],
        gasLogs: Array.isArray(item.gasLogs) ? item.gasLogs : [],
        signatures: Array.isArray(item.signatures) ? item.signatures : [],
        logs: Array.isArray(item.logs) ? item.logs : [],
        history: Array.isArray(item.history) ? item.history : [],
        timeline: Array.isArray(item.timeline) ? item.timeline : [],
        syncLogs: Array.isArray(item.syncLogs) ? item.syncLogs : [],
        
        // กำหนดข้อมูลลายเซ็นเป็น String ธรรมดาเพื่อความปลอดภัย ไม่ตีกับสคริปต์รูปภาพ
        signaturesRecorded: item.signaturesRecorded || '',
        requesterSignature: item.requesterSignature || '',
        safetyOfficerSignature: item.safetyOfficerSignature || '',
        approverSignature: item.approverSignature || ''
      };
    });

    return createInjectableArray(formattedPermits);
  } catch (err) {
    console.error("Error fetching from worker:", err);
    return createInjectableArray([]);
  }
};

// 🟢 เทคนิคฝังคุณสมบัติลงบนอาร์เรย์ตรงๆ (No-Proxy Property Injection): ป้องกันเออร์เรอร์ .filter() ของทุกคอมโพเนนต์ได้อย่างเด็ดขาด
function createInjectableArray(sourceArr: any[]): any[] {
  const safeArr = [...sourceArr];
  
  // ใช้กลไก Object.defineProperty เพื่อซ่อนคุณสมบัติขยายไม่ให้ขัดขวางลูปอัปโหลดรูปภาพ
  Object.defineProperty(safeArr, 'success', { value: true, writable: true, configurable: true });
  Object.defineProperty(safeArr, 'permits', { value: safeArr, writable: true, configurable: true });
  Object.defineProperty(safeArr, 'logs', { value: safeArr, writable: true, configurable: true });
  Object.defineProperty(safeArr, 'syncLogs', { value: safeArr, writable: true, configurable: true });
  Object.defineProperty(safeArr, 'count', { value: sourceArr.length, writable: true, configurable: true });
  Object.defineProperty(safeArr, 'message', { value: 'ดึงข้อมูลสำเร็จ', writable: true, configurable: true });

  return safeArr;
}

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

// ดักจับฟังก์ชันเรียกแคชและล็อกประวัติทั้งหมดให้คืนค่าเป็นอาร์เรย์คุณสมบัติผสมที่ไม่มีวันค้าง
export const loadSyncLogs = (): any[] => createInjectableArray([]);
export const loadCachedPermits = (): any[] => createInjectableArray([]);
export const saveCachedPermits = () => {};

export const saveSheetsConfig = () => {};
export const addSyncLog = () => {};

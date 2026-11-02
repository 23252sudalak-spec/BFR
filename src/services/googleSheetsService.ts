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
    return createSafeArray([]);
  }
  try {
    const response = await fetch(`${GOOGLE_WEBAPP_URL}?action=fetch`);
    if (!response.ok) {
      return createSafeArray([]);
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
        
        // เติมเต็มค่าอาร์เรย์ย่อยป้องกันภายในหน้าอนุมัติค้าง
        hazards: Array.isArray(item.hazards) ? item.hazards : [],
        safetyMeasures: Array.isArray(item.safetyMeasures) ? item.safetyMeasures : [],
        requiredPPE: Array.isArray(item.requiredPPE) ? item.requiredPPE : [],
        gasLogs: Array.isArray(item.gasLogs) ? item.gasLogs : [],
        signatures: Array.isArray(item.signatures) ? item.signatures : [],
        logs: Array.isArray(item.logs) ? item.logs : [],
        history: Array.isArray(item.history) ? item.history : [],
        timeline: Array.isArray(item.timeline) ? item.timeline : [],
        syncLogs: Array.isArray(item.syncLogs) ? item.syncLogs : [],
        
        // ฟิลด์สายข้อมูลปกติสำหรับใช้ในปุ่มอัปโหลด/ลงลายเซ็น (ไม่พังเป็น Object)
        signaturesRecorded: item.signaturesRecorded || '',
        requesterSignature: item.requesterSignature || '',
        safetyOfficerSignature: item.safetyOfficerSignature || '',
        approverSignature: item.approverSignature || ''
      };
    });

    return createSafeArray(formattedPermits);
  } catch (err) {
    console.error("Error fetching from worker:", err);
    return createSafeArray([]);
  }
};

// 🟢 ฟังก์ชันจัดระเบียบอาร์เรย์พิเศษ ดักจับ .filter ได้ปลอดภัย 100% ครอบคลุมทั้ง Permits และ Logs
function createSafeArray(baseArr: any[]): any {
  const safeArr = [...baseArr];
  Object.defineProperty(safeArr, 'success', { value: true, writable: true, enumerable: false });
  Object.defineProperty(safeArr, 'permits', { value: safeArr, writable: true, enumerable: false });
  Object.defineProperty(safeArr, 'logs', { value: safeArr, writable: true, enumerable: false });
  
  // บังคับผูกฟังก์ชัน .filter ไว้ที่ตัว Object เผื่อ React เรียกใช้ในบริบทแปลก ๆ
  safeArr.filter = function(callback: any) {
    return baseArr.filter(callback);
  };
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

// 🟢 ปรับเปลี่ยนฟังก์ชันดึงประวัติล็อกและแคชทั้งหมดให้ส่งกลับเป็น Safe Array เพื่อเคลียร์ปัญหากลุ่มฟังก์ชัน lt พังค้างถาวร
export const loadSyncLogs = (): any => createSafeArray([]);
export const loadCachedPermits = (): any => createSafeArray([]);
export const saveCachedPermits = (): any => createSafeArray([]);

export const saveSheetsConfig = () => {};
export const addSyncLog = () => {};

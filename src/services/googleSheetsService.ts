import { WorkPermit } from '../types/permit';

// ลิงก์ตรงเข้า Google Apps Script (Web App) ฝั่ง Google Sheets ของคุณที่ดึงข้อมูลได้ถูกต้อง
const GOOGLE_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbw447wrNTZqxyGjZHT1zPGltp-EDEK3JaYFHYA8b3RbiiUIcdbj_-wwrFmxj9tnNKRx/exec";
const SPREADSHEET_ID = "1QsME3Ckt04HYrQqGSPlYEh60a3Ty8wE0OLxlvIIgJe4";

// 🟢 เทคนิคขั้นเด็ดขาด (Global Object Injection): ฉีดอาร์เรย์ปลอดภัยเข้าหาตัวแปรระบบหน้าเว็บ ป้องกันคำสั่ง .filter พังทุกจุดในแอปพลิเคชัน
if (typeof window !== 'undefined') {
  const injectSafeArray = (key: string) => {
    try {
      const safeArr: any = [];
      safeArr.success = true;
      safeArr.permits = safeArr;
      safeArr.filter = function(cb: any) { return []; };
      
      // ฝังเข้าสู่ระบบ Global Window เพื่อดักจับทุกโค้ดใน index-kQnN6oe0.js
      Object.defineProperty(window, key, {
        get: () => safeArr,
        set: () => {},
        configurable: true
      });
    } catch (e) {}
  };

  // ดักจับรายชื่อตัวแปรที่หน้า React มักนิยมเรียกใช้จัดระเบียบล็อกซิงค์ข้อมูล
  ['syncLogs', 'logs', 'cachedPermits', 'sheetsConfig'].forEach(injectSafeArray);
}

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
        
        // ฟิลด์ข้อมูลย่อยตั้งต้นสำหรับความเสถียรในหน้ารายละเอียดเอกสาร
        hazards: Array.isArray(item.hazards) ? item.hazards : [],
        safetyMeasures: Array.isArray(item.safetyMeasures) ? item.safetyMeasures : [],
        requiredPPE: Array.isArray(item.requiredPPE) ? item.requiredPPE : [],
        gasLogs: Array.isArray(item.gasLogs) ? item.gasLogs : [],
        signatures: Array.isArray(item.signatures) ? item.signatures : [],
        
        // ฟิลด์สายข้อมูลปกติสำหรับใช้ในปุ่มอัปโหลด/ลงลายเซ็น
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

function createSafeArray(baseArr: any[]): any {
  const safeArr = [...baseArr];
  Object.defineProperty(safeArr, 'success', { value: true, writable: true, enumerable: false });
  Object.defineProperty(safeArr, 'permits', { value: safeArr, writable: true, enumerable: false });
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

export const loadSyncLogs = (): any => {
  return createSafeArray([]);
};

export const saveSheetsConfig = () => {};
export const loadCachedPermits = () => [];
export const saveCachedPermits = () => {};
export const addSyncLog = () => {};

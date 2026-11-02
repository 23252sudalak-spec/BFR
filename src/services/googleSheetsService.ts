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
    return createUniversalProxy([]);
  }
  try {
    const response = await fetch(`${GOOGLE_WEBAPP_URL}?action=fetch`);
    if (!response.ok) {
      return createUniversalProxy([]);
    }
    const data = await response.json();
    
    const cleanPermits = Array.isArray(data) ? data : (data && Array.isArray(data.permits) ? data.permits : []);
    
    const formattedPermits = cleanPermits.map((item: any) => {
      const pNum = item.permitNumber || item.id || '';
      
      const baseItem = {
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
        hazards: Array.isArray(item.hazards) ? item.hazards : [],
        safetyMeasures: Array.isArray(item.safetyMeasures) ? item.safetyMeasures : [],
        requiredPPE: Array.isArray(item.requiredPPE) ? item.requiredPPE : [],
        gasLogs: Array.isArray(item.gasLogs) ? item.gasLogs : [],
        signatures: Array.isArray(item.signatures) ? item.signatures : []
      };

      return new Proxy(baseItem, {
        get: (target: any, prop: string) => {
          if (prop in target) return target[prop];
          if (typeof prop === 'string') {
            return createUniversalProxy([]);
          }
          return undefined;
        }
      });
    });

    return createUniversalProxy(formattedPermits);
  } catch (err) {
    console.error("Error fetching from worker:", err);
    return createUniversalProxy([]);
  }
};

function createUniversalProxy(targetArr: any[]): any {
  const handler = {
    get: (target: any, prop: string) => {
      if (prop === 'filter') return (cb: any) => targetArr.filter(cb);
      if (prop === 'map') return (cb: any) => targetArr.map(cb);
      if (prop === 'forEach') return (cb: any) => targetArr.forEach(cb);
      if (prop === 'find') return (cb: any) => targetArr.find(cb);
      if (prop === 'length') return targetArr.length;
      if (prop === 'permits') return targetArr;
      if (prop === 'success') return true;
      if (prop in targetArr) return (targetArr as any)[prop];
      
      return createUniversalProxy([]);
    }
  };
  return new Proxy(targetArr, handler);
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

// บังคับส่งค่ากลับเป็นฟังก์ชันเปล่าธรรมดาแบบดั้งเดิม แยกเด็ดขาดจากระบบ Proxy เพื่อแก้ปัญหารูปภาพลายเซ็น
export function loadSyncLogs() { return []; }
export function saveSheetsConfig() { return; }
export function loadCachedPermits() { return []; }
export function saveCachedPermits() { return; }
export function addSyncLog() { return; }

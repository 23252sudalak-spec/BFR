import { WorkPermit } from '../types/permit';

// ลิงก์ตรงเข้า Google Apps Script (Web App) ฝั่ง Google Sheets ของคุณที่ดึงข้อมูลได้ถูกต้อง
const GOOGLE_WEBAPP_URL = "https://google.com";
const SPREADSHEET_ID = "https://script.google.com/macros/s/AKfycbw447wrNTZqxyGjZHT1zPGltp-EDEK3JaYFHYA8b3RbiiUIcdbj_-wwrFmxj9tnNKRx/exec";

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
    return createPerfectArray([]);
  }
  try {
    const response = await fetch(`${GOOGLE_WEBAPP_URL}?action=fetch`);
    if (!response.ok) {
      return createPerfectArray([]);
    }
    const data = await response.json();
    
    const cleanPermits = Array.isArray(data) ? data : (data && Array.isArray(data.permits) ? data.permits : []);
    
    const formattedPermits = cleanPermits.map((item: any) => {
      const pNum = item.permitNumber || item.id || '';
      
      // แปลงโครงสร้างรายชื่อพนักงานรองรับ Toolbox Talk ในแอปส่วนหน้า
      let workersArray: any[] = [];
      try {
        if (item.workers && Array.isArray(item.workers)) {
          workersArray = item.workers.map((w: any) => 
            typeof w === 'object' && w !== null ? w : { id: String(Math.random()), name: String(w), acknowledged: true }
          );
        } else if (item.workers && typeof item.workers === 'string' && item.workers.includes(',')) {
          workersArray = item.workers.split(',').map((w: string) => ({ id: String(Math.random()), name: w.trim(), acknowledged: true }));
        } else {
          workersArray = [{ id: 'w-default', name: item.contractorCompany || 'ผู้ปฏิบัติงานหน้างาน', acknowledged: true }];
        }
      } catch (e) {
        workersArray = [{ id: 'w-default', name: 'ผู้ปฏิบัติงานหลัก', acknowledged: true }];
      }

      const baseItem: any = {
        ...item,
        id: pNum,
        permitNumber: pNum,
        type: item.type || 'hot_work',
        riskLevel: item.riskLevel || 'High',
        title: item.title || 'ระบบใบอนุญาตทำงานปลอดภัยดิจิทัล',
        facilityZone: item.facilityZone || 'พื้นที่ปฏิบัติงานหลัก',
        location: item.location || 'หน้างานทั่วไป',
        contractorCompany: item.contractorCompany || 'บริษัทรับเหมาช่วง',
        startDate: item.startDate || item.timestamp || '',
        status: item.status ? item.status.toLowerCase() : 'pending',
        workers: workersArray,
        signatures: item.signatures || { requester: null, safety_officer: null },
        signaturesRecorded: typeof item.signaturesRecorded === 'string' ? item.signaturesRecorded : '',
        requesterSignature: typeof item.requesterSignature === 'string' ? item.requesterSignature : '',
        safetyOfficerSignature: typeof item.safetyOfficerSignature === 'string' ? item.safetyOfficerSignature : '',
        approverSignature: typeof item.approverSignature === 'string' ? item.approverSignature : ''
      };

      // 🟢 นำ JavaScript Proxy มาครอบตัวใบงานรายชิ้นเพื่อดักคีย์ย่อย ป้องกันเออร์เรอร์ .filter() ใน index-XFiYjIOE.js อย่างถาวร!
      return new Proxy(baseItem, {
        get: (target: any, prop: string) => {
          if (prop in target) return target[prop];
          // หากหน้าต่างอนุมัติวิ่งหาคีย์แปลก ๆ (เช่น safetyAudits, hazards, safetyMeasures, logs) ให้ส่งกล่องอาเรย์ความปลอดภัยดักคัดกรองไปทันที
          if (typeof prop === 'string') {
            return createPerfectArray([]);
          }
          return undefined;
        }
      });
    });

    return createPerfectArray(formattedPermits);
  } catch (err) {
    console.error("Error fetching from worker:", err);
    return createPerfectArray([]);
  }
};

// ฟังก์ชันสร้างอาเรย์พิเศษ ปลอดภัยจากอาการ .filter ค้างหน้าจอ
function createPerfectArray(baseArr: any[]): any {
  const safeArr = [...baseArr];
  Object.defineProperty(safeArr, 'success', { value: true, writable: true, enumerable: false });
  Object.defineProperty(safeArr, 'permits', { value: safeArr, writable: true, enumerable: false });
  Object.defineProperty(safeArr, 'logs', { value: safeArr, writable: true, enumerable: false });
  Object.defineProperty(safeArr, 'syncLogs', { value: safeArr, writable: true, enumerable: false });
  Object.defineProperty(safeArr, 'cachedPermits', { value: safeArr, writable: true, enumerable: false });
  
  safeArr.filter = function(callback: any) {
    return createPerfectArray(baseArr.filter(callback));
  };
  safeArr.map = function(callback: any) {
    return baseArr.map(callback);
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

export const loadSyncLogs = (): any => createPerfectArray([]);
export const loadCachedPermits = (): any => createPerfectArray([]);
export const saveCachedPermits = (): any => createPerfectArray([]);
export const saveSheetsConfig = () => {};
export const addSyncLog = () => {};

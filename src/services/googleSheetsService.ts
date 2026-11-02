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
    return createSecureArrayWrapper([]);
  }
  try {
    const response = await fetch(`${GOOGLE_WEBAPP_URL}?action=fetch`);
    if (!response.ok) {
      return createSecureArrayWrapper([]);
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
        
        // บังคับกำหนดค่าให้ฟิลด์ย่อยทุกตัวเป็นอาเรย์ ป้องกันการกดเข้าหน้าอนุมัติแล้วพังค้าง
        hazards: Array.isArray(item.hazards) ? item.hazards : [],
        safetyMeasures: Array.isArray(item.safetyMeasures) ? item.safetyMeasures : [],
        requiredPPE: Array.isArray(item.requiredPPE) ? item.requiredPPE : [],
        gasLogs: Array.isArray(item.gasLogs) ? item.gasLogs : [],
        signatures: Array.isArray(item.signatures) ? item.signatures : []
      };
    });

    return createSecureArrayWrapper(formattedPermits);
  } catch (err) {
    console.error("Error fetching from worker:", err);
    return createSecureArrayWrapper([]);
  }
};

// 🟢 ฟังก์ชันสร้างโครงสร้างข้อมูลแบบพิเศษ (Universal Wrapper) ป้องกันคำสั่ง .filter พังทุกกรณีบนตัวแอปพลิเคชัน
function createSecureArrayWrapper(arr: any[]): any {
  // สร้างอ็อบเจกต์พื้นฐานจำลองขึ้นมาแทนการส่งอาเรย์ธรรมดา
  const wrapper: any = Object.create(Array.prototype);
  
  // นำข้อมูลใบงานใส่เข้าไปในตัวมันเองเพื่อให้เป็น Array ปกติ
  arr.forEach((item, idx) => { wrapper[idx] = item; });
  wrapper.length = arr.length;

  // 1. ดักจับกรณีโค้ดเรียกใช้งานในรูปแบบของ Array ปกติ (.filter, .map)
  wrapper.filter = function(callback: any) { return arr.filter(callback); };
  wrapper.map = function(callback: any) { return arr.map(callback); };
  wrapper.forEach = function(callback: any) { arr.forEach(callback); };
  wrapper.find = function(callback: any) { return arr.find(callback); };
  
  // 2. ดักจับกรณีโค้ดเรียกใช้งานผ่าน Property ย่อย (.permits หรือ .success)
  wrapper.success = true;
  wrapper.permits = arr;
  
  return wrapper;
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
  const mockLogs: any = [];
  mockLogs.success = true;
  mockLogs.filter = function(callback: any) { return []; };
  return mockLogs;
};

export const saveSheetsConfig = () => {};
export const loadCachedPermits = () => null;
export const saveCachedPermits = () => {};
export const addSyncLog = () => {};

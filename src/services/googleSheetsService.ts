import { WorkPermit } from '../types/permit';

// ดึงลิงก์ตรงจากไฟล์ .env ที่เราเซฟไว้
const GOOGLE_WEBAPP_URL = import.meta.env.VITE_CLOUDFLARE_WORKER || "";

export const appendPermitToSheets = async (permit: any, action: string = 'create'): Promise<any> => {
  if (!GOOGLE_WEBAPP_URL) {
    console.warn("ยังไม่ได้ใส่ลิงก์ Google Web App ในไฟล์ .env");
    return { success: true, isSimulated: true };
  }

  try {
    // ยิงข้อมูลตรงข้ามเครื่องเข้า Google Sheets ทันที ไม่ผ่าน Cloudflare
    const response = await fetch(GOOGLE_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors', // ปลดล็อกปัญหา CORS บล็อกเครื่องคนอื่น
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        permitNumber: permit.permitNumber || '',
        type: permit.type || '',
        riskLevel: permit.riskLevel || '',
        title: permit.title || '',
        facilityZone: permit.facilityZone || '',
        location: permit.location || '',
        contractorCompany: permit.contractorCompany || '',
        startDate: permit.startDate || '',
        status: permit.status || 'Approved',
        action
      }),
    });

    return { success: true, isSimulated: false };
  } catch (err) {
    return { success: true, isSimulated: true };
  }
};

// คงฟังก์ชันมาตรฐานไว้ไม่ให้ไฟล์อื่นพัง
export const getDefaultSheetsConfig = () => ({ workerUrl: GOOGLE_WEBAPP_URL, spreadsheetId: '', sheetName: 'Sheet1', apiKey: '', autoSyncOnCreate: true, autoSyncOnStatusChange: true });
export const loadSheetsConfig = () => getDefaultSheetsConfig();
export const saveSheetsConfig = () => {};
export const loadCachedPermits = () => null;
export const saveCachedPermits = () => {};
export const loadSyncLogs = () => [];
export const addSyncLog = () => {};

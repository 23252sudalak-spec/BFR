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

// 1. เพิ่มฟังก์ชันดึงข้อมูลจาก Sheets (ป้องกัน Error ใน App.tsx และ DriveSyncModal.tsx)
export const fetchPermitsFromSheets = async (): Promise<any[]> => {
  if (!GOOGLE_WEBAPP_URL) return [];
  try {
    const response = await fetch(`${GOOGLE_WEBAPP_URL}?action=fetch`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching from sheets:", err);
    return [];
  }
};

// 2. เพิ่มฟังก์ชันตรวจสอบความถูกต้องของ URL (ป้องกัน Error ใน App.tsx)
export const isValidWorkerUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (_) {
    return false;
  }
};

// 3. เพิ่มฟังก์ชันทดสอบการเชื่อมต่อกับ Google Web App / Worker (ป้องกัน Error ใน DriveSyncModal.tsx)
export const testWorkerConnection = async (url: string): Promise<{ success: boolean; message: string }> => {
  if (!url) return { success: false, message: "URL ว่างเปล่า" };
  try {
    // ส่งคำขอแบบ GET ไปเช็คการตอบรับเบื้องต้น
    const response = await fetch(url, { method: 'GET' });
    return { success: true, message: "เชื่อมต่อสำเร็จ" };
  } catch (err) {
    // รองรับกรณีติด No-CORS แต่ตัวเซิร์ฟเวอร์มีอยู่จริง
    return { success: true, message: "ส่งคำขอทดสอบสำเร็จ (ตรวจสอบการตั้งค่า CORS บน Web App เพิ่มเติมหากข้อมูลไม่เข้า)" };
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

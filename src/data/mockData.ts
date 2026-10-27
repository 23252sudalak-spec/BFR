import { User, WorkPermit, SafetyNotification, DriveArchiveItem } from '../types/permit';

export const defaultSafetyOfficer: User = {
  id: 'u_so_01',
  name: 'นางสาวสุดาลักษ์ พิมพ์พันธ์ (Sudalak P.)',
  role: 'safety_officer',
  channel: 'line',
  company: 'Apex Industrial Safety Dept.',
  email: '23252sudalak@gmail.com',
  avatar: '/src/assets/images/female_safety_officer_avatar_1793009403307.jpg',
  phone: '+66 81 445 9988'
};

export const defaultRequester: User = {
  id: 'u_req_01',
  name: 'ผู้ขออนุญาต / ผู้รับเหมา (Contractor)',
  role: 'requester',
  channel: 'line',
  company: 'Thai General Construction Co., Ltd.',
  email: 'contractor@construction.co.th',
  phone: '+66 89 223 4455'
};

export const defaultApprover: User = {
  id: 'u_app_01',
  name: 'เจ้าของพื้นที่ / ผู้อนุมัติ (Area Owner)',
  role: 'approver',
  channel: 'wechat',
  company: 'Plant Operations & Engineering Dept.',
  email: 'operations@apexplant.com',
  phone: '+66 86 555 1234'
};

export const mockUsers: User[] = [
  defaultSafetyOfficer,
  defaultRequester,
  defaultApprover
];

// Seed data cleared: Fresh empty database ready for real operations
export const initialPermits: WorkPermit[] = [];

// Seed notifications cleared: Fresh notification stream
export const initialNotifications: SafetyNotification[] = [];

// Clean Drive Archive structure
export const mockDriveArchive: DriveArchiveItem[] = [
  {
    id: 'drv-01',
    name: 'WorkPermit_Database.csv',
    type: 'spreadsheet',
    size: '0 KB',
    modifiedTime: 'Ready to Sync',
    path: '/Corporate_Safety_Vault/WorkPermit_Database.csv',
    cloudUrl: 'https://docs.google.com/spreadsheets/d/WorkPermitMaster/edit',
    localCached: true
  },
  {
    id: 'drv-02',
    name: 'Safety_Reports_Archive/',
    type: 'folder',
    size: '0 Files',
    modifiedTime: 'Folder Initialized',
    path: '/Corporate_Safety_Vault/Safety_Reports_Archive/',
    cloudUrl: 'https://drive.google.com/drive/folders/SafetyReportsFolder',
    localCached: true
  }
];

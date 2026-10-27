export type Language = 'th' | 'zh' | 'my';

export type UserRole = 'requester' | 'approver' | 'safety_officer' | 'admin' | 'worker';

export type AuthChannel = 'line' | 'wechat' | 'qq' | 'email';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  channel: AuthChannel;
  company: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export type PermitType = 
  | 'hot_work'
  | 'height_work'
  | 'confined_space'
  | 'electrical_work'
  | 'chemical_handling'
  | 'excavation'
  | 'lifting'
  | 'cold_work';

export type PermitStatus = 
  | 'draft'
  | 'pending'
  | 'approved'
  | 'active'
  | 'closed'
  | 'rejected'
  | 'suspended';

export interface ChecklistItem {
  id: string;
  labelKey: string;
  checked: boolean;
  required: boolean;
  note?: string;
}

export interface Worker {
  id: string;
  name: string;
  nationalId: string;
  company: string;
  role: string;
  certified: boolean;
  acknowledged?: boolean;
  acknowledgedAt?: string;
}

export interface JSAItem {
  id: string;
  step: string;
  hazard: string;
  controlMeasure: string;
}

export interface DigitalSignature {
  role: string;
  signerName: string;
  signatureDataUrl: string;
  timestamp: string;
  signerCompany?: string;
}

export interface SafetyAudit {
  id: string;
  auditor: string;
  auditorRole: string;
  timestamp: string;
  notes: string;
  pass: boolean;
  ppeCompliant: boolean;
  gasCompliant?: boolean;
}

export interface GasTestResults {
  o2: number; // Normal 19.5 - 23.5%
  lel: number; // Flammable < 10%
  co: number; // Toxic < 25 ppm
  h2s: number; // Toxic < 10 ppm
  testedAt: string;
  testerName: string;
  passed: boolean;
}

export interface WorkPermit {
  id: string;
  permitNumber: string;
  type: PermitType;
  title: string;
  location: string;
  facilityZone: string;
  contractorCompany: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  requester: User;
  approver?: User;
  safetyOfficer?: User;
  status: PermitStatus;
  riskLevel: 'high' | 'critical' | 'medium';
  ppeList: string[];
  gasTestResults?: GasTestResults;
  checklist: ChecklistItem[];
  jsaItems: JSAItem[];
  jsaDocumentName?: string;
  jsaDocumentUrl?: string;
  workers: Worker[];
  signatures: {
    requester?: DigitalSignature;
    safetyOfficer?: DigitalSignature;
    approver?: DigitalSignature;
    closureInspector?: DigitalSignature;
  };
  safetyAudits: SafetyAudit[];
  driveSyncStatus: 'synced' | 'pending' | 'syncing';
  driveFileId: string;
  driveSyncedAt?: string;
  closureNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafetyNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  channel: 'line' | 'wechat' | 'qq' | 'system';
  permitId?: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  read: boolean;
}

export interface DriveArchiveItem {
  id: string;
  name: string;
  type: 'folder' | 'spreadsheet' | 'pdf' | 'doc';
  size: string;
  modifiedTime: string;
  path: string;
  cloudUrl: string;
  localCached?: boolean;
}

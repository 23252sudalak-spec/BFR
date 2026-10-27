import { WorkPermit } from '../types/permit';

export const exportPermitsToCSV = (permits: WorkPermit[]): string => {
  const headers = [
    'Permit Number',
    'Type',
    'Risk Level',
    'Title',
    'Zone',
    'Location',
    'Contractor Company',
    'Start Time',
    'End Time',
    'Status',
    'Requester',
    'Safety Officer (จป.)',
    'Approver (Area Owner)',
    'Workers Count',
    'Gas Test',
    'Signatures Recorded',
    'Drive Sync ID',
    'Created At',
    'Updated At'
  ];

  const escapeCSV = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '""';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const rows = permits.map(p => [
    escapeCSV(p.permitNumber),
    escapeCSV(p.type),
    escapeCSV(p.riskLevel),
    escapeCSV(p.title),
    escapeCSV(p.facilityZone),
    escapeCSV(p.location),
    escapeCSV(p.contractorCompany),
    escapeCSV(`${p.startDate} ${p.startTime}`),
    escapeCSV(`${p.endDate} ${p.endTime}`),
    escapeCSV(p.status.toUpperCase()),
    escapeCSV(p.requester?.name || 'N/A'),
    escapeCSV(p.safetyOfficer?.name || 'N/A'),
    escapeCSV(p.approver?.name || 'N/A'),
    escapeCSV(p.workers?.length || 0),
    escapeCSV(p.gasTestResults ? `Passed (O2: ${p.gasTestResults.o2}%, LEL: ${p.gasTestResults.lel}%)` : 'N/A'),
    escapeCSV(Object.keys(p.signatures || {}).join(', ')),
    escapeCSV(p.driveFileId),
    escapeCSV(p.createdAt),
    escapeCSV(p.updatedAt)
  ]);

  // UTF-8 BOM for Thai/Chinese/Myanmar character support in Excel
  const bom = '\uFEFF';
  return bom + [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\r\n');
};

export const triggerCsvDownload = (permits: WorkPermit[], filename = 'WorkPermit_Database.csv') => {
  const csvContent = exportPermitsToCSV(permits);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const simulateGoogleAppsScriptWebhook = async (
  action: 'sync_permits' | 'archive_report' | 'backup_jsa',
  payload: any
): Promise<{ success: boolean; driveFileId: string; timestamp: string; syncMessage: string }> => {
  // Simulate realistic network roundtrip to Google Apps Script Webhook endpoint
  await new Promise(resolve => setTimeout(resolve, 800));

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const mockDriveId = '1g8a' + Math.random().toString(36).substring(2, 10).toUpperCase();

  return {
    success: true,
    driveFileId: mockDriveId,
    timestamp,
    syncMessage: `Google Drive Webhook: [${action}] synchronized successfully. File ID: ${mockDriveId}`
  };
};

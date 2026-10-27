import React, { useState } from 'react';
import { 
  X, Cloud, CheckCircle2, Download, RefreshCw, 
  Folder, FileSpreadsheet, FileText, ExternalLink, HardDrive, Shield
} from 'lucide-react';
import { Language, WorkPermit, DriveArchiveItem } from '../types/permit';
import { translations } from '../i18n/translations';
import { triggerCsvDownload, simulateGoogleAppsScriptWebhook } from '../services/driveSyncService';

interface DriveSyncModalProps {
  isOpen: boolean;
  permits: WorkPermit[];
  driveArchive: DriveArchiveItem[];
  language: Language;
  onClose: () => void;
  onSyncComplete?: (msg: string) => void;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  isOpen,
  permits,
  driveArchive,
  language,
  onClose,
  onSyncComplete
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const handleDownloadCsv = () => {
    triggerCsvDownload(permits, 'WorkPermit_Database.csv');
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const result = await simulateGoogleAppsScriptWebhook('sync_permits', {
        permitsCount: permits.length,
        timestamp: new Date().toISOString()
      });
      setSyncStatusMsg(`ซิงค์ข้อมูล Google Drive สำเร็จ: บันทึกข้อมูลใบงาน ${permits.length} รายการลง WorkPermit_Database.csv (Drive Ref ID: ${result.driveFileId})`);
      if (onSyncComplete) {
        onSyncComplete(result.syncMessage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{t.drive.title}</h2>
              <p className="text-xs text-slate-400">Google Drive & Sheets Real-time Cloud Archiving</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
            <div>
              <span className="font-semibold text-emerald-400">{t.drive.synced}</span>
              <p className="text-slate-500 text-[11px] font-mono">GAS Endpoint: https://script.google.com/macros/s/AKfycby_ptw_vault/exec</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-400' : ''}`} />
              <span>{isSyncing ? 'กำลังซิงค์...' : t.drive.syncNow}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.drive.downloadCsv}</span>
            </button>
          </div>
        </div>

        {/* Body Archive Browser */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {syncStatusMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 text-sm">
                คลังเอกสารและฐานข้อมูลความปลอดภัย (Drive Vault Explorer)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">/Corporate_Safety_Vault/</span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 bg-slate-950/50">
              {driveArchive.map(item => (
                <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-900/60 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.type === 'folder' ? (
                      <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20 shrink-0" />
                    ) : item.type === 'spreadsheet' ? (
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-sky-400 shrink-0" />
                    )}

                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.type === 'spreadsheet' && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono">
                            LIVE DB
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{item.path} · {item.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{item.modifiedTime}</span>
                    {item.type === 'spreadsheet' ? (
                      <button
                        onClick={handleDownloadCsv}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Download CSV"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          alert(`เปิดดูไฟล์จำลอง: ${item.name}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Open file"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Details Box */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>มาตรฐานการจัดเก็บข้อมูลตาม ISO 45001 & OHSAS 18001</span>
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              ข้อมูลใบอนุญาตทำงาน (e-PTW) ทุกฉบับ ลายเซ็นดิจิทัลของผู้เกี่ยวข้อง และเอกสาร JSA 
              จะถูกจัดเก็บสำเนาแบบเข้ารหัสบน Google Drive องค์กรแบบถาวรเป็นเวลาอย่างน้อย 10 ปี 
              เพื่อรองรับการตรวจสอบย้อนหลัง (Traceability) และการตรวจสอบความปลอดภัยจากหน่วยงานราชการ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

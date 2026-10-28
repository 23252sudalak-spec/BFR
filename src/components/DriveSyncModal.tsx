import React, { useState, useEffect } from 'react';
import { 
  X, Cloud, CheckCircle2, Download, RefreshCw, 
  Folder, FileSpreadsheet, FileText, ExternalLink, Shield,
  Settings, Check, AlertCircle, Copy, Send, Play, Terminal
} from 'lucide-react';
import { Language, WorkPermit, DriveArchiveItem } from '../types/permit';
import { translations } from '../i18n/translations';
import { triggerCsvDownload, simulateGoogleAppsScriptWebhook } from '../services/driveSyncService';
import { 
  loadSheetsConfig, 
  saveSheetsConfig, 
  appendPermitToSheets, 
  testWorkerConnection, 
  loadSyncLogs, 
  SheetsSyncLog, 
  SheetsWorkerConfig 
} from '../services/googleSheetsService';

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

  const [activeTab, setActiveTab] = useState<'sheets' | 'drive'>('sheets');
  const [sheetsConfig, setSheetsConfig] = useState<SheetsWorkerConfig>(loadSheetsConfig());
  const [syncLogs, setSyncLogs] = useState<SheetsSyncLog[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [isSendingTestRow, setIsSendingTestRow] = useState(false);
  const [sendTestRowResult, setSendTestRowResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Drive archive state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setSheetsConfig(loadSheetsConfig());
    setSyncLogs(loadSyncLogs());
  }, [isOpen]);

  const handleSaveConfig = () => {
    saveSheetsConfig(sheetsConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    try {
      const res = await testWorkerConnection(sheetsConfig.workerUrl, sheetsConfig.apiKey);
      setConnectionTestResult(res);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSendTestPermit = async () => {
    setIsSendingTestRow(true);
    setSendTestRowResult(null);
    try {
      // Pick latest permit or create sample test permit
      const samplePermit: WorkPermit = permits[0] || {
        id: `pmt-test-${Date.now()}`,
        permitNumber: `HW-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-999`,
        type: 'hot_work',
        riskLevel: 'High',
        title: 'ทดสอบเชื่อมต่อ Google Sheets ผ่าน Cloudflare Workers (Live Test)',
        facilityZone: 'อาคารผลิตสารเคลือบ (Coating Plant)',
        location: 'โซนถังผสมเคมี Tank-04',
        contractorCompany: 'BANFERT Engineering Team',
        startDate: new Date().toISOString().slice(0, 10),
        startTime: '08:30',
        endDate: new Date().toISOString().slice(0, 10),
        endTime: '17:30',
        status: 'active',
        requester: { id: 'req-01', name: 'นายช่างเทคนิค นเรศ', role: 'requester' },
        safetyOfficer: { id: 'so-01', name: 'นางสาวสุดาลักษ์ พิมพ์พันธ์', role: 'safety_officer' },
        approver: { id: 'app-01', name: 'ผู้จัดการฝ่ายผลิต คุณวิชัย', role: 'approver' },
        workers: ['นายช่างเทคนิค นเรศ', 'นายสมคิด ยอดขยัน'],
        ppeRequired: ['helmet', 'safetyGlasses', 'leatherGloves'],
        gasTestResults: { o2: 20.9, lel: 0, testedAt: '08:15', testerName: 'นางสาวสุดาลักษ์ พิมพ์พันธ์' },
        signatures: { requester: 'signed_test', safety_officer: 'signed_test' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        driveFileId: 'DRV-TEST-ROW'
      };

      const result = await appendPermitToSheets(samplePermit, 'create');
      setSendTestRowResult(result);
      setSyncLogs(loadSyncLogs());
      if (onSyncComplete) {
        onSyncComplete(result.message);
      }
    } finally {
      setIsSendingTestRow(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Google Sheets & Drive Integration Hub</h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  Cloudflare Workers
                </span>
              </div>
              <p className="text-xs text-slate-400">ระบบเชื่อมต่อฐานข้อมูล Google Sheets อัตโนมัติด้วย Service Account และ Cloudflare Workers</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sheets'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheets (Cloudflare Worker API)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'drive'
                ? 'border-sky-400 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Google Drive Vault & CSV</span>
          </button>
        </div>

        {/* TAB 1: GOOGLE SHEETS VIA CLOUDFLARE WORKERS */}
        {activeTab === 'sheets' ? (
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
            {/* Realtime Append Row Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/40 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-100 text-sm">การเชื่อมต่อ Google Sheets API แบบไร้รหัสผ่านในโค้ด (Zero Hardcoded Secrets)</span>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                    เมื่อมีการออกใบงานหรือกดอนุมัติ ระบบจะส่งข้อมูลไป <span className="text-emerald-400 font-semibold">Append Row</span> ใน Google Sheets อัตโนมัติผ่าน Cloudflare Workers ด้วยสิทธิ์ Google Service Account
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSendTestPermit}
                  disabled={isSendingTestRow}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTestRow ? 'animate-bounce' : ''}`} />
                  <span>{isSendingTestRow ? 'กำลังส่งข้อมูล...' : 'ส่งแถวทดสอบ (Test Append)'}</span>
                </button>
              </div>
            </div>

            {/* Test Send Feedback Banner */}
            {sendTestRowResult && (
              <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                sendTestRowResult.success 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' 
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              }`}>
                <div className="flex items-center gap-2">
                  {sendTestRowResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{sendTestRowResult.message}</span>
                </div>
                <button
                  onClick={() => setSendTestRowResult(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Configuration Form Card */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
                  <Settings className="w-4 h-4 text-sky-400" />
                  <span>ตั้งค่า Cloudflare Worker Endpoint & Google Sheet Target</span>
                </div>
                {saveSuccess && (
                  <span className="text-emerald-400 text-xs flex items-center gap-1 animate-fade-in">
                    <Check className="w-3.5 h-3.5" /> บันทึกเรียบร้อย
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-slate-300 font-semibold flex items-center justify-between">
                    <span>Cloudflare Worker URL:</span>
                    <span className="text-[11px] text-slate-500 font-normal">URL ที่ได้หลังจาก Deploy บน Cloudflare</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={sheetsConfig.workerUrl}
                      onChange={e => setSheetsConfig({ ...sheetsConfig, workerUrl: e.target.value })}
                      placeholder="https://eptw-sheets-sync.yourname.workers.dev"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                    />
                    <button
                      onClick={handleTestConnection}
                      disabled={isTestingConnection || !sheetsConfig.workerUrl}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Play className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                      <span>{isTestingConnection ? 'ตรวจสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center justify-between">
                    <span>Spreadsheet ID:</span>
                    <span className="text-[11px] text-slate-500 font-normal">รหัสจาก URL ของ Google Sheet</span>
                  </label>
                  <input
                    type="text"
                    value={sheetsConfig.spreadsheetId}
                    onChange={e => setSheetsConfig({ ...sheetsConfig, spreadsheetId: e.target.value })}
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center justify-between">
                    <span>Sheet Name (ชื่อแท็บชีต):</span>
                    <span className="text-[11px] text-slate-500 font-normal">ค่าเริ่มต้น: WorkPermits</span>
                  </label>
                  <input
                    type="text"
                    value={sheetsConfig.sheetName}
                    onChange={e => setSheetsConfig({ ...sheetsConfig, sheetName: e.target.value })}
                    placeholder="WorkPermits"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center justify-between">
                    <span>API Secret Key (ถ้ามี):</span>
                    <span className="text-[11px] text-slate-500 font-normal">สำหรับป้องกันบุคคลภายนอกยิง Worker</span>
                  </label>
                  <input
                    type="password"
                    value={sheetsConfig.apiKey || ''}
                    onChange={e => setSheetsConfig({ ...sheetsConfig, apiKey: e.target.value })}
                    placeholder="ตั้งค่าเป็นทางเลือก (Optional)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sheetsConfig.autoSyncOnCreate}
                        onChange={e => setSheetsConfig({ ...sheetsConfig, autoSyncOnCreate: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-slate-200">ซิงค์อัตโนมัติเมื่อออกใบงานใหม่</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Connection Test Result */}
              {connectionTestResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  connectionTestResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}>
                  {connectionTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{connectionTestResult.message}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  บันทึกการตั้งค่าระบบ
                </button>
              </div>
            </div>

            {/* Cloudflare Setup Instructions Guide */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>วิธีตั้งค่า Environment Variables ใน Cloudflare Dashboard (Settings &gt; Variables)</span>
                </h3>
                <span className="text-[11px] text-amber-400 font-mono">Step-by-Step Guide</span>
              </div>

              <div className="space-y-3 text-slate-300 leading-relaxed text-xs">
                <p>
                  เปิดไฟล์ <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">Service Account JSON</code> ที่ดาวน์โหลดจาก Google Cloud Console แล้วนำไปกรอกในหน้า Cloudflare Workers:
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-400 font-bold">1. JSON_KEY</span>
                      <span className="text-[11px] text-slate-400 ml-2">(แนะนำ - ง่ายที่สุด)</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        คัดลอกเนื้อหาทั้งหมดในไฟล์ JSON วางลงในตัวแปรนี้ และเลือกชนิดเป็น <strong>Encrypt (Secret)</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy('JSON_KEY', 'json_key')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'json_key' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'json_key' ? 'Copied' : 'Copy Name'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-400 font-bold">2. SPREADSHEET_ID</span>
                      <span className="text-[11px] text-slate-400 ml-2">(จำเป็น)</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        รหัส ID ของ Google Sheets (เช่น <code>1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</code>)
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy('SPREADSHEET_ID', 'spreadsheet_id')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'spreadsheet_id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'spreadsheet_id' ? 'Copied' : 'Copy Name'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-400 font-bold">3. SHEET_NAME</span>
                      <span className="text-[11px] text-slate-400 ml-2">(ค่าเริ่มต้น: WorkPermits)</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ชื่อแท็บใน Google Sheets ที่ต้องการให้ต่อท้ายแถวข้อมูล
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy('SHEET_NAME', 'sheet_name')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'sheet_name' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'sheet_name' ? 'Copied' : 'Copy Name'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>ข้อควรระวังสำคัญที่สุด:</strong> ต้องกดปุ่ม <strong>Share</strong> ใน Google Sheets แล้วเพิ่มอีเมล <code>client_email</code> ของ Service Account ให้เป็น <strong>Editor (ผู้แก้ไข)</strong> มิฉะนั้น Google จะไม่อนุญาตให้เขียนข้อมูล
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Logs Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">บันทึกการส่งข้อมูลล่าสุด (Google Sheets Append Logs)</span>
                <span className="text-slate-500 text-[11px]">{syncLogs.length} รายการ</span>
              </div>

              {syncLogs.length === 0 ? (
                <div className="p-6 bg-slate-950 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-xs">
                  ยังไม่มีประวัติการส่งข้อมูล กดปุ่ม &quot;ส่งแถวทดสอบ (Test Append)&quot; เพื่อทดลองเพิ่มแถวใหม่
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 bg-slate-950/60 max-h-48 overflow-y-auto">
                  {syncLogs.map(log => (
                    <div key={log.id} className="p-3 flex items-center justify-between hover:bg-slate-900/40 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${
                          log.status === 'success' ? 'bg-emerald-400' :
                          log.status === 'simulated' ? 'bg-sky-400' : 'bg-rose-400'
                        }`} />
                        <div>
                          <span className="font-mono font-bold text-slate-200">{log.permitNumber}</span>
                          <span className="text-slate-400 ml-2">{log.message}</span>
                          {log.rowDetails && (
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{log.rowDetails}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: GOOGLE DRIVE & CSV ARCHIVE */
          <div>
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
        )}
      </div>
    </div>
  );
};

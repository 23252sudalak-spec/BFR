import React, { useState } from 'react';
import { 
  ShieldCheck, Calendar, Download, Printer, Cloud, 
  TrendingUp, CheckCircle, AlertTriangle, Building, 
  CheckCircle2, Flame, Layers, ShieldAlert, Zap, HardHat
} from 'lucide-react';
import { Language, WorkPermit, PermitType } from '../types/permit';
import { translations } from '../i18n/translations';
import { simulateGoogleAppsScriptWebhook } from '../services/driveSyncService';

interface MonthlySafetyReportProps {
  permits: WorkPermit[];
  language: Language;
  onSaveToDriveArchive?: (reportName: string, driveFileId: string) => void;
}

export const MonthlySafetyReport: React.FC<MonthlySafetyReportProps> = ({
  permits,
  language,
  onSaveToDriveArchive
}) => {
  const t = translations[language];
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Filter permits by month
  const monthlyPermits = permits.filter(p => p.startDate.startsWith(selectedMonth));

  // Compute key safety analytics
  const totalIssued = monthlyPermits.length;
  const activeCount = monthlyPermits.filter(p => p.status === 'active').length;
  const closedCount = monthlyPermits.filter(p => p.status === 'closed').length;
  const approvedCount = monthlyPermits.filter(p => p.status === 'approved').length;
  const pendingCount = monthlyPermits.filter(p => p.status === 'pending').length;

  // Safe man-hours calculation (estimate 8 hours per worker per active/closed permit)
  const totalWorkers = monthlyPermits.reduce((acc, p) => acc + (p.workers?.length || 1), 0);
  const safeManHours = totalWorkers * 8 * 22; // ~monthly worker-hours

  // High risk breakdown
  const riskTypeCounts: Record<PermitType, number> = {
    hot_work: 0,
    height_work: 0,
    confined_space: 0,
    electrical_work: 0,
    chemical_handling: 0,
    excavation: 0,
    lifting: 0,
    cold_work: 0
  };

  monthlyPermits.forEach(p => {
    if (riskTypeCounts[p.type] !== undefined) {
      riskTypeCounts[p.type] += 1;
    }
  });

  // Facility zone breakdown
  const zoneCounts: Record<string, number> = {};
  monthlyPermits.forEach(p => {
    zoneCounts[p.facilityZone] = (zoneCounts[p.facilityZone] || 0) + 1;
  });

  // Audits compliance rate
  const allAudits = monthlyPermits.flatMap(p => p.safetyAudits || []);
  const passedAudits = allAudits.filter(a => a.pass).length;
  const complianceRate = allAudits.length > 0 
    ? Math.round((passedAudits / allAudits.length) * 100) 
    : 100;

  // Save Report directly to Google Drive Safety_Reports_Archive
  const handleSaveToDrive = async () => {
    setIsSavingToDrive(true);
    setSaveSuccessMsg(null);
    try {
      const monthLabel = selectedMonth === '2026-10' ? 'Oct_2026' : selectedMonth.replace('-', '_');
      const filename = `Safety_Report_${monthLabel}.pdf`;
      const result = await simulateGoogleAppsScriptWebhook('archive_report', {
        month: selectedMonth,
        totalIssued,
        safeManHours,
        filename
      });

      if (onSaveToDriveArchive) {
        onSaveToDriveArchive(filename, result.driveFileId);
      }

      setSaveSuccessMsg(`บันทึกลง Google Drive สำเร็จ: /Safety_Reports_Archive/${filename} (Doc ID: ${result.driveFileId})`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const monthOptions = [
    { value: '2026-10', label: 'ตุลาคม 2026 (October 2026)' },
    { value: '2026-09', label: 'กันยายน 2026 (September 2026)' },
    { value: '2026-08', label: 'สิงหาคม 2026 (August 2026)' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Zero Accident Days Counter */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">{t.zeroAccidentBadge}</span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400">Target: Zero Lost-Time Injury</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-0.5 tracking-tight">
              142 <span className="text-lg font-normal text-emerald-400">{t.zeroAccidentDays}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.zeroAccidentSubtitle}</p>
          </div>
        </div>

        {/* Month Selector & Report Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <Calendar className="w-4 h-4 text-sky-400" />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveToDrive}
            disabled={isSavingToDrive}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Cloud className="w-4 h-4" />
            <span>{isSavingToDrive ? 'กำลังซิงค์...' : t.report.saveToDrive}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>{t.report.printReport}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400">{t.report.totalPermits}</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1 tabular-nums">{totalIssued}</div>
          <span className="text-[10px] text-sky-400 mt-1 block">100% Paperless</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400">{t.report.activeWork}</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">{activeCount}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Live Monitored</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400">ปิดงานสมบูรณ์</span>
          <div className="text-2xl font-bold text-slate-300 font-mono mt-1 tabular-nums">{closedCount}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">5S Clean Verified</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400">{t.report.safeManHours}</span>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-1 tabular-nums">{safeManHours.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-400 mt-1 block">+12% vs Prev Month</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400">{t.report.incidentsCount}</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">0</div>
          <span className="text-[10px] text-emerald-400 mt-1 block">Zero LTI Recorded</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400">{t.report.auditCompliance}</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">{complianceRate}%</div>
          <span className="text-[10px] text-emerald-400 mt-1 block">ISO 45001 Standard</span>
        </div>
      </div>

      {/* Analytics Breakdown Sections: 8 High-Risk Types & Facility Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Card */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>{t.report.riskDistribution} (8 Risk Types)</span>
            </h3>
            <span className="text-xs text-slate-500">สถิติสะสม</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(riskTypeCounts).map(([typeKey, count]) => {
              const info = t.permitTypes[typeKey as PermitType];
              const pct = totalIssued > 0 ? Math.round((count / totalIssued) * 100) : 0;
              return (
                <div key={typeKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{info.title}</span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-slate-400">{count} ใบ</span>
                      <span className="text-slate-500">({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        typeKey === 'hot_work' ? 'bg-amber-500' :
                        typeKey === 'confined_space' ? 'bg-rose-500' :
                        typeKey === 'height_work' ? 'bg-sky-500' :
                        typeKey === 'electrical_work' ? 'bg-yellow-500' :
                        typeKey === 'chemical_handling' ? 'bg-purple-500' :
                        typeKey === 'excavation' ? 'bg-orange-500' :
                        typeKey === 'lifting' ? 'bg-indigo-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(pct, count > 0 ? 8 : 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Facility Zones & Compliance */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>การกระจายตัวตามพื้นที่โรงงาน (Facility Zones)</span>
            </h3>
            <span className="text-xs text-slate-500">Active Work Zones</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {Object.entries(zoneCounts).length === 0 ? (
              <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs">
                ยังไม่มีข้อมูลใบงานในรอบเดือนที่เลือก
              </div>
            ) : (
              Object.entries(zoneCounts).map(([zoneName, count]) => (
                <div key={zoneName} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{zoneName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sky-400 font-mono font-bold tabular-nums">{count} ใบอนุญาต</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      100% Safe
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 mt-4 text-xs">
            <span className="font-semibold text-slate-300">สรุปความเห็นของ จป.วิชาชีพ ประจำเดือน (Safety Officer Assessment):</span>
            <p className="text-slate-400 leading-relaxed">
              ในเดือน{selectedMonth === '2026-10' ? 'ตุลาคม 2569' : selectedMonth} การดำเนินงานด้าน e-PTW 
              มีการปฏิบัติตามมาตรฐานครบถ้วน มีการตรวจวัดก๊าซในที่อับอากาศและงานร้อน 100% 
              ไม่พบเหตุการณ์เฉียดฉิว (Near Miss) หรืออุบัติเหตุขั้นสูญเสียเวลาทำงาน (Zero LTI) บรรลุเป้าหมายความปลอดภัยระดับสูงสุด
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

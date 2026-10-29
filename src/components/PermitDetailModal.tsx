import React, { useState } from 'react';
import { 
  X, CheckCircle, AlertTriangle, ShieldCheck, 
  Printer, Cloud, PenTool, Check, Ban, Eye, FileText, CheckCircle2
} from 'lucide-react';
import { 
  Language, User, WorkPermit, SafetyAudit 
} from '../types/permit';
import { translations } from '../i18n/translations';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface PermitDetailModalProps {
  isOpen: boolean;
  permit: WorkPermit | null;
  currentUser: User;
  language: Language;
  onClose: () => void;
  onUpdatePermit: (updated: WorkPermit, notificationMessage?: string) => void;
}

export const PermitDetailModal: React.FC<PermitDetailModalProps> = ({
  isOpen,
  permit,
  currentUser,
  language,
  onClose,
  onUpdatePermit
}) => {
  if (!isOpen || !permit) return null;
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'details' | 'checklist' | 'jsa' | 'audits' | 'closure'>('details');
  const [signatureRole, setSignatureRole] = useState<'safetyOfficer' | 'closure' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  
  // Audit Modal state
  const [showAuditBox, setShowAuditBox] = useState(false);
  const [auditNotes, setAuditNotes] = useState('');
  const [auditPass, setAuditPass] = useState(true);

  // Closure state
  const [toolsRemoved, setToolsRemoved] = useState(true);
  const [areaCleaned, setAreaCleaned] = useState(true);
  const [hazardsControlled, setHazardsControlled] = useState(true);
  const [closureNotes, setClosureNotes] = useState('');

  const typeInfo = t.permitTypes[permit.type];

  // Role verification checks
  const canVerifyAsSO = currentUser.role === 'safety_officer' || currentUser.role === 'admin';
  const isWorker = currentUser.role === 'worker';

  // Handle Safety Officer Approval (Now directly approves & enables work!)
  const handleSignSO = (dataUrl: string) => {
    const updated: WorkPermit = {
      ...permit,
      safetyOfficer: currentUser,
      signatures: {
        ...permit.signatures,
        safetyOfficer: {
          role: 'Safety Officer (จป.วิชาชีพ)',
          signerName: currentUser.name,
          signatureDataUrl: dataUrl,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          signerCompany: currentUser.company
        }
      },
      status: 'approved',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const notif = `[${permit.permitNumber}] จป.วิชาชีพ (${currentUser.name}) ตรวจสอบและลงนามอนุมัติเรียบร้อยแล้ว (Approved - พร้อมปฏิบัติงานทันที)`;
    onUpdatePermit(updated, notif);
    setSignatureRole(null);
  };

  // Start Work (set to Active)
  const handleStartWork = () => {
    const updated: WorkPermit = {
      ...permit,
      status: 'active',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    onUpdatePermit(updated, `[${permit.permitNumber}] เริ่มต้นปฏิบัติงานในพื้นที่แล้ว (Status: Active)`);
  };

  // Suspend Work (if unsafe)
  const handleSuspendWork = () => {
    const updated: WorkPermit = {
      ...permit,
      status: 'suspended',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    onUpdatePermit(updated, `[${permit.permitNumber}] สั่งระงับการทำงานชั่วคราว (Work Suspended) เนื่องจากตรวจสอบพบความไม่ปลอดภัย`);
  };

  // Resume Work
  const handleResumeWork = () => {
    const updated: WorkPermit = {
      ...permit,
      status: 'active',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    onUpdatePermit(updated, `[${permit.permitNumber}] อนุญาตให้กลับมาปฏิบัติงานต่อ (Resumed) หลังแก้ไขจุดบกพร่อง`);
  };

  // Reject
  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    const updated: WorkPermit = {
      ...permit,
      status: 'rejected',
      rejectionReason,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    onUpdatePermit(updated, `[${permit.permitNumber}] ถูกปฏิเสธคำขอ (Rejected): ${rejectionReason}`);
    setShowRejectBox(false);
  };

  // Field Audit
  const handleAddAudit = () => {
    const newAudit: SafetyAudit = {
      id: `aud-${Date.now()}`,
      auditor: currentUser.name,
      auditorRole: currentUser.role,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: auditNotes.trim() || 'สุ่มตรวจหน้างาน: มาตรการควบคุมความปลอดภัยเรียบร้อยดี',
      pass: auditPass,
      ppeCompliant: true,
      gasCompliant: permit.gasTestResults ? true : undefined
    };

    const updated: WorkPermit = {
      ...permit,
      safetyAudits: [newAudit, ...permit.safetyAudits],
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onUpdatePermit(updated, `[${permit.permitNumber}] บันทึกผลการสุ่มตรวจโดย ${currentUser.name}: ${auditPass ? 'ผ่านเกณฑ์ 100%' : 'ไม่ผ่านเกณฑ์'}`);
    setShowAuditBox(false);
    setAuditNotes('');
  };

  // Worker Acknowledgment
  const handleWorkerAcknowledge = (workerId: string) => {
    const updatedWorkers = permit.workers.map(w => 
      w.id === workerId 
        ? { ...w, acknowledged: true, acknowledgedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) }
        : w
    );
    const updated: WorkPermit = {
      ...permit,
      workers: updatedWorkers
    };
    onUpdatePermit(updated, `[${permit.permitNumber}] ผู้ปฏิบัติงานยืนยันรับทราบข้อกำหนดความปลอดภัย (Toolbox Talk Signed)`);
  };

  // Close Permit
  const handleClosePermit = (signatureDataUrl: string) => {
    const updated: WorkPermit = {
      ...permit,
      status: 'closed',
      closureNotes: closureNotes.trim() || 'ตรวจพื้นที่เรียบร้อย: เคลียร์เครื่องมือ ขยะ และดับไฟสะสม 100%',
      signatures: {
        ...permit.signatures,
        closureInspector: {
          role: 'Closure Inspector',
          signerName: currentUser.name,
          signatureDataUrl,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          signerCompany: currentUser.company
        }
      },
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onUpdatePermit(updated, `[${permit.permitNumber}] ตรวจพื้นที่และปิดใบอนุญาตเรียบร้อย (Permit Closed)`);
    setSignatureRole(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/30">
              {permit.permitNumber}
            </span>
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-slate-100 line-clamp-1">{permit.title}</h2>
              <span className="text-xs text-slate-400">{permit.facilityZone} · {permit.contractorCompany}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.report.printReport}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status & Quick Action Banner */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">{t.detail.currentStatus}:</span>
            <span className={`px-2.5 py-1 rounded-full font-semibold border ${
              permit.status === 'active' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : permit.status === 'approved'
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                : permit.status === 'pending'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : permit.status === 'closed'
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {t.status[permit.status]}
            </span>

            <span className="text-slate-400">{t.detail.riskLevel}:</span>
            <span className={`px-2 py-0.5 rounded font-mono uppercase font-bold text-[11px] ${
              permit.riskLevel === 'critical' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}>
              {permit.riskLevel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {permit.status === 'approved' && (
              <button
                onClick={handleStartWork}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {t.detail.btnStartWork}
              </button>
            )}

            {permit.status === 'active' && (
              <>
                <button
                  onClick={handleSuspendWork}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {t.detail.btnSuspendWork}
                </button>
                <button
                  onClick={() => setActiveTab('closure')}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {t.workflow.closePermit}
                </button>
              </>
            )}

            {permit.status === 'suspended' && (
              <button
                onClick={handleResumeWork}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
              >
                {t.detail.btnResumeWork}
              </button>
            )}

            {permit.status === 'pending' && (
              <>
                {canVerifyAsSO && !permit.signatures.safetyOfficer && (
                  <button
                    onClick={() => setSignatureRole('safetyOfficer')}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.detail.btnSoApprove}</span>
                  </button>
                )}

                <button
                  onClick={() => setShowRejectBox(true)}
                  className="px-2.5 py-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  {t.detail.btnReject}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-medium px-6 gap-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details' ? 'border-sky-500 text-sky-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.detail.tabOverview}
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'checklist' ? 'border-sky-500 text-sky-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.detail.tabChecklist} ({permit.checklist.filter(c => c.checked).length}/{permit.checklist.length})
          </button>
          <button
            onClick={() => setActiveTab('jsa')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'jsa' ? 'border-sky-500 text-sky-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.detail.tabJsa} ({(permit.workers || []).length})
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'audits' ? 'border-sky-500 text-sky-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.detail.tabAudits} ({permit.safetyAudits.length})
          </button>
          <button
            onClick={() => setActiveTab('closure')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'closure' ? 'border-sky-500 text-sky-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.detail.tabClosure}
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
          {/* TAB 1: Details & Signatures */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Rejection Alert if rejected */}
              {permit.rejectionReason && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <Ban className="w-4 h-4" />
                    <span>เหตุผลที่ปฏิเสธ / ส่งกลับแก้ไข:</span>
                  </div>
                  <p>{permit.rejectionReason}</p>
                </div>
              )}

              {/* Work Hazard Warning */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-300 text-sm">{typeInfo.title} ({typeInfo.code})</span>
                  <p className="text-slate-300 leading-relaxed">{typeInfo.desc}</p>
                  <p className="text-amber-200/90 font-medium">{typeInfo.warning}</p>
                </div>
              </div>

              {/* 2-column info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t.form.workDetails}</span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.form.workDetails}:</span>
                      <span className="font-semibold text-slate-200 text-right">{permit.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.form.facilityZone}:</span>
                      <span className="text-slate-200 text-right">{permit.facilityZone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.form.location}:</span>
                      <span className="text-slate-200 text-right">{permit.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.form.contractorCompany}:</span>
                      <span className="text-slate-200 text-right">{permit.contractorCompany}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t.form.validityPeriod}</span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.form.startTime}:</span>
                      <span className="font-mono text-slate-200">{permit.startDate} {permit.startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.form.endTime}:</span>
                      <span className="font-mono text-slate-200">{permit.endDate} {permit.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Created:</span>
                      <span className="font-mono text-slate-200">{permit.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Google Drive:</span>
                      <span className="font-mono text-emerald-400 flex items-center gap-1">
                        <Cloud className="w-3.5 h-3.5" /> Synced ({permit.driveFileId})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gas Testing Card (if hot work or confined space) */}
              {permit.gasTestResults && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{t.detail.gasTestTitle}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {t.detail.gasTestSafe}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400">Oxygen (O2)</span>
                      <div className="text-base font-bold text-sky-400 font-mono">{permit.gasTestResults.o2}%</div>
                      <span className="text-[9px] text-slate-500">19.5 - 23.5%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400">Flammable (LEL)</span>
                      <div className="text-base font-bold text-emerald-400 font-mono">{permit.gasTestResults.lel}%</div>
                      <span className="text-[9px] text-slate-500">&lt; 10%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400">Carbon Monoxide (CO)</span>
                      <div className="text-base font-bold text-emerald-400 font-mono">{permit.gasTestResults.co} ppm</div>
                      <span className="text-[9px] text-slate-500">&lt; 25 ppm</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400">Hydrogen Sulfide (H2S)</span>
                      <div className="text-base font-bold text-emerald-400 font-mono">{permit.gasTestResults.h2s} ppm</div>
                      <span className="text-[9px] text-slate-500">&lt; 10 ppm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Signatures Matrix - 2 Steps: Requester & Safety Officer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">{t.detail.sigMatrixTitle}</span>
                  <span className="text-[11px] text-slate-400 font-mono">2-Step Approval Chain</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* กล่องที่ 1: ผู้ขออนุญาต / ผู้รับเหมา (ลงนามขอเปิดงาน) */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">1. ผู้ขออนุญาต / ผู้รับเหมา (ลงนามขอเปิดงาน)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono">Step 1</span>
                      </div>
                      <div className="font-bold text-slate-200 mt-1 text-sm">{permit.signatures.requester?.signerName || permit.requester?.name || 'Applicant'}</div>
                      <span className="text-xs text-slate-400">{permit.contractorCompany}</span>
                    </div>
                    {permit.signatures.requester ? (
                      <div className="pt-2 border-t border-slate-800/80">
                        <img 
                          src={permit.signatures.requester.signatureDataUrl} 
                          alt="Signature" 
                          className="h-10 object-contain invert opacity-80" 
                        />
                        <span className="text-[10px] text-slate-500 font-mono block mt-1">{permit.signatures.requester.timestamp}</span>
                      </div>
                    ) : (
                      <div className="h-12 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-lg">
                        {t.detail.sigNotSigned}
                      </div>
                    )}
                  </div>

                  {/* กล่องที่ 2: จป.วิชาชีพ ตรวจสอบและอนุมัติ */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-emerald-400 uppercase font-semibold">2. จป.วิชาชีพ ตรวจสอบและอนุมัติ</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">Final Approval</span>
                      </div>
                      <div className="font-bold text-slate-200 mt-1 text-sm">
                        {permit.signatures.safetyOfficer?.signerName || (canVerifyAsSO ? `รอ จป.วิชาชีพ ลงนามอนุมัติ` : t.detail.sigNotSigned)}
                      </div>
                      <span className="text-xs text-slate-400">Apex Safety & EHS Division</span>
                    </div>
                    {permit.signatures.safetyOfficer ? (
                      <div className="pt-2 border-t border-slate-800/80">
                        <img 
                          src={permit.signatures.safetyOfficer.signatureDataUrl} 
                          alt="Signature" 
                          className="h-10 object-contain invert opacity-80" 
                        />
                        <span className="text-[10px] text-slate-500 font-mono block mt-1">{permit.signatures.safetyOfficer.timestamp}</span>
                      </div>
                    ) : (
                      <div>
                        {canVerifyAsSO && permit.status === 'pending' ? (
                          <button
                            onClick={() => setSignatureRole('safetyOfficer')}
                            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{t.detail.btnSoApprove}</span>
                          </button>
                        ) : (
                          <div className="h-12 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-lg">
                            {t.detail.sigNotSigned}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Checklist & PPE */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              {/* PPE List */}
              <div>
                <span className="font-semibold text-slate-300 block mb-2">อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคลที่บังคับ (Required PPE)</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {permit.ppeList.map(ppeKey => {
                    const ppeName = t.ppe[ppeKey as keyof typeof t.ppe] || ppeKey;
                    return (
                      <div key={ppeKey} className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium text-slate-200">{ppeName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Checklists */}
              <div>
                <span className="font-semibold text-slate-300 block mb-2">
                  Safety Checklist ประจำประเภทงาน ({permit.type})
                </span>
                <div className="space-y-2">
                  {permit.checklist.map((item, idx) => {
                    const label = t.checklists[item.labelKey] || item.labelKey;
                    return (
                      <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
                        <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${item.checked ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <div className="flex-1 space-y-0.5">
                          <div className="text-slate-200">
                            <span className="font-bold text-slate-400 mr-2">{idx + 1}.</span>
                            <span>{label}</span>
                          </div>
                          {item.note && (
                            <p className="text-[11px] text-sky-400 italic font-mono pl-5">
                              บันทึกหมายเหตุ: {item.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JSA & Workers */}
          {activeTab === 'jsa' && (
            <div className="space-y-6">
              {/* Workers and acknowledgment */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-300">
                    {t.detail.workersTitle} ({(permit.workers || []).length})
                  </span>
                  <span className="text-[11px] text-slate-400">{t.form.workerCertCheck}</span>
                </div>

                <div className="space-y-2">
                  {(!permit.workers || permit.workers.length === 0) ? (
                    <div className="p-4 text-center text-slate-500 bg-slate-950/40 border border-slate-800 rounded-lg text-xs">
                      {language === 'th' ? 'ไม่มีข้อมูลรายชื่อผู้ปฏิบัติงานในใบอนุญาตนี้' : language === 'zh' ? '该许可证无作业人员登记' : 'No worker records registered for this permit'}
                    </div>
                  ) : (
                    permit.workers.map((w, idx) => (
                      <div key={w.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 font-mono">{idx + 1}.</span>
                          <div>
                            <div className="font-semibold text-slate-200">{w.name}</div>
                            <div className="text-[11px] text-slate-400">{w.role} · ID: {w.nationalId} ({w.company})</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {w.acknowledged ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t.detail.toolboxSigned} ({w.acknowledgedAt?.split(' ')[1] || '08:20'})</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleWorkerAcknowledge(w.id)}
                              className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded text-xs transition-colors cursor-pointer"
                            >
                              {t.detail.btnSignToolbox}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* JSA Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-300">
                    {t.form.jsaTitle}
                  </span>
                  {permit.jsaDocumentName && (
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {permit.jsaDocumentName}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {(!permit.jsaItems || permit.jsaItems.length === 0) ? (
                    <div className="p-4 text-center text-slate-500 bg-slate-950/40 border border-slate-800 rounded-lg text-xs">
                      {language === 'th' ? 'ไม่มีขั้นตอนการประเมินความเสี่ยง JSA ในใบอนุญาตนี้' : language === 'zh' ? '该许可证无JSA安全分析步骤' : 'No JSA hazard analysis steps registered for this permit'}
                    </div>
                  ) : (
                    permit.jsaItems.map((jsa, i) => (
                      <div key={jsa.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                        <div className="font-semibold text-sky-400">{t.form.addStep} {i + 1}: {jsa.step}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pt-1">
                          <div>
                            <span className="text-slate-500 font-medium">{t.form.hazard}: </span>
                            <span>{jsa.hazard}</span>
                          </div>
                          <div>
                            <span className="text-emerald-400 font-medium">{t.form.controlMeasure}: </span>
                            <span>{jsa.controlMeasure}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Audits */}
          {activeTab === 'audits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-300">{t.detail.tabAudits}</span>
                  <p className="text-[11px] text-slate-400">ISO 45001 Patrol & Compliance Logs</p>
                </div>

                {(canVerifyAsSO || currentUser.role === 'admin') && permit.status === 'active' && (
                  <button
                    onClick={() => setShowAuditBox(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.detail.btnNewAudit}</span>
                  </button>
                )}
              </div>

              {permit.safetyAudits.length === 0 ? (
                <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  {t.detail.noAudits}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {permit.safetyAudits.map(aud => (
                    <div key={aud.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            aud.pass ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {aud.pass ? t.detail.auditPassBadge : t.detail.auditFailBadge}
                          </span>
                          <span className="font-semibold text-slate-200">{aud.auditor}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">{aud.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{aud.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Closure */}
          {activeTab === 'closure' && (
            <div className="space-y-6">
              {permit.status === 'closed' ? (
                <div className="p-6 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{t.detail.closureSuccessTitle}</h3>
                      <p className="text-xs text-slate-400">{permit.signatures.closureInspector?.timestamp || permit.updatedAt}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg text-slate-300">
                    <span className="text-slate-500">{t.detail.closureNotesLabel}: </span>
                    <span>{permit.closureNotes || 'Cleaned & verified'}</span>
                  </div>

                  {permit.signatures.closureInspector && (
                    <div className="pt-2">
                      <span className="text-slate-400 block mb-1">Inspector ({permit.signatures.closureInspector.signerName}):</span>
                      <img 
                        src={permit.signatures.closureInspector.signatureDataUrl} 
                        alt="Closure Signature" 
                        className="h-12 object-contain invert opacity-90" 
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 mb-1">{t.workflow.closePermit}</h3>
                    <p className="text-xs text-slate-400">{t.workflow.closureCheck}</p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={toolsRemoved} 
                        onChange={e => setToolsRemoved(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-500" 
                      />
                      <span className="text-slate-200">{t.workflow.allToolsRemoved}</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={areaCleaned} 
                        onChange={e => setAreaCleaned(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-500" 
                      />
                      <span className="text-slate-200">{t.workflow.areaCleaned}</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hazardsControlled} 
                        onChange={e => setHazardsControlled(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-500" 
                      />
                      <span className="text-slate-200">{t.workflow.hazardsControlled}</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {t.detail.closureNotesLabel}
                    </label>
                    <textarea
                      rows={2}
                      value={closureNotes}
                      onChange={e => setClosureNotes(e.target.value)}
                      placeholder="..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500"
                    />
                  </div>

                  {signatureRole === 'closure' ? (
                    <DigitalSignaturePad
                      signerName={currentUser.name}
                      signerRole="Closure Inspector"
                      language={language}
                      onSave={handleClosePermit}
                      onCancel={() => setSignatureRole(null)}
                    />
                  ) : (
                    <button
                      type="button"
                      disabled={!toolsRemoved || !areaCleaned || !hazardsControlled}
                      onClick={() => setSignatureRole('closure')}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        toolsRemoved && areaCleaned && hazardsControlled
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <PenTool className="w-4 h-4" />
                      <span>{t.detail.btnSignToClose}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Signature Pad overlay for SO Final Approval */}
          {signatureRole === 'safetyOfficer' && (
            <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-emerald-400">
                ลงนามตรวจสอบและอนุมัติโดย จป.วิชาชีพ (Safety Officer Final Approval)
              </span>
              <DigitalSignaturePad
                signerName={currentUser.name}
                signerRole="Safety Officer (จป.วิชาชีพ)"
                language={language}
                onSave={handleSignSO}
                onCancel={() => setSignatureRole(null)}
              />
            </div>
          )}

          {/* Rejection Reason Modal/Box */}
          {showRejectBox && (
            <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-rose-400">ระบุเหตุผลในการไม่อนุมัติหรือสั่งแก้ไข</span>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="ระบุข้อบกพร่อง เช่น ไม่ระบุชื่อ Fire Watch, นั่งร้านยังไม่มีป้ายเขียว..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectBox(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg cursor-pointer"
                >
                  ยืนยันปฏิเสธ
                </button>
              </div>
            </div>
          )}

          {/* Field Audit Modal/Box */}
          {showAuditBox && (
            <div className="p-4 bg-slate-950 border border-sky-500/40 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-sky-400">บันทึกผลการสุ่มตรวจความปลอดภัยหน้างาน</span>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="auditStatus"
                    checked={auditPass}
                    onChange={() => setAuditPass(true)}
                    className="text-emerald-500"
                  />
                  <span className="text-emerald-400 font-semibold">ผ่านเกณฑ์ 100% (Passed)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="auditStatus"
                    checked={!auditPass}
                    onChange={() => setAuditPass(false)}
                    className="text-rose-500"
                  />
                  <span className="text-rose-400 font-semibold">พบข้อบกพร่อง (Violation)</span>
                </label>
              </div>
              <textarea
                rows={3}
                value={auditNotes}
                onChange={e => setAuditNotes(e.target.value)}
                placeholder="บันทึกสภาพหน้างาน อุปกรณ์ PPE ถังดับเพลิง หรือการกั้นเขต..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-xs"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAuditBox(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleAddAudit}
                  className="px-4 py-1.5 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg cursor-pointer"
                >
                  บันทึกการตรวจ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

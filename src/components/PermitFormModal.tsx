import React, { useState } from 'react';
import { 
  X, Flame, ShieldAlert, Zap, AlertTriangle, 
  Layers, HardHat, CheckCircle2, Info, Building
} from 'lucide-react';
import { 
  Language, PermitType, User, WorkPermit, 
  ChecklistItem 
} from '../types/permit';
import { translations } from '../i18n/translations';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface PermitFormModalProps {
  isOpen: boolean;
  currentUser: User;
  language: Language;
  onClose: () => void;
  onSubmit: (newPermit: WorkPermit) => void;
}

const permitTypeIcons: Record<PermitType, React.ElementType> = {
  hot_work: Flame,
  height_work: Layers,
  confined_space: ShieldAlert,
  electrical_work: Zap,
  chemical_handling: AlertTriangle,
  excavation: Layers,
  lifting: Building,
  cold_work: HardHat
};

const defaultChecklistKeys: Record<PermitType, string[]> = {
  hot_work: ['hw_1', 'hw_2', 'hw_3', 'hw_4', 'hw_5'],
  height_work: ['wh_1', 'wh_2', 'wh_3', 'wh_4', 'wh_5'],
  confined_space: ['cs_1', 'cs_2', 'cs_3', 'cs_4', 'cs_5'],
  electrical_work: ['ew_1', 'ew_2', 'ew_3', 'ew_4'],
  chemical_handling: ['ch_1', 'ch_2', 'ch_3', 'ch_4'],
  excavation: ['ex_1', 'ex_2', 'ex_3', 'ex_4'],
  lifting: ['lf_1', 'lf_2', 'lf_3', 'lf_4'],
  cold_work: ['cw_1', 'cw_2', 'cw_3', 'cw_4']
};

const defaultPPEByType: Record<PermitType, string[]> = {
  hot_work: ['helmet', 'safetyGlasses', 'safetyBoots', 'leatherGloves', 'fireExtinguisher', 'weldingMask'],
  height_work: ['helmet', 'safetyGlasses', 'safetyBoots', 'safetyHarness'],
  confined_space: ['helmet', 'safetyGlasses', 'safetyBoots', 'safetyHarness', 'gasDetector', 'respirator'],
  electrical_work: ['helmet', 'safetyGlasses', 'safetyBoots', 'leatherGloves'],
  chemical_handling: ['helmet', 'safetyGlasses', 'faceShield', 'chemicalGloves', 'respirator', 'safetyBoots'],
  excavation: ['helmet', 'safetyGlasses', 'safetyBoots', 'earPlugs'],
  lifting: ['helmet', 'safetyGlasses', 'safetyBoots', 'leatherGloves'],
  cold_work: ['helmet', 'safetyGlasses', 'safetyBoots']
};

export const PermitFormModal: React.FC<PermitFormModalProps> = ({
  isOpen,
  currentUser,
  language,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<PermitType>('hot_work');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [facilityZone, setFacilityZone] = useState('');
  const [contractorCompany, setContractorCompany] = useState(currentUser.company || 'Thai General Construction Co., Ltd.');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('17:00');
  
  // PPE selection
  const [selectedPPE, setSelectedPPE] = useState<string[]>(defaultPPEByType['hot_work']);

  // Dynamic Checklists
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    defaultChecklistKeys['hot_work'].map(k => ({
      id: k,
      labelKey: k,
      checked: true,
      required: true
    }))
  );

  // Requester Signature
  const [requesterSignature, setRequesterSignature] = useState<string | null>(null);
  const [showSignPad, setShowSignPad] = useState(false);

  // Switch type and sync defaults
  const handleTypeSelect = (type: PermitType) => {
    setSelectedType(type);
    setSelectedPPE(defaultPPEByType[type]);
    setChecklist(
      defaultChecklistKeys[type].map(k => ({
        id: k,
        labelKey: k,
        checked: true,
        required: true
      }))
    );
  };

  const togglePPE = (ppeKey: string) => {
    setSelectedPPE(prev => 
      prev.includes(ppeKey) ? prev.filter(k => k !== ppeKey) : [...prev, ppeKey]
    );
  };

  const toggleChecklist = (id: string) => {
    setChecklist(prev => 
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const handleSubmit = (asDraft: boolean = false) => {
    const permitNumber = `PTW-2026-1026-${Math.floor(100 + Math.random() * 900)}`;

    const newPermit: WorkPermit = {
      id: `ptw-${Date.now()}`,
      permitNumber,
      type: selectedType,
      title: title.trim() || `${t.permitTypes[selectedType].title} - ${facilityZone || 'โรงงาน'}`,
      location: location.trim() || 'พื้นที่ปฏิบัติงาน (Work Area)',
      facilityZone: facilityZone.trim() || 'โซนปฏิบัติการทั่วไป (General Area)',
      contractorCompany,
      startDate,
      endDate,
      startTime,
      endTime,
      requester: currentUser,
      status: asDraft ? 'draft' : 'pending',
      riskLevel: selectedType === 'confined_space' ? 'critical' : 'high',
      ppeList: selectedPPE,
      checklist,
      jsaItems: [],
      workers: [],
      signatures: {
        requester: requesterSignature ? {
          role: 'Requester / Contractor',
          signerName: currentUser.name,
          signatureDataUrl: requesterSignature,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          signerCompany: contractorCompany
        } : undefined
      },
      safetyAudits: [],
      driveSyncStatus: 'synced',
      driveFileId: `1g8a_${permitNumber}`,
      driveSyncedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onSubmit(newPermit);
    onClose();
  };

  const permitTypesList: PermitType[] = [
    'hot_work',
    'height_work',
    'confined_space',
    'electrical_work',
    'chemical_handling',
    'excavation',
    'lifting',
    'cold_work'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-base font-bold text-slate-100">{t.form.title}</h2>
            <p className="text-xs text-slate-400">Step {activeStep} of 3 · ISO 45001 High-Risk Safety Control</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs font-medium">
          <button
            onClick={() => setActiveStep(1)}
            className={`py-3 px-4 text-center border-b-2 transition-all cursor-pointer ${
              activeStep === 1 
                ? 'border-sky-500 text-sky-400 bg-sky-500/5 font-semibold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. {t.form.workType}
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`py-3 px-4 text-center border-b-2 transition-all cursor-pointer ${
              activeStep === 2 
                ? 'border-sky-500 text-sky-400 bg-sky-500/5 font-semibold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. {t.form.safetyChecklist}
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`py-3 px-4 text-center border-b-2 transition-all cursor-pointer ${
              activeStep === 3 
                ? 'border-sky-500 text-sky-400 bg-sky-500/5 font-semibold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. {t.form.digitalSign}
          </button>
        </div>

        {/* Form Body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* STEP 1: Type & Basic Info */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t.form.workType} (8 High-Risk Standards) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {permitTypesList.map(typeKey => {
                    const Icon = permitTypeIcons[typeKey];
                    const info = t.permitTypes[typeKey];
                    const isSelected = selectedType === typeKey;
                    return (
                      <button
                        key={typeKey}
                        type="button"
                        onClick={() => handleTypeSelect(typeKey)}
                        className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-950/60 border-sky-500 text-slate-100 shadow-md shadow-sky-500/10 ring-1 ring-sky-500'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">{info.code}</span>
                        </div>
                        <span className="text-xs font-semibold leading-tight line-clamp-1">{info.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hazard Banner */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-amber-300">Safety Requirement:</span>
                  <p className="text-slate-300">{t.permitTypes[selectedType].warning}</p>
                </div>
              </div>

              {/* Title & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.form.workDetails} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t.form.workDetails}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.form.facilityZone} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="facility-zone-suggestions"
                    value={facilityZone}
                    onChange={e => setFacilityZone(e.target.value)}
                    placeholder={t.form.zonePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs"
                  />
                  <datalist id="facility-zone-suggestions">
                    <option value="อาคารผลิต 1 (Production Plant 1)" />
                    <option value="อาคารผลิต 2 (Production Plant 2)" />
                    <option value="Zone A: Chemical Tank Farm" />
                    <option value="Zone B: Boiler & Utilities" />
                    <option value="Zone C: Reactor Complex" />
                    <option value="Zone D: Machinery Yard" />
                    <option value="Zone E: Main Substation" />
                    <option value="Zone W: Warehouse & Logistics" />
                    <option value="Central Workshop" />
                    <option value="Wastewater Treatment" />
                  </datalist>
                </div>
              </div>

              {/* Location & Contractor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.form.location} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder={t.form.location}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.form.contractorCompany} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contractorCompany}
                    onChange={e => setContractorCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t.form.validityPeriod}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t.form.validityPeriod}</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t.form.startTime}</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t.form.endTime}</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PPE & Dynamic Safety Checklist */}
          {activeStep === 2 && (
            <div className="space-y-6">
              {/* PPE Selection Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t.form.ppeRequired} - {t.form.ppeSubtitle}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(t.ppe).map(([ppeKey, ppeName]) => {
                    const isChecked = selectedPPE.includes(ppeKey);
                    return (
                      <button
                        key={ppeKey}
                        type="button"
                        onClick={() => togglePPE(ppeKey)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-sky-950/40 border-sky-500/60 text-slate-100'
                            : 'bg-slate-950/20 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked ? 'bg-sky-500 border-sky-500 text-slate-950' : 'border-slate-600'
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium leading-tight">{ppeName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Pre-work Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    {t.form.safetyChecklist} - {t.permitTypes[selectedType].title}
                  </label>
                  <span className="text-xs text-sky-400">{t.form.checklistMandatory}</span>
                </div>

                <div className="space-y-2 border border-slate-800 rounded-xl p-3 bg-slate-950/30">
                  {checklist.map((item, idx) => {
                    const label = t.checklists[item.labelKey] || item.labelKey;
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklist(item.id)}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          item.checked 
                            ? 'bg-slate-900/60 border-slate-700/80 text-slate-200' 
                            : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          item.checked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-rose-500'
                        }`}>
                          {item.checked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1 text-xs leading-relaxed">
                          <span className="font-semibold text-slate-400 mr-1.5">{idx + 1}.</span>
                          <span>{label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Digital Signature */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">{t.detail.roleRequester} ({t.form.digitalSign})</span>
                    <p className="text-[11px] text-slate-400">
                      {t.form.applicantCertDeclaration}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-sky-400 font-semibold">{currentUser.name}</span>
                </div>

                {requesterSignature ? (
                  <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="text-xs font-semibold text-slate-200">{t.detail.sigSigned}</span>
                        <p className="text-[11px] text-slate-400">{currentUser.name} · {contractorCompany}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSignPad(true)}
                      className="text-xs text-sky-400 hover:underline"
                    >
                      {t.detail.btnSignNow}
                    </button>
                  </div>
                ) : (
                  <div>
                    {!showSignPad ? (
                      <button
                        type="button"
                        onClick={() => setShowSignPad(true)}
                        className="w-full py-4 border-2 border-dashed border-sky-500/50 hover:border-sky-500 bg-sky-500/5 hover:bg-sky-500/10 rounded-xl text-sky-400 font-semibold text-xs flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <HardHat className="w-6 h-6" />
                        <span>{t.form.digitalSign}</span>
                      </button>
                    ) : (
                      <DigitalSignaturePad
                        signerName={currentUser.name}
                        signerRole="Requester / Contractor"
                        language={language}
                        onSave={dataUrl => {
                          setRequesterSignature(dataUrl);
                          setShowSignPad(false);
                        }}
                        onCancel={() => setShowSignPad(false)}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Review Summary */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                <span className="font-semibold text-slate-300">{t.form.summaryTitle}:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400 pt-1">
                  <div>
                    <span className="text-slate-500">{t.dashboard.tableRiskType}:</span> <span className="text-slate-200">{t.permitTypes[selectedType].title}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t.form.facilityZone}:</span> <span className="text-slate-200">{facilityZone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t.form.contractorCompany}:</span> <span className="text-slate-200 truncate">{contractorCompany}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t.dashboard.tableStatus}:</span> <span className="text-amber-400 font-medium">Pending Review</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep(prev => prev - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                {t.form.btnBack}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {t.form.saveDraft}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => setActiveStep(prev => prev + 1)}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {t.form.btnNext}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {t.form.submitPermit}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

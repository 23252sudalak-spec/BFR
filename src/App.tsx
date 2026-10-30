import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Plus, Search, Filter, Cloud, Bell, 
  Download, Printer, AlertTriangle, CheckCircle, 
  Clock, Flame, Layers, ShieldAlert, Zap, HardHat, 
  Building, ChevronRight, UserCheck, Eye, RefreshCw, 
  ExternalLink, Sparkles, FileSpreadsheet
} from 'lucide-react';

import { 
  Language, User, WorkPermit, PermitType, 
  PermitStatus, SafetyNotification, DriveArchiveItem 
} from './types/permit';
import { translations } from './i18n/translations';
import { mockUsers, initialPermits, initialNotifications, mockDriveArchive } from './data/mockData';
import { triggerCsvDownload, simulateGoogleAppsScriptWebhook } from './services/driveSyncService';
import { 
  appendPermitToSheets, 
  fetchPermitsFromSheets, 
  loadCachedPermits, 
  saveCachedPermits,
  loadSheetsConfig,
  isValidWorkerUrl
} from './services/googleSheetsService';

import { PermitFormModal } from './components/PermitFormModal';
import { PermitDetailModal } from './components/PermitDetailModal';
import { MonthlySafetyReport } from './components/MonthlySafetyReport';
import { DriveSyncModal } from './components/DriveSyncModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { UserRoleSwitcher } from './components/UserRoleSwitcher';
import { ToastNotification, ToastItem } from './components/ToastNotification';

export default function App() {
  // Localization
  const [language, setLanguage] = useState<Language>('th');
  const t = translations[language];

  // Current logged in User (Default: Safety Officer)
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);

  // Main State with offline / cached persistence
  const [permits, setPermits] = useState<WorkPermit[]>(() => {
    const cached = loadCachedPermits();
    if (cached && cached.length > 0) {
      return cached;
    }
    return initialPermits;
  });
  const [isLoadingSheetsData, setIsLoadingSheetsData] = useState(false);
  const [lastSheetsFetchTime, setLastSheetsFetchTime] = useState<string | null>(null);

  // Real-time Toast Notifications state
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = (toast: Omit<ToastItem, 'id'> & { id?: string }) => {
    const newToast: ToastItem = {
      id: toast.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...toast,
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
  };

  const [notifications, setNotifications] = useState<SafetyNotification[]>(initialNotifications);
  const [driveArchive, setDriveArchive] = useState<DriveArchiveItem[]>(mockDriveArchive);

  // Navigation View: 'dashboard' | 'reports' | 'drive'
  const [activeView, setActiveView] = useState<'dashboard' | 'reports' | 'drive'>('dashboard');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedPermitForDetail, setSelectedPermitForDetail] = useState<WorkPermit | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isNotifyDrawerOpen, setIsNotifyDrawerOpen] = useState(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);

  // Global Sync Status
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState('10:46');
  const [isWorkerConfigured, setIsWorkerConfigured] = useState(() => isValidWorkerUrl(loadSheetsConfig().workerUrl));

  // Filtered Permits
  const filteredPermits = permits.filter(p => {
    const matchesSearch = 
      p.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contractorCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.facilityZone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedTypeFilter === 'all' || p.type === selectedTypeFilter;
    const matchesStatus = selectedStatusFilter === 'all' || p.status === selectedStatusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Permit metrics
  const activeCount = permits.filter(p => p.status === 'active').length;
  const pendingCount = permits.filter(p => p.status === 'pending').length;
  const approvedCount = permits.filter(p => p.status === 'approved').length;
  const closedCount = permits.filter(p => p.status === 'closed').length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  // Dynamic Calculation: Continuous Safety Working Days (วันทำงานปลอดภัยต่อเนื่อง นับจากอุบัติเหตุครั้งล่าสุด 17 ส.ค. 2026)
  const calculateSafetyDays = (): number => {
    const lastAccidentDate = new Date('2026-08-17');
    const today = new Date();
    const utc1 = Date.UTC(lastAccidentDate.getUTCFullYear(), lastAccidentDate.getUTCMonth(), lastAccidentDate.getUTCDate());
    const utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };
  const safetyDaysCount = calculateSafetyDays();

  // Fetch all permits from Google Sheets via Cloudflare Worker
  const fetchSheetsData = async (isManual = false) => {
    setIsLoadingSheetsData(true);
    try {
      const res = await fetchPermitsFromSheets();
      if (res.success && res.permits && res.permits.length > 0) {
        setPermits(res.permits);
        saveCachedPermits(res.permits);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSheetsFetchTime(timeStr);
        setLastSyncedTime(timeStr);

        if (isManual) {
          showToast({
            type: 'success',
            title: '📊 ซิงค์ข้อมูล Google Sheets สำเร็จ',
            message: `ดึงข้อมูลใบอนุญาตทำงานล่าสุด ${res.permits.length} รายการจาก Google Sheets เรียบร้อยแล้ว`,
            duration: 4000
          });
        }

        const newNotif: SafetyNotification = {
          id: `notif-sheets-fetch-${Date.now()}`,
          title: '📊 ซิงค์ข้อมูล Google Sheets สำเร็จ',
          message: `ดึงข้อมูลใบอนุญาตทำงาน ${res.permits.length} รายการจาก Google Sheets อัตโนมัติเรียบร้อยแล้ว`,
          timestamp: timeStr,
          channel: 'system',
          type: 'success',
          read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
      } else if (isManual && !res.success) {
        showToast({
          type: 'warning',
          title: '⚠️ ไม่สามารถดึงข้อมูลได้',
          message: res.message || 'โปรดตรวจสอบการตั้งค่า Worker URL ในเมนู Sheets & Drive Hub',
          duration: 6000
        });

        const failNotif: SafetyNotification = {
          id: `notif-sheets-fail-${Date.now()}`,
          title: '⚠️ ซิงค์ข้อมูล Google Sheets',
          message: res.message || 'ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบ Worker URL ในเมนู Sheets & Drive Hub',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: 'system',
          type: 'warning',
          read: false,
        };
        setNotifications(prev => [failNotif, ...prev]);
      }
    } catch (e: any) {
      console.warn('Failed to fetch permits from Google Sheets:', e);
      if (isManual) {
        showToast({
          type: 'error',
          title: '❌ เกิดข้อผิดพลาดในการเชื่อมต่อ',
          message: e?.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้',
          duration: 6000
        });
      }
    } finally {
      setIsLoadingSheetsData(false);
    }
  };

  // Automatically fetch from Google Sheets upon initial app launch / page refresh
  useEffect(() => {
    fetchSheetsData(false);
  }, []);

  // Background live sync every 12 seconds to auto-detect permits submitted from other devices
  useEffect(() => {
    const config = loadSheetsConfig();
    if (!isValidWorkerUrl(config.workerUrl)) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetchPermitsFromSheets();
        if (res.success && res.permits && res.permits.length > 0) {
          setPermits(prev => {
            const currentPermitNos = new Set(prev.map(p => p.permitNumber));
            const newIncoming = res.permits.filter(p => !currentPermitNos.has(p.permitNumber));

            if (newIncoming.length > 0) {
              const newest = newIncoming[0];
              showToast({
                type: 'info',
                title: `📥 ได้รับใบงานใหม่จากทีมงาน (${newIncoming.length} รายการ)`,
                message: `[${newest.permitNumber}] ${newest.title} (${newest.contractorCompany}) ดึงขึ้นหน้าจออัตโนมัติแล้ว`,
                permitNumber: newest.permitNumber,
                duration: 7000
              });
              saveCachedPermits(res.permits);
              return res.permits;
            }
            return prev;
          });
        }
      } catch {
        // Silently ignore background sync issues
      }
    }, 12000);

    return () => clearInterval(intervalId);
  }, []);

  // Handlers
  const handleCreatePermit = async (newPermit: WorkPermit) => {
    setPermits(prev => {
      const updated = [newPermit, ...prev];
      saveCachedPermits(updated);
      return updated;
    });

    // Dispatch webhook notification
    const newNotif: SafetyNotification = {
      id: `notif-${Date.now()}`,
      title: `📋 ใบขออนุญาตใหม่: [${newPermit.permitNumber}]`,
      message: `${newPermit.title} (${newPermit.facilityZone}) ยื่นขอโดย ${newPermit.requester?.name || newPermit.contractorCompany} รอการตรวจสอบจาก จป.วิชาชีพ`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'line',
      permitId: newPermit.id,
      type: 'warning',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Show initial sending Toast
    showToast({
      type: 'info',
      title: '⏳ กำลังบันทึกข้อมูล...',
      message: `กำลังส่งใบขออนุญาต [${newPermit.permitNumber}] ไปยัง Google Sheets`,
      permitNumber: newPermit.permitNumber,
      duration: 3500
    });

    // Direct Google Sheets Append via Cloudflare Worker
    try {
      const sheetsResult = await appendPermitToSheets(newPermit, 'create');
      if (sheetsResult.success) {
        showToast({
          type: 'success',
          title: '✅ ส่งข้อมูลเข้า Google Sheets สำเร็จ',
          message: `${sheetsResult.message}`,
          permitNumber: newPermit.permitNumber,
          duration: 6000
        });
      } else {
        showToast({
          type: 'error',
          title: '❌ ส่งข้อมูลเข้า Google Sheets ล้มเหลว',
          message: `${sheetsResult.message || 'โปรดตรวจสอบการตั้งค่า Cloudflare Worker URL'}`,
          permitNumber: newPermit.permitNumber,
          duration: 8000
        });
      }

      const sheetsNotif: SafetyNotification = {
        id: `notif-sheets-${Date.now()}`,
        title: sheetsResult.success ? `📊 ซิงค์ Google Sheets สำเร็จ` : `⚠️ ซิงค์ Google Sheets ล้มเหลว`,
        message: `${sheetsResult.message} (Permit: ${newPermit.permitNumber})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'system',
        permitId: newPermit.id,
        type: sheetsResult.success ? 'success' : 'danger',
        read: false
      };
      setNotifications(prev => [sheetsNotif, ...prev]);
    } catch (err: any) {
      console.error('Google Sheets automatic append failed:', err);
      showToast({
        type: 'error',
        title: '❌ เกิดข้อผิดพลาดในการส่งข้อมูล',
        message: err?.message || 'ไม่สามารถติดต่อ Google Sheets ได้',
        permitNumber: newPermit.permitNumber,
        duration: 8000
      });
    }
  };

  const handleUpdatePermit = async (updated: WorkPermit, notificationMessage?: string) => {
    setPermits(prev => {
      const updatedList = prev.map(p => p.id === updated.id ? updated : p);
      saveCachedPermits(updatedList);
      return updatedList;
    });
    setSelectedPermitForDetail(updated);

    if (notificationMessage) {
      const newNotif: SafetyNotification = {
        id: `notif-${Date.now()}`,
        title: `🔄 อัปเดตสถานะ: ${updated.permitNumber}`,
        message: notificationMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'line',
        permitId: updated.id,
        type: updated.status === 'active' || updated.status === 'approved' ? 'success' : updated.status === 'rejected' ? 'danger' : 'info',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    // Auto append/log state change in Google Sheets when permit is approved, active, or closed
    if (updated.status === 'approved' || updated.status === 'active' || updated.status === 'closed') {
      try {
        const res = await appendPermitToSheets(updated, updated.status === 'closed' ? 'close' : 'update');
        if (res.success) {
          showToast({
            type: 'success',
            title: '✅ บันทึกสถานะลง Google Sheets สำเร็จ',
            message: `ใบงาน [${updated.permitNumber}] สถานะเป็น "${updated.status.toUpperCase()}" เรียบร้อยแล้ว`,
            permitNumber: updated.permitNumber,
            duration: 5000
          });
        } else {
          showToast({
            type: 'error',
            title: '❌ ซิงค์สถานะเข้า Google Sheets ล้มเหลว',
            message: res.message,
            permitNumber: updated.permitNumber,
            duration: 7000
          });
        }
      } catch (err: any) {
        console.error('Failed to sync updated permit to Google Sheets:', err);
        showToast({
          type: 'error',
          title: '❌ ซิงค์สถานะไม่สำเร็จ',
          message: err?.message || 'ไม่สามารถติดต่อ Google Sheets ได้',
          permitNumber: updated.permitNumber,
          duration: 7000
        });
      }
    }
  };

  // Quick Global Sync
  const handleTriggerQuickSync = async () => {
    setIsSyncingDrive(true);
    try {
      const res = await simulateGoogleAppsScriptWebhook('sync_permits', {
        count: permits.length
      });
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      const newNotif: SafetyNotification = {
        id: `notif-${Date.now()}`,
        title: '☁️ Google Drive Database Synced',
        message: `WorkPermit_Database.csv ซิงค์ข้อมูลล่าสุดสำเร็จ (${permits.length} ใบงาน) รหัสอ้างอิง: ${res.driveFileId}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'system',
        type: 'info',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Add report to Google Drive Archive list
  const handleArchiveReport = (filename: string, driveFileId: string) => {
    const newItem: DriveArchiveItem = {
      id: `drv-${Date.now()}`,
      name: filename,
      type: 'pdf',
      size: '2.4 MB',
      modifiedTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      path: `/Corporate_Safety_Vault/Safety_Reports_Archive/${filename}`,
      cloudUrl: `https://drive.google.com/file/d/${driveFileId}/view`,
      localCached: true
    };
    setDriveArchive(prev => [newItem, ...prev]);
  };

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark & BANFERT Company Logo */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-700/60 shadow-sm flex items-center shrink-0">
            <img 
              src="/assets/aistudio/______3d0a2b49.jpg" 
              alt="BANFERT" 
              className="h-6 w-auto object-contain" 
            />
          </div>
          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10 shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <a href="/" className="text-sm sm:text-base font-bold tracking-tight text-slate-100 hover:text-white transition-colors">
                {t.appName}
              </a>
              <span className="hidden lg:inline text-xs text-slate-500 ml-2 font-mono">{t.nav.isoStandard}</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'dashboard' ? 'text-sky-400 font-bold' : 'hover:text-slate-100 text-slate-400'
            }`}
          >
            {t.nav.dashboard}
          </button>
          <button
            onClick={() => setActiveView('reports')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'reports' ? 'text-sky-400 font-bold' : 'hover:text-slate-100 text-slate-400'
            }`}
          >
            {t.nav.reports}
          </button>
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="hover:text-slate-100 text-slate-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.nav.driveHub}</span>
          </button>
          <button
            onClick={() => setIsNotifyDrawerOpen(true)}
            className="hover:text-slate-100 text-slate-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.nav.notifications}</span>
            {unreadNotifs > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </nav>

        {/* Zone 3: Actions (Language Selector, Persona, and Primary CTA) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Multi-language Selector (TH, 中文, EN, MY) */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setLanguage('th')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                language === 'th' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="ภาษาไทย"
            >
              🇹🇭 TH
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                language === 'zh' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="中文"
            >
              🇨🇳 中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                language === 'en' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="English"
            >
              🇬🇧 EN
            </button>
            <button
              onClick={() => setLanguage('my')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                language === 'my' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="မြန်မာ"
            >
              🇲🇲 MY
            </button>
          </div>

          {/* User Persona Switcher */}
          <button
            onClick={() => setIsUserSwitcherOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 cursor-pointer transition-colors"
          >
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="User" className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span className="hidden sm:inline max-w-[110px] truncate">{currentUser.name.split(' ')[0]}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 font-mono hidden xl:inline">
              {currentUser.role === 'safety_officer' ? 'จป.' : currentUser.role === 'approver' ? 'Issuer' : currentUser.role === 'requester' ? 'Contractor' : 'Admin'}
            </span>
          </button>

          {/* New Permit Primary CTA */}
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.nav.newPermit}</span>
          </button>
        </div>
      </header>

      {/* 2. GOOGLE DRIVE & SHEETS SYNC STATUS BAR */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-8 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
              isWorkerConfigured
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheets Live Sync</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isWorkerConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </button>

          <button
            onClick={() => fetchSheetsData(true)}
            disabled={isLoadingSheetsData}
            title="ดึงข้อมูลใบงานทั้งหมดจาก Google Sheets ใหม่ทันที"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheetsData ? 'animate-spin text-sky-400' : ''}`} />
            <span>{isLoadingSheetsData ? 'กำลังโหลดจากชีต...' : 'รีเฟรชจาก Google Sheets'}</span>
          </button>
          
          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-mono text-[11px] font-semibold">{permits.length} ใบงาน</span>
            {lastSheetsFetchTime && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-mono text-[11px]">ดึงข้อมูลล่าสุด: {lastSheetsFetchTime}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerQuickSync}
            disabled={isSyncingDrive}
            className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncingDrive ? 'animate-spin text-sky-400' : ''}`} />
            <span>{isSyncingDrive ? 'Syncing...' : 'Sync Now'}</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => triggerCsvDownload(permits, 'WorkPermit_Database.csv')}
            className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>CSV Export</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Sheets & Drive Hub</span>
          </button>
        </div>
      </div>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* VIEW: MONTHLY REPORT */}
        {activeView === 'reports' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h1 className="text-lg font-bold text-slate-100">{t.report.title}</h1>
                <p className="text-xs text-slate-400">{t.report.monthlySummary}</p>
              </div>
              <button
                onClick={() => setActiveView('dashboard')}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                ← {t.nav.dashboard}
              </button>
            </div>
            <MonthlySafetyReport 
              permits={permits} 
              language={language} 
              onSaveToDriveArchive={handleArchiveReport} 
            />
          </div>
        ) : (
          /* VIEW: DASHBOARD */
          <div className="space-y-6">
            {/* Warning banner when Worker URL is not yet configured for multi-device sync */}
            {!isWorkerConfigured && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-300">ยังไม่ได้ระบุ Cloudflare Worker URL สำหรับเชื่อมต่อ Google Sheets</span>
                    <p className="text-amber-200/80 text-[11px] mt-0.5">
                      เพื่อให้เครื่องของเพื่อนร่วมงานและอุปกรณ์อื่นส่งใบขออนุญาตเข้าสู่ฐานข้อมูลกลางได้ กรุณาตั้งค่า Worker URL ที่ออนไลน์อยู่จริง
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDriveModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  ตั้งค่า Worker URL ทันที
                </button>
              </div>
            )}

            {/* Hero Plant Banner & Zero Accident Days Counter Strip */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <img 
                  src="/src/assets/images/industrial_plant_backdrop_1793008274586.jpg" 
                  alt="Industrial Plant" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
              </div>

              <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                    <span className="bg-white px-2 py-0.5 rounded shadow-sm inline-flex items-center">
                      <img 
                        src="/assets/aistudio/______3d0a2b49.jpg" 
                        alt="BANFERT" 
                        className="h-3.5 w-auto object-contain" 
                      />
                    </span>
                    <span className="uppercase tracking-wider font-semibold">{t.appName}</span>
                    <span>·</span>
                    <span className="text-slate-400">{t.dashboard.heroSubtitle}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight text-balance">
                    {t.tagline}
                  </h1>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t.dashboard.heroDesc}
                  </p>
                </div>

                {/* Metric Strip */}
                <div className="flex items-center gap-4 bg-slate-950/80 border border-emerald-500/30 p-4 rounded-xl shadow-lg shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
                      {t.zeroAccidentDays}
                    </span>
                    <div className="text-2xl font-extrabold text-slate-100 font-mono tabular-nums">
                      {safetyDaysCount} <span className="text-sm font-normal text-slate-400">{t.dashboard.daysUnit}</span>
                    </div>
                    <span className="text-[11px] text-emerald-400/90 font-medium">{t.dashboard.zeroLti}</span>
                  </div>
                </div>
              </div>

              {/* Status Counters Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-800 bg-slate-950/60 divide-x divide-slate-800 text-xs">
                <button
                  onClick={() => setSelectedStatusFilter('active')}
                  className="p-4 text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <span className="text-slate-400">{t.status.active}</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">{activeCount}</div>
                  <span className="text-[10px] text-slate-500">{t.dashboard.activeDesc}</span>
                </button>

                <button
                  onClick={() => setSelectedStatusFilter('pending')}
                  className="p-4 text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <span className="text-slate-400">{t.status.pending}</span>
                  <div className="text-xl font-bold text-amber-400 font-mono mt-0.5 tabular-nums">{pendingCount}</div>
                  <span className="text-[10px] text-slate-500">{t.dashboard.pendingDesc}</span>
                </button>

                <button
                  onClick={() => setSelectedStatusFilter('approved')}
                  className="p-4 text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <span className="text-slate-400">{t.status.approved}</span>
                  <div className="text-xl font-bold text-sky-400 font-mono mt-0.5 tabular-nums">{approvedCount}</div>
                  <span className="text-[10px] text-slate-500">{t.dashboard.approvedDesc}</span>
                </button>

                <button
                  onClick={() => setSelectedStatusFilter('closed')}
                  className="p-4 text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <span className="text-slate-400">{t.status.closed}</span>
                  <div className="text-xl font-bold text-slate-300 font-mono mt-0.5 tabular-nums">{closedCount}</div>
                  <span className="text-[10px] text-slate-500">{t.dashboard.closedDesc}</span>
                </button>
              </div>
            </div>

            {/* Daily Safety Alert Banner */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-300">{t.dashboard.dailyAlertTitle}:</span>
                  <p className="text-slate-300">
                    {t.dashboard.dailyAlertDesc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNotifyDrawerOpen(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold whitespace-nowrap shrink-0 hover:underline cursor-pointer"
              >
                {t.dashboard.viewAlerts}
              </button>
            </div>

            {/* 8 HIGH-RISK WORK TYPE SELECTOR CARDS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {t.dashboard.filterByRisk}
                </span>
                <button
                  onClick={() => setSelectedTypeFilter('all')}
                  className={`text-xs ${selectedTypeFilter === 'all' ? 'text-sky-400 font-bold' : 'text-slate-500 hover:text-slate-300'} cursor-pointer`}
                >
                  {t.dashboard.showAll} ({permits.length})
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {(
                  [
                    'hot_work',
                    'height_work',
                    'confined_space',
                    'electrical_work',
                    'chemical_handling',
                    'excavation',
                    'lifting',
                    'cold_work'
                  ] as PermitType[]
                ).map(typeKey => {
                  const Icon = permitTypeIcons[typeKey];
                  const info = t.permitTypes[typeKey];
                  const isSelected = selectedTypeFilter === typeKey;
                  const count = permits.filter(p => p.type === typeKey).length;

                  return (
                    <button
                      key={typeKey}
                      onClick={() => setSelectedTypeFilter(isSelected ? 'all' : typeKey)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-sky-950/60 border-sky-500 shadow-md ring-1 ring-sky-500'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-400 tabular-nums">{count}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 line-clamp-1">{info.title.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEARCH & STATUS FILTER TOOLBAR */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.dashboard.searchPlaceholder}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Status Filter Segmented Control */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 gap-1 w-full sm:w-auto overflow-x-auto">
                {(['all', 'active', 'pending', 'approved', 'closed'] as const).map(statusKey => {
                  const isActive = selectedStatusFilter === statusKey;
                  const label = statusKey === 'all' 
                    ? t.dashboard.statusFilterAll 
                    : t.status[statusKey as PermitStatus];

                  return (
                    <button
                      key={statusKey}
                      onClick={() => setSelectedStatusFilter(statusKey)}
                      className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-800 text-sky-400 shadow-sm font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* HIGH-DENSITY DATA TABLE OF WORK PERMITS */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                    <tr>
                      <th className="px-4 py-3.5">{t.dashboard.tablePermitNo}</th>
                      <th className="px-4 py-3.5">{t.dashboard.tableRiskType}</th>
                      <th className="px-4 py-3.5">{t.dashboard.tableTitleZone}</th>
                      <th className="px-4 py-3.5">{t.dashboard.tableContractor}</th>
                      <th className="px-4 py-3.5">{t.dashboard.tableSchedule}</th>
                      <th className="px-4 py-3.5">{t.dashboard.tableStatus}</th>
                      <th className="px-4 py-3.5">{t.dashboard.tableSignatures}</th>
                      <th className="px-4 py-3.5 text-right">{t.dashboard.tableActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredPermits.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-1">
                              <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-slate-200 text-sm">{t.dashboard.emptyTitle}</span>
                            <p className="text-xs text-slate-500">
                              {t.dashboard.emptyDesc}
                            </p>
                            <button
                              onClick={() => setIsFormModalOpen(true)}
                              className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                            >
                              <Plus className="w-4 h-4 stroke-[3]" />
                              <span>{t.dashboard.btnCreateFirst}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPermits.map(permit => {
                        const Icon = permitTypeIcons[permit.type];
                        const typeInfo = t.permitTypes[permit.type];
                        const sigCount = (permit.signatures?.requester ? 1 : 0) + (permit.signatures?.safetyOfficer ? 1 : 0);

                        return (
                          <tr 
                            key={permit.id}
                            className="hover:bg-slate-850/50 transition-colors"
                          >
                            {/* Permit No */}
                            <td className="px-4 py-3.5 font-mono font-bold text-sky-400 whitespace-nowrap">
                              {permit.permitNumber}
                            </td>

                            {/* Risk Type Badge */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="p-1 rounded bg-slate-800 text-slate-300">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-semibold text-slate-200">{typeInfo.code}</span>
                              </div>
                            </td>

                            {/* Title & Zone */}
                            <td className="px-4 py-3.5 max-w-xs">
                              <div className="font-semibold text-slate-200 line-clamp-1">{permit.title}</div>
                              <span className="text-[11px] text-slate-400">{permit.facilityZone}</span>
                            </td>

                            {/* Contractor */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="text-slate-200">{permit.contractorCompany}</div>
                              <span className="text-[11px] text-slate-500">{permit.requester?.name || 'Contractor'}</span>
                            </td>

                            {/* Schedule */}
                            <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                              <div>{permit.startDate}</div>
                              <span className="text-slate-500">{permit.startTime} - {permit.endTime}</span>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full font-semibold border text-[11px] ${
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
                            </td>

                            {/* Signatures */}
                            <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                              <span className="text-sky-400 font-bold">{sigCount}</span>
                              <span className="text-slate-600">/2</span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-right">
                              <button
                                onClick={() => setSelectedPermitForDetail(permit)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5 text-sky-400" />
                                <span>{t.dashboard.btnInspect}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-6 px-4 sm:px-8 bg-slate-950 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>{t.dashboard.footerIso}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.dashboard.footerDrive}</span>
          </span>
          <span>·</span>
          <span>{t.dashboard.footerPaperless}</span>
        </div>
      </footer>

      {/* MODALS */}
      <PermitFormModal
        isOpen={isFormModalOpen}
        currentUser={currentUser}
        language={language}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreatePermit}
      />

      <PermitDetailModal
        isOpen={!!selectedPermitForDetail}
        permit={selectedPermitForDetail}
        currentUser={currentUser}
        language={language}
        onClose={() => setSelectedPermitForDetail(null)}
        onUpdatePermit={handleUpdatePermit}
      />

      <DriveSyncModal
        isOpen={isDriveModalOpen}
        permits={permits}
        driveArchive={driveArchive}
        language={language}
        onClose={() => setIsDriveModalOpen(false)}
        onPermitsReloaded={loadedPermits => {
          setPermits(loadedPermits);
          saveCachedPermits(loadedPermits);
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setLastSheetsFetchTime(timeStr);
        }}
        onSyncComplete={msg => {
          setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }}
      />

      <NotificationDrawer
        isOpen={isNotifyDrawerOpen}
        notifications={notifications}
        language={language}
        onClose={() => setIsNotifyDrawerOpen(false)}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }}
        onClearAll={() => setNotifications([])}
        onSendTestNotification={(channel, message) => {
          const newNotif: SafetyNotification = {
            id: `notif-${Date.now()}`,
            title: channel === 'line' ? '🟢 LINE Notify Broadcast' : channel === 'wechat' ? '💬 WeChat Work Alert' : '🐧 QQ Safety Robot',
            message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            channel,
            type: 'warning',
            read: false
          };
          setNotifications(prev => [newNotif, ...prev]);
        }}
      />

      <UserRoleSwitcher
        isOpen={isUserSwitcherOpen}
        currentUser={currentUser}
        allUsers={mockUsers}
        language={language}
        onClose={() => setIsUserSwitcherOpen(false)}
        onSelectUser={u => setCurrentUser(u)}
      />

      {/* Real-time Floating Toast Alert Notifications */}
      <ToastNotification
        toasts={toasts}
        onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))}
        onOpenPermit={permitNumber => {
          const found = permits.find(p => p.permitNumber === permitNumber);
          if (found) {
            setSelectedPermitForDetail(found);
          }
        }}
      />
    </div>
  );
}

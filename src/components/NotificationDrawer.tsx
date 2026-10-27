import React, { useState } from 'react';
import { 
  X, Bell, Send, CheckCircle2, ShieldAlert, 
  MessageSquare, Settings, Check, Sparkles, Trash2 
} from 'lucide-react';
import { Language, SafetyNotification } from '../types/permit';
import { translations } from '../i18n/translations';

interface NotificationDrawerProps {
  isOpen: boolean;
  notifications: SafetyNotification[];
  language: Language;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSendTestNotification: (channel: 'line' | 'wechat' | 'qq', message: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  notifications,
  language,
  onClose,
  onMarkAllAsRead,
  onClearAll,
  onSendTestNotification
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'logs' | 'settings'>('logs');
  const [lineToken, setLineToken] = useState('LINE_NOTIFY_TOKEN_DEMO_2026_XYZ');
  const [testChannel, setTestChannel] = useState<'line' | 'wechat' | 'qq'>('line');
  const [customMsg, setCustomMsg] = useState('แจ้งเตือนด่วน: ตรวจสอบความปลอดภัยประจำวันเรียบร้อย (Safe Operations)');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleTriggerTest = () => {
    onSendTestNotification(testChannel, customMsg);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{t.notify.title}</h2>
              <p className="text-xs text-slate-400">LINE Notify · WeChat Work · QQ Webhook Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-medium px-6 gap-2">
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'logs' ? 'border-emerald-500 text-emerald-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ประวัติการแจ้งเตือน ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'border-emerald-500 text-emerald-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ตั้งค่า Webhook Token & ทดสอบส่ง
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-300">
          {activeTab === 'logs' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400">
                  ข้อความแจ้งเตือนเรียลไทม์ (Webhook Dispatch Stream)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-sky-400 hover:underline cursor-pointer"
                  >
                    อ่านทั้งหมดแล้ว
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    onClick={onClearAll}
                    className="text-rose-400 hover:underline cursor-pointer"
                  >
                    ล้างประวัติ
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  ไม่มีข้อความแจ้งเตือนใหม่
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        !n.read 
                          ? 'bg-slate-900 border-sky-500/40' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            n.channel === 'line' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : n.channel === 'wechat'
                              ? 'bg-green-600/10 text-green-300 border border-green-600/30'
                              : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                          }`}>
                            {n.channel.toUpperCase()}
                          </span>
                          <span className="font-semibold text-slate-200">{n.title}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-xs pl-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <span className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <span>{t.notify.tokenSettings}</span>
                </span>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    LINE Notify Personal Access Token (Bearer Token)
                  </label>
                  <input
                    type="password"
                    value={lineToken}
                    onChange={e => setLineToken(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    ระบบจะส่งข้อความแจ้งเตือนอัตโนมัติไปยังกลุ่มความปลอดภัย (Safety Line Group)
                  </p>
                </div>
              </div>

              {/* Test Trigger Section */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <span className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>{t.notify.testTrigger}</span>
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {(['line', 'wechat', 'qq'] as const).map(channel => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => setTestChannel(channel)}
                      className={`py-2 px-3 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                        testChannel === channel
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {channel === 'line' ? 'LINE Notify' : channel === 'wechat' ? 'WeChat Work' : 'QQ Safety Bot'}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">ข้อความจำลองที่ต้องการส่ง</label>
                  <input
                    type="text"
                    value={customMsg}
                    onChange={e => setCustomMsg(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {sentSuccess && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.notify.messageSent}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleTriggerTest}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>ส่งสัญญาณจำลองทันที (Send Test Webhook)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

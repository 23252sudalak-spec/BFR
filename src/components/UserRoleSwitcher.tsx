import React, { useState } from 'react';
import { 
  X, UserCheck, Shield, HardHat, Building, 
  LogIn, Check, Mail, MessageCircle, LogOut 
} from 'lucide-react';
import { User, UserRole, AuthChannel, Language } from '../types/permit';
import { translations } from '../i18n/translations';

interface UserRoleSwitcherProps {
  isOpen: boolean;
  currentUser: User;
  allUsers: User[];
  language: Language;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export const UserRoleSwitcher: React.FC<UserRoleSwitcherProps> = ({
  isOpen,
  currentUser,
  allUsers,
  language,
  onClose,
  onSelectUser
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [activeChannel, setActiveChannel] = useState<AuthChannel>('line');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('••••••••');

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'safety_officer':
        return { label: `Safety Officer (${t.detail.roleSafetyOfficer})`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'approver':
        return { label: `Area Owner / Issuer (${t.detail.roleAreaOwner})`, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
      case 'requester':
        return { label: `Requester / Contractor (${t.detail.roleRequester})`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'admin':
        return { label: 'EHS Admin / Director', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'worker':
        return { label: `Certified Worker`, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{t.roleSwitcher.title}</h2>
              <p className="text-xs text-slate-400">{t.roleSwitcher.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channels Simulation Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-medium">{t.roleSwitcher.loginVia}:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveChannel('line')}
              className={`px-3 py-1 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                activeChannel === 'line' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              LINE
            </button>
            <button
              onClick={() => setActiveChannel('wechat')}
              className={`px-3 py-1 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                activeChannel === 'wechat' 
                  ? 'bg-green-600/20 text-green-300 border-green-600/40' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              WeChat
            </button>
            <button
              onClick={() => setActiveChannel('qq')}
              className={`px-3 py-1 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                activeChannel === 'qq' 
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              QQ
            </button>
            <button
              onClick={() => setActiveChannel('email')}
              className={`px-3 py-1 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                activeChannel === 'email' 
                  ? 'bg-slate-700 text-slate-200 border-slate-600' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              Email/Password
            </button>
          </div>
        </div>

        {/* User Personas List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          <span className="font-semibold text-slate-300 block mb-1">
            {t.roleSwitcher.selectProfile}:
          </span>

          <div className="space-y-2">
            {allUsers.map(user => {
              const badge = getRoleBadge(user.role);
              const isCurrent = user.id === currentUser.id;

              return (
                <div
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-sky-950/40 border-sky-500 shadow-md ring-1 ring-sky-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                        {user.name.substring(0, 2)}
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <span>{user.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] text-sky-400 font-normal">({t.roleSwitcher.activeSession})</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{user.company} · {user.email}</div>
                      <div className="pt-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 hover:text-slate-300 font-medium">{t.roleSwitcher.switchTo} →</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

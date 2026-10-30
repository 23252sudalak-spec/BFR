import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, Info, X, ExternalLink 
} from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  permitNumber?: string;
  timestamp?: string;
  duration?: number; // ms, default 5000
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  onOpenPermit?: (permitNumber: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
  onOpenPermit,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
      role="region"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
          onOpenPermit={onOpenPermit}
        />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{
  toast: ToastItem;
  onDismiss: () => void;
  onOpenPermit?: (permitNumber: string) => void;
}> = ({ toast, onDismiss, onOpenPermit }) => {
  const duration = toast.duration ?? 5000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const configByType = {
    success: {
      borderColor: 'border-emerald-500/50',
      bgColor: 'bg-slate-900/95',
      accentColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      progressBar: 'bg-emerald-500',
      shadow: 'shadow-emerald-950/50 shadow-xl',
      Icon: CheckCircle2,
    },
    error: {
      borderColor: 'border-rose-500/50',
      bgColor: 'bg-slate-900/95',
      accentColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      progressBar: 'bg-rose-500',
      shadow: 'shadow-rose-950/50 shadow-xl',
      Icon: XCircle,
    },
    warning: {
      borderColor: 'border-amber-500/50',
      bgColor: 'bg-slate-900/95',
      accentColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      progressBar: 'bg-amber-500',
      shadow: 'shadow-amber-950/50 shadow-xl',
      Icon: AlertTriangle,
    },
    info: {
      borderColor: 'border-sky-500/50',
      bgColor: 'bg-slate-900/95',
      accentColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      progressBar: 'bg-sky-500',
      shadow: 'shadow-sky-950/50 shadow-xl',
      Icon: Info,
    },
  }[toast.type];

  const { Icon } = configByType;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border ${configByType.borderColor} ${configByType.bgColor} ${configByType.shadow} backdrop-blur-md p-4 transition-all animate-in slide-in-from-top-2 fade-in duration-200`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${configByType.badgeBg}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-bold ${configByType.accentColor}`}>
              {toast.title}
            </span>
            {toast.permitNumber && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {toast.permitNumber}
              </span>
            )}
            {toast.timestamp && (
              <span className="text-[10px] text-slate-500 font-mono ml-auto">
                {toast.timestamp}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-200 leading-relaxed break-words">
            {toast.message}
          </p>

          {toast.permitNumber && onOpenPermit && (
            <button
              onClick={() => onOpenPermit(toast.permitNumber!)}
              className="mt-2 text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>เปิดดูรายละเอียดใบงาน</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          aria-label="ปิดการแจ้งเตือน"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
        <div
          className={`h-full ${configByType.progressBar} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

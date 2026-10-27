import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool, Sparkles } from 'lucide-react';
import { Language } from '../types/permit';
import { translations } from '../i18n/translations';

interface DigitalSignaturePadProps {
  signerName: string;
  signerRole: string;
  language: Language;
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  signerName,
  signerRole,
  language,
  onSave,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI Canvas Scaling
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 400;
    const height = 180;
    
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0284c7'; // Professional tech blue
    ctx.lineWidth = 2.5;

    // Draw baseline guideline
    ctx.save();
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, 135);
    ctx.lineTo(width - 30, 135);
    ctx.stroke();
    ctx.restore();
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);

    // Redraw baseline
    const width = canvas.parentElement?.clientWidth || 400;
    ctx.save();
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, 135);
    ctx.lineTo(width - 30, 135);
    ctx.stroke();
    ctx.restore();

    setHasDrawn(false);
  };

  const applyPresetSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(40, 110);
    ctx.bezierCurveTo(80, 40, 110, 140, 160, 90);
    ctx.bezierCurveTo(190, 60, 220, 130, 280, 100);
    ctx.bezierCurveTo(290, 95, 330, 120, 360, 105);
    ctx.stroke();

    // Underline flourish
    ctx.beginPath();
    ctx.moveTo(50, 125);
    ctx.lineTo(350, 122);
    ctx.stroke();

    setHasDrawn(true);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{t.workflow.finalSignature}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-sky-400 font-medium">{signerName}</span>
              <span>·</span>
              <span>{signerRole}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={applyPresetSignature}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>จำลองลายเซ็น (Simulate Signature)</span>
        </button>
      </div>

      <div className="relative border border-slate-700 rounded-lg bg-slate-950 overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair block"
        />
        <div className="absolute bottom-2 left-4 text-[11px] text-slate-500 pointer-events-none select-none">
          Sign here / เซ็นชื่อที่นี่ (Touch or Mouse)
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span>{t.workflow.clearSignature}</span>
        </button>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {t.form.cancel}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawn}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm ${
              hasDrawn
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer shadow-sky-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t.workflow.signNow}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

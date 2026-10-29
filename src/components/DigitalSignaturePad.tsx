import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool, Sparkles, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Language } from '../types/permit';
import { translations } from '../i18n/translations';

interface DigitalSignaturePadProps {
  signerName: string;
  signerRole: string;
  language: Language;
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
  defaultMode?: 'draw' | 'upload';
}

/**
 * Resize and compress uploaded signature image so it fits within Google Sheets and local storage
 */
export const processSignatureImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('กรุณาเลือกไฟล์รูปภาพ (.png, .jpg, .jpeg, .webp)'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 400;
        const maxH = 160;
        let w = img.width;
        let h = img.height;
        const scale = Math.min(maxW / w, maxH / h, 1);
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('ไม่สามารถประมวลผลไฟล์รูปภาพได้'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
    reader.readAsDataURL(file);
  });
};

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  signerName,
  signerRole,
  language,
  onSave,
  onCancel,
  defaultMode = 'draw'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<'draw' | 'upload'>(defaultMode);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const t = translations[language];

  useEffect(() => {
    if (mode !== 'draw') return;

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
  }, [mode]);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    try {
      const dataUrl = await processSignatureImageFile(file);
      setUploadedImageUrl(dataUrl);
      setUploadFileName(file.name);
    } catch (err: any) {
      setUploadError(err.message || 'ไม่สามารถโหลดรูปภาพได้');
    }
  };

  const handleSave = () => {
    if (mode === 'upload' && uploadedImageUrl) {
      onSave(uploadedImageUrl);
      return;
    }

    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const isSaveReady = mode === 'draw' ? hasDrawn : !!uploadedImageUrl;

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-2xl space-y-4">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            {mode === 'draw' ? <PenTool className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
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

        {/* Tab Switcher: Draw vs Upload */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              mode === 'draw' 
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>วาดลายเซ็น (Draw)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              mode === 'upload' 
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>อัปโหลดภาพ (.png/.jpg)</span>
          </button>
        </div>
      </div>

      {/* DRAW MODE */}
      {mode === 'draw' && (
        <div className="space-y-3">
          <div className="flex items-center justify-end">
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
        </div>
      )}

      {/* UPLOAD MODE */}
      {mode === 'upload' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {!uploadedImageUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-sky-500 bg-slate-950/60 hover:bg-sky-500/5 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5"
            >
              <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200">
                  คลิกเพื่อเลือกไฟล์ภาพลายเซ็นของคุณ
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  รองรับไฟล์ .PNG, .JPG, .JPEG (แนะนำภาพพื้นหลังโปร่งใสหรือสีขาว)
                </p>
              </div>
              <button
                type="button"
                className="mt-1 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold"
              >
                เลือกรูปภาพจากเครื่อง
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>ภาพลายเซ็นที่เลือก: {uploadFileName || 'Signature Image'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImageUrl(null);
                    setUploadFileName(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบภาพเพื่อเลือกใหม่</span>
                </button>
              </div>

              {/* Preview container with clean contrast background */}
              <div className="h-28 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center p-3 overflow-hidden">
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded Signature Preview"
                  className="max-h-full max-w-full object-contain filter invert contrast-125 opacity-90"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                ระบบจะแปลงภาพเป็น Base64 และบันทึกร่วมกับใบงานใน Google Sheets อัตโนมัติ
              </p>
            </div>
          )}

          {uploadError && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
        <div>
          {mode === 'draw' && (
            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>{t.workflow.clearSignature}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t.form.cancel}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isSaveReady}
            className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
              isSaveReady
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer shadow-sky-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>ยืนยันลงนาม (Confirm Signature)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { QrCode, X, Copy, Check, Smartphone, Users } from 'lucide-react';
import { useToast } from '../context/ToastContext.js';

interface QrAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  groupCode: string;
  lessonTitle?: string;
}

export const QrAttendanceModal: React.FC<QrAttendanceModalProps> = ({
  isOpen,
  onClose,
  groupName,
  groupCode,
  lessonTitle
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(groupCode);
    setCopied(true);
    showToast('تم نسخ رمز المجموعة!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up text-center p-6">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-200">
          <QrCode className="w-8 h-8" />
        </div>

        <h3 className="font-extrabold text-base text-slate-900">تسجيل الحضور الذكي بالـ QR</h3>
        <p className="text-xs text-slate-500 mt-1">
          {groupName} {lessonTitle ? `• ${lessonTitle}` : ''}
        </p>

        {/* QR Simulation Box with high contrast */}
        <div className="my-6 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-emerald-300 inline-block">
          <div className="w-48 h-48 bg-white p-3 rounded-xl shadow-inner flex flex-col items-center justify-center border border-slate-200">
            {/* SVG stylized QR pattern */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
              <rect x="10" y="10" width="25" height="25" fill="currentColor" rx="2" />
              <rect x="15" y="15" width="15" height="15" fill="white" />
              <rect x="18" y="18" width="9" height="9" fill="currentColor" />

              <rect x="65" y="10" width="25" height="25" fill="currentColor" rx="2" />
              <rect x="70" y="15" width="15" height="15" fill="white" />
              <rect x="73" y="18" width="9" height="9" fill="currentColor" />

              <rect x="10" y="65" width="25" height="25" fill="currentColor" rx="2" />
              <rect x="15" y="70" width="15" height="15" fill="white" />
              <rect x="18" y="73" width="9" height="9" fill="currentColor" />

              <rect x="42" y="15" width="6" height="6" fill="currentColor" />
              <rect x="52" y="25" width="6" height="6" fill="currentColor" />
              <rect x="45" y="45" width="10" height="10" fill="currentColor" rx="2" />
              <rect x="65" y="55" width="6" height="6" fill="currentColor" />
              <rect x="55" y="70" width="8" height="8" fill="currentColor" />
              <rect x="75" y="75" width="10" height="10" fill="currentColor" />
            </svg>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">رمز التحضير السريع:</span>
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="font-mono font-black text-sm text-emerald-800 tracking-wider">
                {groupCode}
              </span>
              <button
                onClick={copyCode}
                className="text-slate-400 hover:text-emerald-700 p-1"
                title="نسخ الرمز"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="text-right bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>طريقة استخدام كود التحضير:</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed pr-6">
            يقوم الطلاب بمسح الكود بكاميرا الهاتف أو إدخال الرمز السريع لتسجيل الحضور الفوري في الحصة دون الحاجة للنداء اليدوي.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
        >
          تم، إغلاق النافذة
        </button>
      </div>
    </div>
  );
};

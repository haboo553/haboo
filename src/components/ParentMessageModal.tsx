import React, { useState, useEffect } from 'react';
import { Send, Copy, Sparkles, X, MessageSquare, Check } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Student } from '../types.js';

interface ParentMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  teacherName?: string;
  subject?: string;
}

export const ParentMessageModal: React.FC<ParentMessageModalProps> = ({
  isOpen,
  onClose,
  student,
  teacherName,
  subject
}) => {
  const { user, teacher } = useAuth();
  const { showToast } = useToast();
  const [tone, setTone] = useState<'formal' | 'encouraging' | 'urgent'>('formal');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [messageText, setMessageText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const effectiveTeacherName = teacherName || user?.name || 'الأستاذ';
  const effectiveSubject = subject || teacher?.subject || 'المادة';

  const generateMessage = async () => {
    if (!student) return;
    setGenerating(true);
    const res = await apiRequest('/ai/parent-message', {
      method: 'POST',
      body: JSON.stringify({
        studentName: student.name,
        parentName: student.parentName,
        teacherName: effectiveTeacherName,
        subject: effectiveSubject,
        attendanceRate: student.attendanceRate || 100,
        examsAverage: student.examsAverage || 0,
        homeworkRate: student.homeworkCompletionRate || 100,
        teacherNotes,
        tone
      })
    });

    setGenerating(false);
    if (res.success && res.data) {
      setMessageText(res.data.messageText);
    } else {
      showToast('تعذر صياغة الرسالة، يرجى المحاولة مرة أخرى.', 'error');
    }
  };

  useEffect(() => {
    if (isOpen && student) {
      generateMessage();
    }
  }, [isOpen, student, tone]);

  if (!isOpen || !student) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    showToast('تم نسخ نص الرسالة للحافظة بنجاح!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const openInWhatsApp = () => {
    // Format phone: remove spaces, dashes, prepend country code if needed
    let cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      // Egypt
      cleanPhone = '20' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('05') && cleanPhone.length === 10) {
      // Saudi / UAE
      cleanPhone = '966' + cleanPhone.substring(1);
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                مراسلة ولي الأمر عبر واتساب (WhatsApp)
              </h3>
              <p className="text-xs text-slate-500">
                الطالب: <span className="font-bold text-slate-700">{student.name}</span> | ولي الأمر: {student.parentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">طبيعة ونبرة الرسالة التربوية</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTone('formal')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  tone === 'formal'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                تقرير دوري رسمي
              </button>
              <button
                type="button"
                onClick={() => setTone('encouraging')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  tone === 'encouraging'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                تشجيع وإشادة بالتقدم
              </button>
              <button
                type="button"
                onClick={() => setTone('urgent')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  tone === 'urgent'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                تنبيه عاجل لتعويض غياب/درجة
              </button>
            </div>
          </div>

          {/* Teacher custom notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظة شخصية إضافية لإدراجها في نص الرسالة (اختياري)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={teacherNotes}
                onChange={e => setTeacherNotes(e.target.value)}
                placeholder="مثال: يرجى متابعة حل تدريبات الدرس الأخير ومراجعة جدول الضرب"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
              />
              <button
                onClick={generateMessage}
                disabled={generating}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                تحديث
              </button>
            </div>
          </div>

          {/* Generated Message Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>نص الرسالة المعد للإرسال</span>
              </label>
              <span className="text-[11px] text-slate-400">يمكنك تعديل النص مباشرة قبل الإرسال</span>
            </div>
            <textarea
              rows={8}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="w-full p-3.5 bg-emerald-50/30 border border-emerald-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-sans outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={openInWhatsApp}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>إرسال عبر واتساب ({student.parentPhone})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

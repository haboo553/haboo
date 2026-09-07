import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Sparkles,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  Smartphone,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiRequest } from '../lib/api.js';
import { ConfirmationModal } from '../components/ConfirmationModal.js';

export const SettingsView: React.FC = () => {
  const { user, teacher } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(teacher?.phone || '01012345678');
  const [subject, setSubject] = useState(teacher?.subject || 'الرياضيات والفيزياء');
  const [stage, setStage] = useState(teacher?.stage || 'المرحلة الثانوية');

  // Preferences toggles
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [consecutiveAbsenceAlert, setConsecutiveAbsenceAlert] = useState(true);
  const [autoExamRank, setAutoExamRank] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);

  const [saving, setSaving] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate updating settings
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    showToast('تم حفظ التفضيلات والإعدادات بنجاح!', 'success');
  };

  const confirmResetData = async () => {
    setResetConfirmOpen(false);
    const res = await apiRequest('/admin/reset-demo', { method: 'POST' });
    if (res.success) {
      showToast('تمت استعادة البيانات الافتراضية بنجاح!', 'success');
      window.location.reload();
    } else {
      showToast('تعذر إعادة تعيين البيانات.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">إعدادات الحساب والمنصة</h2>
            <p className="text-xs text-slate-500">تخصيص الملف الشخصي، خيارات التنبيهات، وقواعد الذكاء الاصطناعي</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Personal & Teaching Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>البيانات الشخصية والأكاديمية</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل للمدرس</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف / واتساب المعلم</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المادة الدراسية الأساسية</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Automation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>تفضيلات التنبيهات والأتمتة</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-xs text-slate-900 block">تنبيهات الغياب المتكرر</span>
                <span className="text-[11px] text-slate-500">إظهار شارة تحذير فورية عند غياب الطالب حصتين متتاليتين</span>
              </div>
              <input
                type="checkbox"
                checked={consecutiveAbsenceAlert}
                onChange={e => setConsecutiveAbsenceAlert(e.target.checked)}
                className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-xs text-slate-900 block">الترتيب التلقائي للاختبارات</span>
                <span className="text-[11px] text-slate-500">احتساب رتبة الطالب والأوائل تلقائياً في كل اختبار</span>
              </div>
              <input
                type="checkbox"
                checked={autoExamRank}
                onChange={e => setAutoExamRank(e.target.checked)}
                className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-xs text-slate-900 block">توصيات المساعد الذكي التلقائية</span>
                <span className="text-[11px] text-slate-500">اقتراح مراجعات وأسئلة تدعيم بناءً على نتائج الاختبارات</span>
              </div>
              <input
                type="checkbox"
                checked={aiSuggestions}
                onChange={e => setAiSuggestions(e.target.checked)}
                className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة تعيين البيانات للوضع الافتراضي</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={resetConfirmOpen}
        title="إعادة تعيين البيانات التجريبية"
        message="هل أنت متأكد من رغبتك في إعادة تعيين البيانات التجريبية إلى الوضع الافتراضي النظيف؟ سيتم استعادة بيانات العرض الأولية."
        confirmText="نعم، استعد البيانات الافتراضية"
        cancelText="إلغاء"
        isDestructive={true}
        onConfirm={confirmResetData}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
};

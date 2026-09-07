import React, { useState, useEffect } from 'react';
import {
  Users2,
  Plus,
  QrCode,
  Copy,
  Check,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Edit,
  X,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { ConfirmationModal } from '../components/ConfirmationModal.js';
import { Group } from '../types.js';

interface GroupsViewProps {
  onOpenQrModal: (groupName: string, groupCode: string) => void;
  onNavigateToStudents: (groupId: string) => void;
  onOpenAttendance: (groupId: string) => void;
  onOpenAiGroupAnalysis: (group: Group) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  onOpenQrModal,
  onNavigateToStudents,
  onOpenAttendance,
  onOpenAiGroupAnalysis
}) => {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Confirmation Modal
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);

  // Add/Edit Group Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('الرياضيات');
  const [stage, setStage] = useState('المرحلة الثانوية');
  const [grade, setGrade] = useState('الصف الثالث الثانوي');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:30');
  const [location, setLocation] = useState('سنتر الأوائل');
  const [maxCapacity, setMaxCapacity] = useState('35');
  const [billingSystem, setBillingSystem] = useState<'per_lesson' | 'monthly_fixed'>('per_lesson');
  const [defaultLessonPrice, setDefaultLessonPrice] = useState('50');
  const [chargeOnAbsence, setChargeOnAbsence] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    const res = await apiRequest<any[]>('/groups');
    setLoading(false);
    if (res.success && res.data) {
      setGroups(res.data);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast('تم نسخ رمز المجموعة!', 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('يرجى إدخال اسم المجموعة.', 'error');
      return;
    }

    setSubmitting(true);
    const body = {
      name,
      subject,
      stage,
      grade,
      startTime,
      endTime,
      location,
      maxCapacity: Number(maxCapacity),
      billingSystem,
      defaultLessonPrice: Number(defaultLessonPrice) || 50,
      chargeOnAbsence
    };

    let res;
    if (editingGroup) {
      res = await apiRequest(`/groups/${editingGroup.id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
    } else {
      res = await apiRequest('/groups', {
        method: 'POST',
        body: JSON.stringify(body)
      });
    }

    setSubmitting(false);
    if (res.success) {
      showToast(editingGroup ? 'تم تعديل المجموعة بنجاح.' : 'تم إنشاء المجموعة بنجاح!', 'success');
      setModalOpen(false);
      setEditingGroup(null);
      setName('');
      fetchGroups();
    } else {
      showToast(res.error || 'فشلت العملية.', 'error');
    }
  };

  const confirmDeleteGroup = async () => {
    if (!deleteGroupId) return;
    const id = deleteGroupId;
    setDeleteGroupId(null);
    const res = await apiRequest(`/groups/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('تم حذف المجموعة بنجاح.', 'success');
      setGroups(prev => prev.filter(g => g.id !== id));
    } else {
      showToast('تعذر حذف المجموعة.', 'error');
    }
  };

  const openEdit = (g: any) => {
    setEditingGroup(g);
    setName(g.name);
    setSubject(g.subject);
    setStage(g.stage);
    setGrade(g.grade);
    setStartTime(g.startTime);
    setEndTime(g.endTime);
    setLocation(g.location);
    setMaxCapacity(String(g.maxCapacity));
    setBillingSystem(g.billingSystem || 'per_lesson');
    setDefaultLessonPrice(String(g.defaultLessonPrice || 50));
    setChargeOnAbsence(!!g.chargeOnAbsence);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">المجموعات والفصول الدراسية</h2>
            <p className="text-xs text-slate-500">إدارة الفصول، رموز الانضمام الذكية، ونسب الحضور والتحصيل</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingGroup(null);
            setName('');
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء مجموعة جديدة</span>
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(groups || []).map(group => (
          <div
            key={group.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Tag & Code */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md">
                  {group.grade}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenQrModal(group.name, group.groupCode)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-200 transition-colors"
                    title="رمز الـ QR"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(group)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-200 transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteGroupId(group.id)}
                    className="p-1.5 bg-slate-50 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors"
                    title="حذف المجموعة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Subject */}
              <h3 className="font-extrabold text-base text-slate-900 leading-snug">{group.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{group.subject} • {group.stage}</p>

              {/* Group Code Pill */}
              <div className="mt-3 inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold">كود المجموعة:</span>
                <span className="text-xs font-mono font-black text-emerald-800 tracking-wider">
                  {group.groupCode}
                </span>
                <button
                  onClick={() => handleCopyCode(group.groupCode)}
                  className="text-slate-400 hover:text-emerald-700"
                >
                  {copiedCode === group.groupCode ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Time & Place */}
              <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{group.startTime} - {group.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{group.location || 'سنتر تعليمي'}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg">
                  <span>سعر الحصة: {group.defaultLessonPrice || 50} ج.م</span>
                  <span className="text-[10px] text-emerald-600 font-normal">
                    {group.billingSystem === 'monthly_fixed' ? 'شهري' : 'بالحصة'}
                  </span>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-50 rounded-2xl text-center">
                <div>
                  <span className="block text-sm font-black text-slate-900">{group.studentCount || 0}</span>
                  <span className="text-[10px] text-slate-500">طالب</span>
                </div>
                <div>
                  <span className="block text-sm font-black text-emerald-700">{group.averageAttendance || 100}%</span>
                  <span className="text-[10px] text-slate-500">حضور</span>
                </div>
                <div>
                  <span className="block text-sm font-black text-blue-700">{group.averageExams || 0}%</span>
                  <span className="text-[10px] text-slate-500">درجات</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => onNavigateToStudents(group.id)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                <span>الطلاب ({group.studentCount || 0})</span>
              </button>

              <button
                onClick={() => onOpenAiGroupAnalysis(group)}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors"
                title="تحليل ذكي للمجموعة"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                onClick={() => onOpenAttendance(group.id)}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
                title="رصد الحضور"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Group Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                {editingGroup ? 'تعديل بيانات المجموعة' : 'إنشاء مجموعة دراسية جديدة'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المجموعة / الفصل</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: مجموعة الأحد والثلاثاء - تفوق"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المادة الدراسية</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السعة القصوى للطلاب</label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={e => setMaxCapacity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة الدراسية</label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  >
                    <option value="المرحلة الابتدائية">المرحلة الابتدائية</option>
                    <option value="المرحلة الإعدادية / المتوسطة">المرحلة الإعدادية / المتوسطة</option>
                    <option value="المرحلة الثانوية">المرحلة الثانوية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصف</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">وقت البدء</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">وقت الانتهاء</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المكان / مقر التدريس</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="سنتر النور - قاعة A"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              {/* Billing System Settings */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                <h4 className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <span>💰 إعدادات محاسبة الحصص والاشتراكات</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">نظام المحاسبة</label>
                    <select
                      value={billingSystem}
                      onChange={e => setBillingSystem(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                    >
                      <option value="per_lesson">الحصة بالحصة (عند الحضور)</option>
                      <option value="monthly_fixed">اشتراك شهري مقدماً</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">سعر الحصة / الشهر (ج.م)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={defaultLessonPrice}
                      onChange={e => setDefaultLessonPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="chargeOnAbsenceCheck"
                    checked={chargeOnAbsence}
                    onChange={e => setChargeOnAbsence(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor="chargeOnAbsenceCheck" className="text-xs text-slate-700 select-none cursor-pointer">
                    محاسبة الطالب وإصدار استحقاق عند الغياب بدون عذر
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ المجموعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteGroupId}
        title="حذف المجموعة الدراسية"
        message="هل أنت متأكد من رغبتك في حذف هذه المجموعة؟ سيتم حذف جميع ارتباطات الحصص المسجلة لها."
        confirmText="نعم، احذف المجموعة"
        cancelText="تراجع"
        isDestructive={true}
        onConfirm={confirmDeleteGroup}
        onCancel={() => setDeleteGroupId(null)}
      />
    </div>
  );
};

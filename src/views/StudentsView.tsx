import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  X,
  Phone,
  UserCheck
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { exportToCsv } from '../lib/exportUtils.js';
import { Student, Group } from '../types.js';

interface StudentsViewProps {
  onSelectStudent: (studentId: string) => void;
  onOpenParentMessage: (student: Student) => void;
  onOpenAiStudentAnalysis: (student: Student) => void;
  initialGroupId?: string;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onSelectStudent,
  onOpenParentMessage,
  onOpenAiStudentAnalysis,
  initialGroupId
}) => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || 'all');
  const [selectedPerformance, setSelectedPerformance] = useState<string>('all');

  // Add Student Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentRelation, setParentRelation] = useState<'father' | 'mother' | 'guardian'>('father');
  const [groupId, setGroupId] = useState('');
  const [comprehensionLevel, setComprehensionLevel] = useState<'high' | 'good' | 'medium' | 'needs_support'>('good');
  const [learningSpeed, setLearningSpeed] = useState<'fast' | 'normal' | 'needs_time'>('normal');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [stRes, grRes] = await Promise.all([
      apiRequest<any[]>(`/students?groupId=${selectedGroupId}&search=${encodeURIComponent(search)}&performance=${selectedPerformance}`),
      apiRequest<Group[]>('/groups')
    ]);
    setLoading(false);

    if (stRes.success && stRes.data) {
      setStudents(stRes.data);
    }
    if (grRes.success && grRes.data) {
      setGroups(grRes.data);
      if (grRes.data.length > 0 && !groupId) {
        setGroupId(grRes.data[0].id);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGroupId, selectedPerformance]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleExportCsv = () => {
    if (students.length === 0) {
      showToast('لا توجد بيانات طلاب للتصدير.', 'info');
      return;
    }

    const headers = [
      'اسم الطالب',
      'المجموعة',
      'هاتف الطالب',
      'اسم ولي الأمر',
      'هاتف ولي الأمر',
      'نسبة الحضور',
      'متوسط الاختبارات',
      'نسبة الواجبات',
      'مستوى الأداء'
    ];

    const rows = students.map(s => [
      s.name,
      s.groupName || 'غير محدد',
      s.phone || '-',
      s.parentName || '-',
      s.parentPhone || '-',
      `${s.attendanceRate || 100}%`,
      `${s.examsAverage || 0}%`,
      `${s.homeworkCompletionRate || 100}%`,
      s.performanceLevel || 'مستقر'
    ]);

    exportToCsv(`قائمة_طلاب_معين_${new Date().toISOString().split('T')[0]}`, headers, rows);
    showToast('تم تصدير كشف الطلاب بنجاح (Excel CSV مع دعم الحروف العربية)!', 'success');
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !parentPhone.trim() || !groupId) {
      showToast('يرجى ملء الحقول الإلزامية.', 'error');
      return;
    }

    setSubmitting(true);
    const res = await apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify({
        name,
        phone,
        parentName,
        parentPhone,
        parentRelation,
        groupId,
        comprehensionLevel,
        learningSpeed,
        notes
      })
    });

    setSubmitting(false);
    if (res.success) {
      showToast('تمت إضافة الطالب بنجاح!', 'success');
      setModalOpen(false);
      setName('');
      setPhone('');
      setParentName('');
      setParentPhone('');
      setNotes('');
      fetchData();
    } else {
      showToast(res.error || 'فشلت إضافة الطالب.', 'error');
    }
  };

  const getPerformanceBadge = (level: string) => {
    switch (level) {
      case 'top':
        return <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">متميز 🌟</span>;
      case 'improving':
        return <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">في تحسن 📈</span>;
      case 'struggling':
        return <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">يحتاج متابعة ⚠️</span>;
      default:
        return <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">مستقر</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">سجل ودليل الطلاب الأكاديمي</h2>
            <p className="text-xs text-slate-500">
              إجمالي <span className="font-bold text-slate-800">{students.length} طالب</span> مسجل في النظام
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">تصدير إكسل</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة طالب</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو رقم الهاتف أو ولي الأمر..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            بحث
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Group Filter */}
          <select
            value={selectedGroupId}
            onChange={e => setSelectedGroupId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">جميع المجموعات</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          {/* Performance Filter */}
          <select
            value={selectedPerformance}
            onChange={e => setSelectedPerformance(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">جميع مستويات الأداء</option>
            <option value="top">المتميزون</option>
            <option value="improving">في تحسن</option>
            <option value="struggling">يحتاجون متابعة</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">جاري تحميل سجلات الطلاب...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-slate-700">لم يتم العثور على أي طلاب</h4>
            <p className="text-[11px] text-slate-400 mt-1">جرب تغيير معايير البحث أو أضف طالباً جديداً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3.5 px-4">اسم الطالب</th>
                  <th className="py-3.5 px-4">المجموعة</th>
                  <th className="py-3.5 px-4">ولي الأمر</th>
                  <th className="py-3.5 px-4 text-center">نسبة الحضور</th>
                  <th className="py-3.5 px-4 text-center">متوسط الاختبارات</th>
                  <th className="py-3.5 px-4 text-center">مستوى الأداء</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map(student => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectStudent(student.id)}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <span className="block">{student.name}</span>
                          {student.phone && (
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              {student.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {student.groupName || 'غير محدد'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-800 block text-[11px]">
                          {student.parentName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {student.parentPhone}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-black text-xs ${
                        (student.attendanceRate ?? 100) >= 90 ? 'text-emerald-700' : 'text-amber-600'
                      }`}>
                        {student.attendanceRate ?? 100}%
                      </span>
                      {student.consecutiveAbsences > 0 && (
                        <span className="block text-[10px] text-rose-600 font-bold mt-0.5">
                          غياب {student.consecutiveAbsences} حصص
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-black text-xs ${
                        (student.examsAverage ?? 0) >= 80 ? 'text-emerald-700' : (student.examsAverage ?? 0) >= 60 ? 'text-blue-700' : 'text-rose-600'
                      }`}>
                        {student.examsAverage ?? 0}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {getPerformanceBadge(student.performanceLevel)}
                    </td>

                    <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenParentMessage(student)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors"
                          title="مراسلة ولي الأمر عبر واتساب"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenAiStudentAnalysis(student)}
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg transition-colors"
                          title="تحليل ذكي بالأداء (AI)"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectStudent(student.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="عرض الملف الكامل"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-scale-up">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">إضافة طالب جديد للسجل الأكاديمي</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب ثلاثي / رباعي</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: يوسف خالد إبراهيم"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المجموعة الدراسية</label>
                  <select
                    required
                    value={groupId}
                    onChange={e => setGroupId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">هاتف الطالب (اختياري)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم ولي الأمر</label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    placeholder="أ. خالد إبراهيم"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم ولي الأمر (واتساب)</label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مستوى الاستيعاب الأولي</label>
                  <select
                    value={comprehensionLevel}
                    onChange={e => setComprehensionLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  >
                    <option value="high">مرتفع جداً</option>
                    <option value="good">جيد</option>
                    <option value="medium">متوسط</option>
                    <option value="needs_support">يحتاج دعم</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سرعة التعلم</label>
                  <select
                    value={learningSpeed}
                    onChange={e => setLearningSpeed(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  >
                    <option value="fast">سريع البديهة</option>
                    <option value="normal">طبيعي</option>
                    <option value="needs_time">يحتاج وقتاً للتكرار</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات أولية للمدرس</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="أي ملاحظات أكاديمية أو خاصة..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
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
                  {submitting ? 'جاري الحفظ...' : 'حفظ الطالب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

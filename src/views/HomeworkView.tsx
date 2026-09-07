import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { ConfirmationModal } from '../components/ConfirmationModal.js';
import { Homework, Group, Student } from '../types.js';

export const HomeworkView: React.FC = () => {
  const { showToast } = useToast();
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Confirmation Modal
  const [deleteHomeworkId, setDeleteHomeworkId] = useState<string | null>(null);

  // Active Homework for Submissions
  const [activeHomeworkId, setActiveHomeworkId] = useState<string | null>(null);
  const [homeworkStudents, setHomeworkStudents] = useState<Student[]>([]);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, { status: 'submitted' | 'late' | 'not_submitted'; feedback: string }>>({});
  const [savingSubmissions, setSavingSubmissions] = useState(false);

  // Create Homework Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchHomework = async () => {
    setLoading(true);
    const [hwRes, grRes] = await Promise.all([
      apiRequest<Homework[]>('/homework'),
      apiRequest<Group[]>('/groups')
    ]);
    setLoading(false);

    if (hwRes.success && hwRes.data) {
      setHomeworkList(hwRes.data);
    }
    if (grRes.success && grRes.data) {
      setGroups(grRes.data);
      if (grRes.data.length > 0 && !groupId) {
        setGroupId(grRes.data[0].id);
      }
    }
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !groupId) {
      showToast('يرجى ملء الحقول المطلوبة.', 'error');
      return;
    }

    setSubmitting(true);
    const res = await apiRequest('/homework', {
      method: 'POST',
      body: JSON.stringify({
        groupId,
        title,
        description,
        dueDate
      })
    });

    setSubmitting(false);
    if (res.success) {
      showToast('تم إسناد الواجب بنجاح!', 'success');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      fetchHomework();
    } else {
      showToast(res.error || 'تعذر إضافة الواجب.', 'error');
    }
  };

  const handleOpenSubmissions = async (hw: Homework) => {
    if (activeHomeworkId === hw.id) {
      setActiveHomeworkId(null);
      return;
    }

    setActiveHomeworkId(hw.id);
    const [stRes, subRes] = await Promise.all([
      apiRequest<Student[]>(`/students?groupId=${hw.groupId}`),
      apiRequest<any[]>(`/homework/${hw.id}/submissions`)
    ]);

    if (stRes.success && stRes.data) {
      setHomeworkStudents(stRes.data);
      const map: Record<string, { status: any; feedback: string }> = {};
      const existingSubmissions = subRes.data || [];

      stRes.data.forEach(s => {
        const found = existingSubmissions.find(r => r.studentId === s.id);
        map[s.id] = {
          status: found ? found.status : 'submitted',
          feedback: found ? found.feedback : ''
        };
      });

      setSubmissionsMap(map);
    }
  };

  const handleSaveSubmissions = async (homeworkId: string) => {
    setSavingSubmissions(true);
    const submissions = homeworkStudents.map(s => ({
      studentId: s.id,
      status: submissionsMap[s.id]?.status || 'submitted',
      feedback: submissionsMap[s.id]?.feedback || ''
    }));

    const res = await apiRequest(`/homework/${homeworkId}/submissions`, {
      method: 'POST',
      body: JSON.stringify({ submissions })
    });

    setSavingSubmissions(false);
    if (res.success) {
      showToast('تم حفظ حالة تسليم الواجبات بنجاح!', 'success');
      fetchHomework();
    } else {
      showToast(res.error || 'فشل الحفظ.', 'error');
    }
  };

  const confirmDeleteHomework = async () => {
    if (!deleteHomeworkId) return;
    const id = deleteHomeworkId;
    setDeleteHomeworkId(null);
    const res = await apiRequest(`/homework/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('تم حذف الواجب بنجاح.', 'success');
      setHomeworkList(prev => prev.filter(h => h.id !== id));
      if (activeHomeworkId === id) setActiveHomeworkId(null);
    } else {
      showToast('تعذر حذف الواجب.', 'error');
    }
  };

  const filteredHomework = selectedGroupId === 'all'
    ? homeworkList
    : homeworkList.filter(h => h.groupId === selectedGroupId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">سجل الواجبات والمهام المنزلية</h2>
            <p className="text-xs text-slate-500">إسناد الواجبات، رصد التسليمات، وتدوين الملاحظات التوجيهية للطلاب</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedGroupId}
            onChange={e => setSelectedGroupId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">جميع المجموعات</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إسناد واجب جديد</span>
          </button>
        </div>
      </div>

      {/* Homework List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            جاري تحميل الواجبات...
          </div>
        ) : filteredHomework.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            لا توجد واجبات مسندة لهذه المجموعة بعد.
          </div>
        ) : (
          filteredHomework.map(hw => {
            const isExpanded = activeHomeworkId === hw.id;
            return (
              <div
                key={hw.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
              >
                {/* Header info */}
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <BookOpenCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{hw.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {hw.groupName} • آخر موعد للتسليم: <span className="font-bold text-slate-700 font-mono">{hw.dueDate}</span>
                      </p>
                      {hw.description && (
                        <p className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {hw.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleOpenSubmissions(hw)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isExpanded
                          ? 'bg-slate-900 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      <span>{isExpanded ? 'إخفاء كشف التسليم' : 'رصد تسليم الطلاب'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setDeleteHomeworkId(hw.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="حذف الواجب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Submissions Table */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50 p-5 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-slate-800">
                        كشف متابعة حل وتسليم الطلاب للواجب
                      </h4>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <tr>
                            <th className="py-2.5 px-3 w-12 text-center">#</th>
                            <th className="py-2.5 px-3">اسم الطالب</th>
                            <th className="py-2.5 px-3 text-center w-52">حالة التسليم</th>
                            <th className="py-2.5 px-3">ملاحظات الحل والتصحيح</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {homeworkStudents.map((student, idx) => {
                            const val = submissionsMap[student.id] || { status: 'submitted', feedback: '' };

                            return (
                              <tr key={student.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">{student.name}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSubmissionsMap(prev => ({
                                          ...prev,
                                          [student.id]: { ...prev[student.id], status: 'submitted' }
                                        }));
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                        val.status === 'submitted'
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      تم التسليم
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSubmissionsMap(prev => ({
                                          ...prev,
                                          [student.id]: { ...prev[student.id], status: 'late' }
                                        }));
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                        val.status === 'late'
                                          ? 'bg-amber-600 text-white shadow-xs'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      متأخر
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSubmissionsMap(prev => ({
                                          ...prev,
                                          [student.id]: { ...prev[student.id], status: 'not_submitted' }
                                        }));
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                        val.status === 'not_submitted'
                                          ? 'bg-rose-600 text-white shadow-xs'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      لم يسلم
                                    </button>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="text"
                                    value={val.feedback}
                                    onChange={e => {
                                      const feedback = e.target.value;
                                      setSubmissionsMap(prev => ({
                                        ...prev,
                                        [student.id]: { ...prev[student.id], feedback }
                                      }));
                                    }}
                                    placeholder="ملاحظات على الحل..."
                                    className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-emerald-600"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleSaveSubmissions(hw.id)}
                        disabled={savingSubmissions}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{savingSubmissions ? 'جاري الحفظ...' : 'حفظ كشف الواجبات'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">إسناد واجب دراسي جديد</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المجموعة المستهدفة</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الواجب</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: حل تمارين صفحة 45 إلى 48 من الكتاب المدرسي"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل وملاحظات الواجب</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="حدد المسائل الإلزامية أو التعليمات الخاصة بالحل..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">آخر موعد للتسليم</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
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
                  {submitting ? 'جاري الحفظ...' : 'حفظ وإسناد الواجب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Homework Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteHomeworkId}
        title="حذف الواجب المدرسي"
        message="هل أنت متأكد من حذف هذا الواجب؟ سيتم حذف جميع سجلات تسليم الطلاب المرتبطة به."
        confirmText="نعم، احذف الواجب"
        cancelText="تراجع"
        isDestructive={true}
        onConfirm={confirmDeleteHomework}
        onCancel={() => setDeleteHomeworkId(null)}
      />
    </div>
  );
};

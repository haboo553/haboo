import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Trash2,
  Edit,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Layers
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { ConfirmationModal } from '../components/ConfirmationModal.js';
import { Exam, Group, Student } from '../types.js';

interface ExamsViewProps {
  onOpenAiQuizGenerator?: () => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({ onOpenAiQuizGenerator }) => {
  const { showToast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Confirmation Modal
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);

  // Active Exam for Grades Entry
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [activeExamStudents, setActiveExamStudents] = useState<Student[]>([]);
  const [gradesMap, setGradesMap] = useState<Record<string, { score: number; feedback: string }>>({});
  const [savingGrades, setSavingGrades] = useState(false);

  // Create Exam Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [groupId, setGroupId] = useState('');
  const [type, setType] = useState<'quiz' | 'monthly' | 'midterm' | 'final'>('monthly');
  const [totalScore, setTotalScore] = useState('20');
  const [passingScore, setPassingScore] = useState('10');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    const [exRes, grRes] = await Promise.all([
      apiRequest<Exam[]>('/exams'),
      apiRequest<Group[]>('/groups')
    ]);
    setLoading(false);

    if (exRes.success && exRes.data) {
      setExams(exRes.data);
    }
    if (grRes.success && grRes.data) {
      setGroups(grRes.data);
      if (grRes.data.length > 0 && !groupId) {
        setGroupId(grRes.data[0].id);
      }
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !groupId) {
      showToast('يرجى ملء جميع الحقول.', 'error');
      return;
    }

    setSubmitting(true);
    const res = await apiRequest('/exams', {
      method: 'POST',
      body: JSON.stringify({
        groupId,
        title,
        type,
        totalScore: Number(totalScore),
        passingScore: Number(passingScore),
        date
      })
    });

    setSubmitting(false);
    if (res.success) {
      showToast('تم إنشاء الاختبار بنجاح!', 'success');
      setModalOpen(false);
      setTitle('');
      fetchExams();
    } else {
      showToast(res.error || 'فشل إنشاء الاختبار.', 'error');
    }
  };

  const handleOpenGradesEntry = async (exam: Exam) => {
    if (activeExamId === exam.id) {
      setActiveExamId(null);
      return;
    }

    setActiveExamId(exam.id);
    const [stRes, grRes] = await Promise.all([
      apiRequest<Student[]>(`/students?groupId=${exam.groupId}`),
      apiRequest<any[]>(`/exams/${exam.id}/results`)
    ]);

    if (stRes.success && stRes.data) {
      setActiveExamStudents(stRes.data);
      const map: Record<string, { score: number; feedback: string }> = {};
      const existingResults = grRes.data || [];

      stRes.data.forEach(s => {
        const found = existingResults.find(r => r.studentId === s.id);
        map[s.id] = {
          score: found ? found.score : 0,
          feedback: found ? found.feedback : ''
        };
      });

      setGradesMap(map);
    }
  };

  const handleSaveGrades = async (examId: string) => {
    setSavingGrades(true);
    const results = activeExamStudents.map(s => ({
      studentId: s.id,
      score: Number(gradesMap[s.id]?.score || 0),
      feedback: gradesMap[s.id]?.feedback || ''
    }));

    const res = await apiRequest(`/exams/${examId}/results`, {
      method: 'POST',
      body: JSON.stringify({ results })
    });

    setSavingGrades(false);
    if (res.success) {
      showToast('تم رصد الدرجات وحساب الترتيب التلقائي للطلاب بنجاح!', 'success');
      fetchExams();
    } else {
      showToast(res.error || 'تعذر حفظ الدرجات.', 'error');
    }
  };

  const confirmDeleteExam = async () => {
    if (!deleteExamId) return;
    const id = deleteExamId;
    setDeleteExamId(null);
    const res = await apiRequest(`/exams/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('تم حذف الاختبار بنجاح.', 'success');
      setExams(prev => prev.filter(e => e.id !== id));
      if (activeExamId === id) setActiveExamId(null);
    } else {
      showToast('تعذر حذف الاختبار.', 'error');
    }
  };

  const filteredExams = selectedGroupId === 'all'
    ? exams
    : exams.filter(e => e.groupId === selectedGroupId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">سجل الاختبارات والتقييمات</h2>
            <p className="text-xs text-slate-500">إنشاء الامتحانات، رصد الدرجات، وحساب الترتيب والإحصاءات تلقائياً</p>
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
            <span>إضافة اختبار جديد</span>
          </button>
        </div>
      </div>

      {/* Exams List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            جاري تحميل الاختبارات...
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            لا توجد اختبارات مسجلة لهذه المجموعة بعد. انقر على "إضافة اختبار جديد".
          </div>
        ) : (
          filteredExams.map(exam => {
            const isExpanded = activeExamId === exam.id;
            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
              >
                {/* Exam Summary Bar */}
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900">{exam.title}</h3>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          {exam.type === 'quiz' ? 'كويز سريع' : exam.type === 'monthly' ? 'شهري' : exam.type === 'midterm' ? 'نصف فصل' : 'نهائي'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {exam.groupName} • التاريخ: {exam.date} • الدرجة الكلية: <strong className="text-slate-800">{exam.totalScore} درجة</strong>
                      </p>
                    </div>
                  </div>

                  {/* Exam KPIs & Action Buttons */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-3 text-center">
                      <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">المتوسط</span>
                        <span className="text-xs font-black text-slate-800">{exam.averageScore || 0}%</span>
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">أعلى درجة</span>
                        <span className="text-xs font-black text-emerald-700">{exam.highestScore || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenGradesEntry(exam)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isExpanded
                            ? 'bg-slate-900 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        <span>{isExpanded ? 'إخفاء جدول الدرجات' : 'رصد وتعديل الدرجات'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => setDeleteExamId(exam.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="حذف الاختبار"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Grades Entry Table */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50 p-5 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-slate-800">
                        كشف درجات الطلاب في {exam.title} (الدرجة العظمى: {exam.totalScore})
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        درجة النجاح المعتمدة: {exam.passingScore}
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <tr>
                            <th className="py-2.5 px-3 w-12 text-center">#</th>
                            <th className="py-2.5 px-3">اسم الطالب</th>
                            <th className="py-2.5 px-3 text-center w-32">الدرجة المحصلة</th>
                            <th className="py-2.5 px-3 text-center w-24">النسبة</th>
                            <th className="py-2.5 px-3">ملاحظات المعلم على ورقة الإجابة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeExamStudents.map((student, idx) => {
                            const val = gradesMap[student.id] || { score: 0, feedback: '' };
                            const pct = exam.totalScore > 0 ? Math.round((val.score / exam.totalScore) * 100) : 0;
                            const isPassing = val.score >= exam.passingScore;

                            return (
                              <tr key={student.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">{student.name}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max={exam.totalScore}
                                    step="0.5"
                                    value={val.score}
                                    onChange={e => {
                                      const score = parseFloat(e.target.value) || 0;
                                      setGradesMap(prev => ({
                                        ...prev,
                                        [student.id]: { ...prev[student.id], score }
                                      }));
                                    }}
                                    className="w-20 px-2 py-1 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-emerald-600 font-mono"
                                  />
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold">
                                  <span className={isPassing ? 'text-emerald-700' : 'text-rose-600'}>
                                    {pct}%
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="text"
                                    value={val.feedback}
                                    onChange={e => {
                                      const feedback = e.target.value;
                                      setGradesMap(prev => ({
                                        ...prev,
                                        [student.id]: { ...prev[student.id], feedback }
                                      }));
                                    }}
                                    placeholder="ملاحظات توجيهية للطالب..."
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
                        onClick={() => handleSaveGrades(exam.id)}
                        disabled={savingGrades}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{savingGrades ? 'جاري الحفظ وحساب الترتيب...' : 'حفظ كشف الدرجات واحتساب الترتيب'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Exam Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">إنشاء اختبار أو تقييم جديد</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="p-5 space-y-4">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان موضوع الاختبار</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: الاختبار الشهري الأول - التفاضل والتكامل"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الاختبار</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  >
                    <option value="quiz">كويز قصير (مفاهيم سريعة)</option>
                    <option value="monthly">اختبار شهري شامل</option>
                    <option value="midterm">اختبار منتصف الفصل</option>
                    <option value="final">اختبار نهاية الفصل</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الاختبار</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الدرجة الكلية العظمى</label>
                  <input
                    type="number"
                    required
                    value={totalScore}
                    onChange={e => setTotalScore(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">درجة النجاح</label>
                  <input
                    type="number"
                    required
                    value={passingScore}
                    onChange={e => setPassingScore(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
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
                  {submitting ? 'جاري الإنشاء...' : 'إنشاء الاختبار'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteExamId}
        title="حذف الاختبار"
        message="هل أنت متأكد من حذف هذا الاختبار؟ سيتم حذف جميع درجات الطلاب المرتبطة به."
        confirmText="نعم، احذف الاختبار"
        cancelText="تراجع"
        isDestructive={true}
        onConfirm={confirmDeleteExam}
        onCancel={() => setDeleteExamId(null)}
      />
    </div>
  );
};

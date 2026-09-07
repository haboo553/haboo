import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Star,
  Sparkles,
  Save,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { Group, Student, StudentEvaluation } from '../types.js';

export const EvaluationsView: React.FC = () => {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  // New Evaluation Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [comprehensionScore, setComprehensionScore] = useState(4);
  const [participationScore, setParticipationScore] = useState(4);
  const [homeworkScore, setHomeworkScore] = useState(4);
  const [disciplineScore, setDisciplineScore] = useState(5);
  const [overallProgress, setOverallProgress] = useState<'rapid_progress' | 'steady_progress' | 'stable' | 'regressing'>('steady_progress');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiRequest<Group[]>('/groups').then(res => {
      if (res.success && res.data) {
        setGroups(res.data);
        if (res.data.length > 0 && !selectedGroupId) {
          setSelectedGroupId(res.data[0].id);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;

    setLoading(true);
    Promise.all([
      apiRequest<Student[]>(`/students?groupId=${selectedGroupId}`),
      apiRequest<StudentEvaluation[]>('/evaluations')
    ]).then(([stRes, evRes]) => {
      setLoading(false);
      if (stRes.success && stRes.data) {
        setStudents(stRes.data);
        if (stRes.data.length > 0 && !studentId) {
          setStudentId(stRes.data[0].id);
        }
      }
      if (evRes.success && evRes.data) {
        setEvaluations(evRes.data);
      }
    });
  }, [selectedGroupId]);

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    setSubmitting(true);
    const res = await apiRequest('/evaluations', {
      method: 'POST',
      body: JSON.stringify({
        studentId,
        evaluationDate: new Date().toISOString().split('T')[0],
        comprehensionScore,
        participationScore,
        homeworkScore,
        disciplineScore,
        overallProgress,
        teacherNotes
      })
    });

    setSubmitting(false);
    if (res.success) {
      showToast('تم حفظ التقييم الدوري بنجاح!', 'success');
      setModalOpen(false);
      setTeacherNotes('');
      // Refresh
      const evRes = await apiRequest<StudentEvaluation[]>('/evaluations');
      if (evRes.success && evRes.data) setEvaluations(evRes.data);
    } else {
      showToast(res.error || 'تعذر حفظ التقييم.', 'error');
    }
  };

  const getProgressBadge = (progress: string) => {
    switch (progress) {
      case 'rapid_progress':
        return <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">تقدم سريع 🚀</span>;
      case 'steady_progress':
        return <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">تقدم مستمر 📈</span>;
      case 'regressing':
        return <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">تراجع ⚠️</span>;
      default:
        return <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">مستقر</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">سجل التقييمات المستمرة والتربوية</h2>
            <p className="text-xs text-slate-500">تقييم متعدد المحاور: الاستيعاب، المشاركة الصفية، الالتزام بالواجبات، والسلوك</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedGroupId}
            onChange={e => setSelectedGroupId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تقييم دوري</span>
          </button>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            جاري تحميل التقييمات...
          </div>
        ) : evaluations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            لا توجد تقييمات مسجلة بعد. اضغط على "إضافة تقييم دوري" لتقييم أداء طالب.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluations.map(ev => (
              <div
                key={ev.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{ev.studentName}</h3>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      تاريخ التقييم: {ev.evaluationDate}
                    </span>
                  </div>
                  {getProgressBadge(ev.overallProgress)}
                </div>

                {/* Star Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">الاستيعاب:</span>
                    <span className="font-black text-slate-800">{ev.comprehensionScore} / 5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">المشاركة:</span>
                    <span className="font-black text-slate-800">{ev.participationScore} / 5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">الواجبات:</span>
                    <span className="font-black text-slate-800">{ev.homeworkScore} / 5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">الانضباط:</span>
                    <span className="font-black text-slate-800">{ev.disciplineScore} / 5</span>
                  </div>
                </div>

                {ev.teacherNotes && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                    "{ev.teacherNotes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Evaluation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">إضافة تقييم دوري لطالب</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvaluation} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر الطالب</label>
                <select
                  required
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاستيعاب والفهم (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={comprehensionScore}
                    onChange={e => setComprehensionScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المشاركة والتفاعل (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={participationScore}
                    onChange={e => setParticipationScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الالتزام بالواجبات (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={homeworkScore}
                    onChange={e => setHomeworkScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الانضباط والسلوك (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={disciplineScore}
                    onChange={e => setDisciplineScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">حالة التطور العام</label>
                <select
                  value={overallProgress}
                  onChange={e => setOverallProgress(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                >
                  <option value="rapid_progress">تقدم ملحوظ وسريع</option>
                  <option value="steady_progress">تقدم مستمر ومستقر</option>
                  <option value="stable">مستوى ثابت</option>
                  <option value="regressing">تراجع يحتاج متابعة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات المعلم التوجيهية</label>
                <textarea
                  rows={3}
                  value={teacherNotes}
                  onChange={e => setTeacherNotes(e.target.value)}
                  placeholder="ملاحظات توجيهية حول مستواه..."
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
                  {submitting ? 'جاري الحفظ...' : 'حفظ التقييم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

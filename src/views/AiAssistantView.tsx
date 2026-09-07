import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Award,
  Lightbulb,
  GraduationCap,
  Users2,
  Copy,
  Check,
  RotateCw,
  Printer,
  ChevronLeft,
  Clock,
  Layers,
  HelpCircle,
  BrainCircuit
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { useAuth } from '../context/AuthContext.js';
import { printDocument } from '../lib/exportUtils.js';

interface AiAssistantViewProps {
  initialTool?: 'prep' | 'quiz' | 'simplify' | 'diagnostic' | 'remediation';
  initialStudentId?: string;
  initialGroupId?: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  initialTool,
  initialStudentId,
  initialGroupId
}) => {
  const { teacher } = useAuth();
  const { showToast } = useToast();
  const [activeTool, setActiveTool] = useState<'prep' | 'quiz' | 'simplify' | 'diagnostic' | 'remediation'>(initialTool || 'prep');

  useEffect(() => {
    if (initialTool) {
      setActiveTool(initialTool);
    }
  }, [initialTool]);

  // Groups and Students for context
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // 1. Prep Tool State
  const [prepSubject, setPrepSubject] = useState(teacher?.subject || 'الرياضيات');
  const [prepGrade, setPrepGrade] = useState('الصف الثالث الثانوي');
  const [prepTopic, setPrepTopic] = useState('قاعدة لوبيتال وتطبيقات النهايات');
  const [prepDuration, setPrepDuration] = useState('60 دقيقة');
  const [prepObjectives, setPrepObjectives] = useState('');
  const [prepResult, setPrepResult] = useState<any>(null);
  const [prepLoading, setPrepLoading] = useState(false);

  // 2. Quiz Generator Tool State
  const [quizSubject, setQuizSubject] = useState(teacher?.subject || 'الرياضيات');
  const [quizGrade, setQuizGrade] = useState('الصف الثالث الثانوي');
  const [quizTopic, setQuizTopic] = useState('المصفوفات والمحددات');
  const [quizCount, setQuizCount] = useState(5);
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // 3. Concept Simplifier State
  const [simplifySubject, setSimplifySubject] = useState(teacher?.subject || 'الفيزياء');
  const [simplifyConcept, setSimplifyConcept] = useState('قانون فاراداي للحث الكهرومغناطيسي');
  const [simplifyGrade, setSimplifyGrade] = useState('المرحلة الثانوية');
  const [simplifyResult, setSimplifyResult] = useState<any>(null);
  const [simplifyLoading, setSimplifyLoading] = useState(false);

  // 4. Diagnostic Advisor State
  const [diagStudentId, setDiagStudentId] = useState('');
  const [diagResult, setDiagResult] = useState<any>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  // 5. Remediation Plan State
  const [remGroupId, setRemGroupId] = useState('');
  const [remResult, setRemResult] = useState<any>(null);
  const [remLoading, setRemLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      apiRequest<any[]>('/groups'),
      apiRequest<any[]>('/students')
    ]).then(([grRes, stRes]) => {
      if (grRes.success && grRes.data) {
        setGroups(grRes.data);
        if (initialGroupId) {
          setRemGroupId(initialGroupId);
        } else if (grRes.data.length > 0) {
          setRemGroupId(grRes.data[0].id);
        }
      }
      if (stRes.success && stRes.data) {
        setStudents(stRes.data);
        if (initialStudentId) {
          setDiagStudentId(initialStudentId);
        } else if (stRes.data.length > 0) {
          setDiagStudentId(stRes.data[0].id);
        }
      }
    });
  }, [initialStudentId, initialGroupId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('تم النسخ إلى الحافظة!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Run Prep
  const handleGeneratePrep = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrepLoading(true);
    const res = await apiRequest('/ai/lesson-prep', {
      method: 'POST',
      body: JSON.stringify({
        subject: prepSubject,
        grade: prepGrade,
        topic: prepTopic,
        durationMinutes: parseInt(prepDuration) || 60,
        specificObjectives: prepObjectives ? prepObjectives.split('\n') : []
      })
    });
    setPrepLoading(false);
    if (res.success && res.data) {
      setPrepResult(res.data);
      showToast('تم توليد خطة التحضير النموذجية بنجاح!', 'success');
    } else {
      showToast(res.error || 'فشل توليد التحضير.', 'error');
    }
  };

  // 2. Run Quiz
  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuizLoading(true);
    const res = await apiRequest('/ai/quiz-generator', {
      method: 'POST',
      body: JSON.stringify({
        subject: quizSubject,
        grade: quizGrade,
        topic: quizTopic,
        questionCount: quizCount,
        difficulty: quizDifficulty
      })
    });
    setQuizLoading(false);
    if (res.success && res.data) {
      setQuizResult(res.data);
      showToast('تم إنشاء بنك الأسئلة ونموذج الإجابة بنجاح!', 'success');
    } else {
      showToast(res.error || 'فشل إنشاء الاختبار.', 'error');
    }
  };

  // 3. Run Simplify
  const handleGenerateSimplify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimplifyLoading(true);
    const res = await apiRequest('/ai/concept-simplifier', {
      method: 'POST',
      body: JSON.stringify({
        subject: simplifySubject,
        concept: simplifyConcept,
        grade: simplifyGrade
      })
    });
    setSimplifyLoading(false);
    if (res.success && res.data) {
      setSimplifyResult(res.data);
      showToast('تم تبسيط المفهوم وصياغة الأمثلة الحياتية بنجاح!', 'success');
    } else {
      showToast(res.error || 'فشل تبسيط المفهوم.', 'error');
    }
  };

  // 4. Run Diagnostic
  const handleGenerateDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagStudentId) return;
    setDiagLoading(true);
    const res = await apiRequest('/ai/student-diagnostic', {
      method: 'POST',
      body: JSON.stringify({ studentId: diagStudentId })
    });
    setDiagLoading(false);
    if (res.success && res.data) {
      setDiagResult(res.data);
      showToast('تم تشخيص الأداء وصياغة التوصيات التربوية!', 'success');
    } else {
      showToast(res.error || 'فشل التشخيص.', 'error');
    }
  };

  // 5. Run Remediation
  const handleGenerateRemediation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remGroupId) return;
    setRemLoading(true);
    const res = await apiRequest('/ai/group-remediation', {
      method: 'POST',
      body: JSON.stringify({ groupId: remGroupId })
    });
    setRemLoading(false);
    if (res.success && res.data) {
      setRemResult(res.data);
      showToast('تم وضع خطة المعالجة للمجموعة بنجاح!', 'success');
    } else {
      showToast(res.error || 'فشلت خطة المعالجة.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>المساعد الذكي للمدرس (Gemini AI)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">حزمة أدوات الذكاء الاصطناعي التربوية</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            مساعد متكامل لتحضير الدروس النموذجية، توليد بنوك الأسئلة، تبسيط المفاهيم الصعبة، وتشخيص تحصيل الطلاب وفق أسس تربوية موثوقة.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center w-full md:w-auto">
          <span className="text-[11px] text-emerald-200 block font-bold">باقة المعلم المحترف</span>
          <span className="text-lg font-black text-white">توليد غير محدود ✨</span>
        </div>
      </div>

      {/* Tool Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { id: 'prep', label: 'تحضير الدروس', icon: BookOpen },
          { id: 'quiz', label: 'توليد الاختبارات', icon: Award },
          { id: 'simplify', label: 'تبسيط المفاهيم', icon: Lightbulb },
          { id: 'diagnostic', label: 'تشخيص الطالب', icon: GraduationCap },
          { id: 'remediation', label: 'خطة تدعيم المجموعة', icon: Users2 }
        ].map(tool => {
          const Icon = tool.icon;
          const active = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`p-3.5 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 border ${
                active
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-emerald-700'}`} />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool 1: Lesson Prep */}
      {activeTool === 'prep' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>مدخلات تحضير الحصة</span>
            </h3>

            <form onSubmit={handleGeneratePrep} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المادة الدراسية</label>
                <input
                  type="text"
                  required
                  value={prepSubject}
                  onChange={e => setPrepSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الصف / المرحلة</label>
                <input
                  type="text"
                  required
                  value={prepGrade}
                  onChange={e => setPrepGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الموضوع أو الدرس</label>
                <input
                  type="text"
                  required
                  value={prepTopic}
                  onChange={e => setPrepTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مدة الحصة</label>
                <input
                  type="text"
                  value={prepDuration}
                  onChange={e => setPrepDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={prepLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{prepLoading ? 'جاري التحضير الذكي...' : 'توليد خطة التحضير النموذجية'}</span>
              </button>
            </form>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900">خطة التحضير النموذجية</h3>
              {prepResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(prepResult, null, 2))}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-200 transition-colors"
                    title="نسخ الخطة"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={printDocument}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-200 transition-colors"
                    title="طباعة الخطة"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {!prepResult ? (
              <div className="py-20 text-center text-xs text-slate-400">
                أدخل بيانات الدرس واضغط على زر التوليد لعرض خطة التحضير التفصيلية المكتملة.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Behavioral Objectives */}
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 mb-2">🎯 الأهداف السلوكية والإجرائية:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {(prepResult.behavioralObjectives || []).map((obj: string, i: number) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* Lesson Steps */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">⏱️ خطوات سير الحصة والتوزيع الزمني:</h4>
                  <div className="space-y-2">
                    {(prepResult.lessonSteps || []).map((step: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono shrink-0">
                          {step.durationMinutes} دقيقة
                        </span>
                        <div>
                          <strong className="text-slate-900 block">{step.stepName}</strong>
                          <p className="text-slate-600 mt-0.5">{step.description}</p>
                          {step.teacherRole && <p className="text-[11px] text-slate-500 mt-0.5"><strong>دور المعلم:</strong> {step.teacherRole}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions & Assessment */}
                {(prepResult.diagnosticQuestions || []).length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-2">❓ أسئلة التقويم المرحلي والتأكيدي:</h4>
                    <ul className="list-decimal list-inside space-y-1 text-slate-700">
                      {(prepResult.diagnosticQuestions || []).map((q: string, i: number) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 2: Quiz Generator */}
      {activeTool === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>إعدادات بنك الأسئلة</span>
            </h3>

            <form onSubmit={handleGenerateQuiz} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المادة</label>
                <input
                  type="text"
                  required
                  value={quizSubject}
                  onChange={e => setQuizSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الصف</label>
                <input
                  type="text"
                  required
                  value={quizGrade}
                  onChange={e => setQuizGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">موضوع الاختبار</label>
                <input
                  type="text"
                  required
                  value={quizTopic}
                  onChange={e => setQuizTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عدد الأسئلة</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={quizCount}
                    onChange={e => setQuizCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المستوى</label>
                  <select
                    value={quizDifficulty}
                    onChange={e => setQuizDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  >
                    <option value="easy">سهل ومباشر</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">تفكير عليا ومتقدم</option>
                    <option value="mixed">متدرج ومتنوع</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={quizLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{quizLoading ? 'جاري التوليد...' : 'توليد الأسئلة ونموذج الإجابة'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900">بنك الأسئلة والنموذج النموذجي</h3>
              {quizResult && (
                <button
                  onClick={printDocument}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة ورقة الاختبار</span>
                </button>
              )}
            </div>

            {!quizResult ? (
              <div className="py-20 text-center text-xs text-slate-400">
                حدد الموضوع وعدد الأسئلة لتوليد الاختبار مع خيارات الإجابة والشرح النموذجي.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {(quizResult.questions || []).map((q: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 block text-xs">
                        س{i + 1}: {q.questionText}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold shrink-0">
                        {q.points} درجات
                      </span>
                    </div>

                    {(q.options || []).length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {(q.options || []).map((opt: string, optIdx: number) => (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-xl text-xs border ${
                              opt === q.correctAnswer
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            {opt} {opt === q.correctAnswer && ' ✓ (الإجابة الصحيحة)'}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                        <strong>شرح الحل النموذجي:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 3: Concept Simplifier */}
      {activeTool === 'simplify' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>المفهوم المراد تبسيطه</span>
            </h3>

            <form onSubmit={handleGenerateSimplify} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المادة</label>
                <input
                  type="text"
                  required
                  value={simplifySubject}
                  onChange={e => setSimplifySubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المفهوم أو القانون المعقد</label>
                <textarea
                  rows={3}
                  required
                  value={simplifyConcept}
                  onChange={e => setSimplifyConcept(e.target.value)}
                  placeholder="مثال: الانقسام الاختزالي والميوزي..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الفئة العمرية / الصف</label>
                <input
                  type="text"
                  value={simplifyGrade}
                  onChange={e => setSimplifyGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={simplifyLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{simplifyLoading ? 'جاري التبسيط...' : 'توليد التشبيه والشرح المبسط'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 pb-4 border-b border-slate-100 mb-4">
              الاستراتيجية التوضيحية والأمثلة الحياتية
            </h3>

            {!simplifyResult ? (
              <div className="py-20 text-center text-xs text-slate-400">
                اكتب أي مفهوم معقد في منهجك وسيقوم الذكاء الاصطناعي بتوليد تشبيه حياتي وقصة مبسطة تشرح الفكرة فوراً.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                  <h4 className="font-bold text-amber-900 mb-1">💡 التشبيه الحياتي الملموس (Analogy):</h4>
                  <p className="text-slate-800 leading-relaxed font-medium">{simplifyResult.realLifeAnalogy}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">📖 الشرح المبسط بدون تعقيد مصطلحات:</h4>
                  <p className="text-slate-700 leading-relaxed">{simplifyResult.simplifiedExplanation}</p>
                </div>

                {(simplifyResult.commonMisconceptions || []).length > 0 && (
                  <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
                    <h4 className="font-bold text-rose-900 mb-1">⚠️ مفاهيم خاطئة شائعة يقع فيها الطلاب:</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {(simplifyResult.commonMisconceptions || []).map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 4: Diagnostic Advisor */}
      {activeTool === 'diagnostic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>اختيار الطالب للتشخيص</span>
            </h3>

            <form onSubmit={handleGenerateDiagnostic} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر الطالب من السجل</label>
                <select
                  required
                  value={diagStudentId}
                  onChange={e => setDiagStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.groupName})</option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                يقوم النظام بتحليل درجات الطالب في الاختبارات السابقة وسجل الحضور والواجبات لتقديم تشخيص تربوي دقيق مع الحفاظ التام على خصوصية الطالب.
              </p>

              <button
                type="submit"
                disabled={diagLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{diagLoading ? 'جاري التحليل والتشخيص...' : 'بدء التشخيص الأكاديمي'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 pb-4 border-b border-slate-100 mb-4">
              تقرير التشخيص والتوصيات التربوية
            </h3>

            {!diagResult ? (
              <div className="py-20 text-center text-xs text-slate-400">
                اختر طالباً واضغط على "بدء التشخيص الأكاديمي" لعرض التوصيات الفردية.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 mb-1">📊 الملخص التشخيصي للحالة:</h4>
                  <p className="text-slate-800 leading-relaxed">{diagResult.academicSummary}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2">🎯 خطة العمل المقترحة للمعلم:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {(diagResult.teacherActionPlan || []).map((plan: string, i: number) => (
                      <li key={i}>{plan}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 5: Group Remediation Plan */}
      {activeTool === 'remediation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Users2 className="w-4 h-4 text-emerald-600" />
              <span>اختيار المجموعة الدراسية</span>
            </h3>

            <form onSubmit={handleGenerateRemediation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المجموعة</label>
                <select
                  required
                  value={remGroupId}
                  onChange={e => setRemGroupId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.subject})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={remLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{remLoading ? 'جاري بناء الخطة...' : 'توليد خطة تدعيم الفصل'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 pb-4 border-b border-slate-100 mb-4">
              خطة المعالجة والتدعيم الجماعي
            </h3>

            {!remResult ? (
              <div className="py-20 text-center text-xs text-slate-400">
                اختر المجموعة الدراسية لتحليل متوسطات الطلاب ووضع خطة مراجعة جماعية.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200">
                  <h4 className="font-bold text-teal-900 mb-1">📌 النقاط المشتركة التي تحتاج مراجعة:</h4>
                  <p className="text-slate-800 leading-relaxed">{remResult.commonGaps}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2">📋 هيكل حصة المراجعة المقترحة:</h4>
                  <p className="text-slate-700 leading-relaxed">{remResult.revisionSessionOutline}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

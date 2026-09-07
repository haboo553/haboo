import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Printer,
  Save,
  X,
  Plus,
  Trash2,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Users,
  Layers,
  Award,
  Send,
  Wand2,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { printDocument } from '../lib/exportUtils.js';
import { LessonPreparation, GradedExampleItem, DifferentiatedHomeworkSet, LessonFeedbackRecord } from '../types.js';

interface LessonPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  subject: string;
  stage?: string;
  groupId?: string;
  onSaved?: () => void;
}

export const LessonPrepModal: React.FC<LessonPrepModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  subject,
  stage = 'المرحلة الثانوية',
  groupId,
  onSaved
}) => {
  const { showToast } = useToast();
  const [activeModalTab, setActiveModalTab] = useState<'prep' | 'differentiated' | 'feedback'>('prep');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStudentAwareGenerating, setAiStudentAwareGenerating] = useState(false);
  const [transforming, setTransforming] = useState<string | null>(null);

  // Lesson Plan Fields
  const [unit, setUnit] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [educationalObjectives, setEducationalObjectives] = useState<string[]>(['']);
  const [targetSkills, setTargetSkills] = useState<string[]>(['']);
  const [warmupHook, setWarmupHook] = useState('');
  const [summaryExplanation, setSummaryExplanation] = useState('');
  const [lessonElements, setLessonElements] = useState<string[]>(['']);
  const [gradedExamples, setGradedExamples] = useState<GradedExampleItem[]>([]);
  const [interactiveActivities, setInteractiveActivities] = useState<string[]>(['']);
  const [comprehensionQuestions, setComprehensionQuestions] = useState<{ question: string; targetLevel: string }[]>([]);
  const [inClassEffort, setInClassEffort] = useState<{ taskName: string; durationMinutes: number; instructions: string }>({
    taskName: '',
    durationMinutes: 15,
    instructions: ''
  });
  const [conclusionSummary, setConclusionSummary] = useState('');
  const [homeworkDescription, setHomeworkDescription] = useState('');
  const [differentiatedHomework, setDifferentiatedHomework] = useState<DifferentiatedHomeworkSet>({
    remedial: [],
    core: [],
    advanced: []
  });
  const [quickAssessmentQuestions, setQuickAssessmentQuestions] = useState<
    { question: string; suggestedAnswer: string }[]
  >([]);
  const [teacherPrivateNotes, setTeacherPrivateNotes] = useState('');

  // Feedback State
  const [feedback, setFeedback] = useState<LessonFeedbackRecord | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    objectivesAchieved: 'fully',
    comprehensionRating: 4,
    encounteredDifficulties: '',
    teacherNotes: ''
  });
  const [savingFeedback, setSavingFeedback] = useState(false);

  // Publish Homework State
  const [publishingHw, setPublishingHw] = useState(false);

  useEffect(() => {
    if (isOpen && lessonId) {
      setLoading(true);
      Promise.all([
        apiRequest(`/lessons/${lessonId}/prep`),
        apiRequest(`/lesson-feedback/${lessonId}`)
      ]).then(([prepRes, fbRes]) => {
        setLoading(false);
        if (prepRes.success && prepRes.data) {
          const p: LessonPreparation = prepRes.data;
          setUnit(p.unit || '');
          setDurationMinutes(p.durationMinutes || 90);
          setEducationalObjectives(p.educationalObjectives?.length ? p.educationalObjectives : ['']);
          setTargetSkills(p.targetSkills?.length ? p.targetSkills : ['']);
          setWarmupHook(p.warmupHook || '');
          setSummaryExplanation(p.summaryExplanation || '');
          setLessonElements(p.lessonElements?.length ? p.lessonElements : ['']);
          setGradedExamples(p.gradedExamples || []);
          setInteractiveActivities(p.interactiveActivities?.length ? p.interactiveActivities : ['']);
          setComprehensionQuestions(p.comprehensionQuestions || []);
          if (p.inClassEffort) setInClassEffort(p.inClassEffort);
          setConclusionSummary(p.conclusionSummary || '');
          setHomeworkDescription(p.homeworkDescription || '');
          if (p.differentiatedHomework) setDifferentiatedHomework(p.differentiatedHomework);
          setQuickAssessmentQuestions(p.quickAssessmentQuestions?.length ? p.quickAssessmentQuestions : []);
          setTeacherPrivateNotes(p.teacherPrivateNotes || '');
        } else {
          // Default fallbacks
          setUnit(`الوحدة الأولى - ${subject}`);
          setEducationalObjectives([
            `أن يستوعب الطالب القوانين والمفاهيم الجوهرية لدرس ${lessonTitle}`,
            `أن يطبق القوانين على مسائل متدرجة من المستوى الأساسي للمتقدم`
          ]);
          setLessonElements([
            'التهيئة الحافزة والمراجعة التشخيصية (10 دقائق)',
            'الشرح التفاعلي وبناء المفاهيم (35 دقيقة)',
            'حل تدريبات ونماذج متدرجة وتطبيق فردي (25 دقيقة)',
            'التقويم الختامي وتكليف الواجب المتمايز (20 دقيقة)'
          ]);
          setWarmupHook(`مسألة واقعية أو تحدٍ ذهني سريع يربط موضوع ${lessonTitle} بالحياة اليومية.`);
          setSummaryExplanation(`شرح مبسط للمفاهيم الأساسية مع إبراز العلاقات الرياضية ونقاط الحذر الشائعة.`);
          setHomeworkDescription(`حل تدريبات الكتاب والأنشطة التمايزية الخاصة بـ ${lessonTitle}`);
        }

        if (fbRes.success && fbRes.data) {
          setFeedback(fbRes.data);
          setFeedbackForm({
            objectivesAchieved: fbRes.data.objectivesAchieved || 'fully',
            comprehensionRating: fbRes.data.comprehensionRating || 4,
            encounteredDifficulties: fbRes.data.encounteredDifficulties || '',
            teacherNotes: fbRes.data.teacherNotes || ''
          });
        }
      });
    }
  }, [isOpen, lessonId, lessonTitle, subject]);

  if (!isOpen) return null;

  // Standard Smart AI Generator
  const handleGenerateSmartAi = async () => {
    setAiGenerating(true);
    const res = await apiRequest('/lesson-prep/generate-smart', {
      method: 'POST',
      body: JSON.stringify({
        lessonTitle,
        subject,
        stage,
        grade: 'الصف الثالث الثانوي',
        durationMinutes
      })
    });
    setAiGenerating(false);

    if (res.success && res.data) {
      applyAiPrepData(res.data);
      showToast('تم توليد خطة التحضير الذكية الشاملة بالذكاء الاصطناعي!', 'success');
    } else {
      showToast('تعذر توليد التحضير.', 'error');
    }
  };

  // Student-Aware AI Generator (takes into account real student weaknesses)
  const handleGenerateStudentAwareAi = async () => {
    setAiStudentAwareGenerating(true);
    const res = await apiRequest('/lesson-prep/generate-student-aware', {
      method: 'POST',
      body: JSON.stringify({
        lessonId,
        groupId: groupId || 'grp_1',
        lessonTitle,
        durationMinutes
      })
    });
    setAiStudentAwareGenerating(false);

    if (res.success && res.data) {
      applyAiPrepData(res.data);
      showToast('تم تخصيص التحضير الذكي بناءً على مستوى ودرجات وفجوات طلاب المجموعة!', 'success');
    } else {
      showToast('تعذر توليد التحضير المخصص للطلاب.', 'error');
    }
  };

  const applyAiPrepData = (d: any) => {
    if (d.unit) setUnit(d.unit);
    if (d.educationalObjectives) setEducationalObjectives(d.educationalObjectives);
    if (d.targetSkills) setTargetSkills(d.targetSkills);
    if (d.warmupHook) setWarmupHook(d.warmupHook);
    if (d.summaryExplanation) setSummaryExplanation(d.summaryExplanation);
    if (d.lessonElements) setLessonElements(d.lessonElements);
    if (d.gradedExamples) setGradedExamples(d.gradedExamples);
    if (d.interactiveActivities) setInteractiveActivities(d.interactiveActivities);
    if (d.comprehensionQuestions) setComprehensionQuestions(d.comprehensionQuestions);
    if (d.inClassEffort) setInClassEffort(d.inClassEffort);
    if (d.conclusionSummary) setConclusionSummary(d.conclusionSummary);
    if (d.homeworkDescription) setHomeworkDescription(d.homeworkDescription);
    if (d.differentiatedHomework) setDifferentiatedHomework(d.differentiatedHomework);
    if (d.quickAssessmentQuestions) setQuickAssessmentQuestions(d.quickAssessmentQuestions);
  };

  // AI Element Transform (e.g. simplify explanation, add analogies)
  const handleTransformElement = async (transformType: string, currentContent: string) => {
    setTransforming(transformType);
    const res = await apiRequest('/lesson-prep/transform', {
      method: 'POST',
      body: JSON.stringify({
        transformType,
        content: currentContent,
        subject,
        grade: 'الصف الثالث الثانوي'
      })
    });
    setTransforming(null);

    if (res.success && res.data?.transformedContent) {
      if (transformType === 'simplify') {
        setSummaryExplanation(res.data.transformedContent);
      } else if (transformType === 'real_world_analogy') {
        setWarmupHook(res.data.transformedContent);
      }
      showToast('تم تعديل العنصر بواسطة الذكاء الاصطناعي بنجاح!', 'success');
    }
  };

  // Save Lesson Plan
  const handleSave = async () => {
    setLoading(true);
    const res = await apiRequest(`/lessons/${lessonId}/prep`, {
      method: 'POST',
      body: JSON.stringify({
        lessonTitle,
        subject,
        unit,
        durationMinutes,
        educationalObjectives: educationalObjectives.filter(Boolean),
        targetSkills: targetSkills.filter(Boolean),
        warmupHook,
        summaryExplanation,
        lessonElements: lessonElements.filter(Boolean),
        gradedExamples,
        interactiveActivities: interactiveActivities.filter(Boolean),
        comprehensionQuestions,
        inClassEffort,
        conclusionSummary,
        homeworkDescription,
        differentiatedHomework,
        quickAssessmentQuestions: quickAssessmentQuestions.filter(q => q.question.trim()),
        teacherPrivateNotes,
        aiGenerated: true
      })
    });
    setLoading(false);

    if (res.success) {
      showToast('تم حفظ خطة التحضير الذكية بنجاح!', 'success');
      if (onSaved) onSaved();
      onClose();
    } else {
      showToast(res.error || 'تعذر حفظ التحضير.', 'error');
    }
  };

  // Save Feedback
  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFeedback(true);
    const res = await apiRequest('/lesson-feedback', {
      method: 'POST',
      body: JSON.stringify({
        lessonId,
        ...feedbackForm
      })
    });
    setSavingFeedback(false);

    if (res.success) {
      showToast('تم توثيق تقييم الحصة وتوليد مقترحات الحصة القادمة بنجاح!', 'success');
      setFeedback(res.data);
    } else {
      showToast(res.error || 'تعذر حفظ التقييم.', 'error');
    }
  };

  // Publish Differentiated Homework
  const handlePublishDifferentiatedHomework = async (type: 'remedial' | 'core' | 'advanced') => {
    const list = differentiatedHomework[type];
    if (!list || list.length === 0) {
      showToast('لا توجد أسئلة في هذا المستوى لنشرها.', 'warning');
      return;
    }

    setPublishingHw(true);
    const titles: Record<string, string> = {
      remedial: `واجب تثبيت الأساسيات (علاجي) - ${lessonTitle}`,
      core: `واجب التمارين الأساسية (مستهدف) - ${lessonTitle}`,
      advanced: `واجب التحدي والتفكير المتقدم (إثرائي) - ${lessonTitle}`
    };

    const res = await apiRequest('/differentiated-homework/publish', {
      method: 'POST',
      body: JSON.stringify({
        groupId: groupId || 'grp_1',
        lessonId,
        homeworkType: type,
        title: titles[type],
        questions: list,
        dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
        maxScore: list.reduce((sum, q) => sum + (q.points || 5), 0)
      })
    });
    setPublishingHw(false);

    if (res.success) {
      showToast(`تم نشر ${titles[type]} وإسناده للطلاب بنجاح!`, 'success');
    } else {
      showToast(res.error || 'تعذر نشر الواجب.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold">{lessonTitle}</h2>
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {subject}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">منظومة التحضير الذكي المتمايز والربط بالحصص والواجبات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={printDocument}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
              title="طباعة الخطة / PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Top Tabs */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModalTab('prep')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModalTab === 'prep' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>خطة التحضير والأنشطة (13 عنصراً)</span>
            </button>

            <button
              onClick={() => setActiveModalTab('differentiated')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModalTab === 'differentiated' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>الواجب المتمايز والمجهود الصفي</span>
            </button>

            <button
              onClick={() => setActiveModalTab('feedback')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModalTab === 'feedback' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>تقييم ما بعد الحصة وتوصيات القادم</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateSmartAi}
              disabled={aiGenerating || aiStudentAwareGenerating}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} />
              <span>{aiGenerating ? 'جاري الصياغة...' : 'تحضير ذكي AI'}</span>
            </button>

            <button
              onClick={handleGenerateStudentAwareAi}
              disabled={aiGenerating || aiStudentAwareGenerating}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{aiStudentAwareGenerating ? 'جاري تحليل الطلاب...' : 'تحضير مخصص لفجوات المجموعة'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Structured Lesson Plan */}
          {activeModalTab === 'prep' && (
            <div className="space-y-6">
              {/* Unit & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الوحدة الدراسية:</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">زمن الحصة (بالدقائق):</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Objectives */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">الأهداف التعليمية والسلوكية:</span>
                  <button
                    onClick={() => setEducationalObjectives(prev => [...prev, ''])}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة هدف</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {educationalObjectives.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={obj}
                        onChange={e => {
                          const updated = [...educationalObjectives];
                          updated[i] = e.target.value;
                          setEducationalObjectives(updated);
                        }}
                        placeholder={`الهدف رقم ${i + 1}...`}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                      />
                      {educationalObjectives.length > 1 && (
                        <button
                          onClick={() => setEducationalObjectives(prev => prev.filter((_, idx) => idx !== i))}
                          className="p-2 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Warmup Hook with AI rewrite */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">التهيئة الحافزة وسؤال الانطلاق:</span>
                  <button
                    onClick={() => handleTransformElement('real_world_analogy', warmupHook)}
                    disabled={transforming === 'real_world_analogy'}
                    className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold flex items-center gap-1 border border-purple-200"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>{transforming === 'real_world_analogy' ? 'جاري الربط...' : 'ربط بمثال واقعي AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={warmupHook}
                  onChange={e => setWarmupHook(e.target.value)}
                  placeholder="سؤال ذهني أو موقف مشوق يبدأ به الدرس..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              {/* Summary Explanation with AI Simplify */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">ملخص الشرح والمفاهيم المحورية:</span>
                  <button
                    onClick={() => handleTransformElement('simplify', summaryExplanation)}
                    disabled={transforming === 'simplify'}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-200"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>{transforming === 'simplify' ? 'جاري التبسيط...' : 'تبسيط الشرح AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={summaryExplanation}
                  onChange={e => setSummaryExplanation(e.target.value)}
                  placeholder="العناصر والقوانين الجوهرية التي سيتم شرحها..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 leading-relaxed"
                />
              </div>

              {/* Graded Examples */}
              {gradedExamples.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">الأمثلة التدريبية المتدرجة الصعوبة:</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {gradedExamples.map((ex, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            ex.tier === 1 ? 'bg-emerald-100 text-emerald-800' :
                            ex.tier === 2 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            المستوى {ex.tier}: {ex.tierName}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">{ex.exampleText}</p>
                        <p className="text-[11px] text-slate-500">{ex.solutionSummary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson Elements / Timeline */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">المخطط الزمني ومراحل الحصة:</span>
                <div className="space-y-2">
                  {lessonElements.map((elem, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={elem}
                        onChange={e => {
                          const updated = [...lessonElements];
                          updated[i] = e.target.value;
                          setLessonElements(updated);
                        }}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Private Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">ملاحظات المعلم الخاصة (للتدريس فقط):</label>
                <textarea
                  rows={2}
                  value={teacherPrivateNotes}
                  onChange={e => setTeacherPrivateNotes(e.target.value)}
                  placeholder="ملاحظات تذكيرية خاصة بك أثناء تقديم الحصة..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Differentiated Homework & In-Class Effort */}
          {activeModalTab === 'differentiated' && (
            <div className="space-y-6">
              {/* In-Class Effort Section */}
              <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-700" />
                  <h4 className="font-extrabold text-xs text-amber-950">المجهود الفردي الصفي (تطبيق خلال الحصة)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={inClassEffort.taskName}
                    onChange={e => setInClassEffort(prev => ({ ...prev, taskName: e.target.value }))}
                    placeholder="اسم المهمة الصفية (مثال: حل المسألة التحدي فردياً)..."
                    className="p-2.5 bg-white border border-amber-200 rounded-xl text-xs outline-none focus:border-amber-600"
                  />
                  <input
                    type="number"
                    value={inClassEffort.durationMinutes}
                    onChange={e => setInClassEffort(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    placeholder="المدة بالدقائق (مثال: 15)..."
                    className="p-2.5 bg-white border border-amber-200 rounded-xl text-xs outline-none focus:border-amber-600"
                  />
                </div>
                <textarea
                  rows={2}
                  value={inClassEffort.instructions}
                  onChange={e => setInClassEffort(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="تعليمات المهمة ومعايير التقييم السريع..."
                  className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              {/* 3 Tiers of Differentiated Homework */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800">مهام الواجب المتمايز (حسب مستويات الطلاب):</h4>

                {/* Tier 1: Remedial */}
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-emerald-900">1. المستوى العلاجي وتثبيت الأساسيات (Remedial)</span>
                      <p className="text-[10px] text-emerald-700">مخصص للطلاب الذين يحتاجون ترسيخ القواعد المباشرة</p>
                    </div>
                    <button
                      onClick={() => handlePublishDifferentiatedHomework('remedial')}
                      disabled={publishingHw}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>نشر كواجب رسمي</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(differentiatedHomework?.remedial || []).map((q, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-emerald-100 text-xs text-slate-800">
                        {idx + 1}. {q.text} ({q.points} درجات)
                      </div>
                    ))}
                    {(!differentiatedHomework?.remedial || differentiatedHomework.remedial.length === 0) && (
                      <div className="text-xs text-slate-400 italic">اضغط "تحضير ذكي" لتوليد أسئلة هذا المستوى.</div>
                    )}
                  </div>
                </div>

                {/* Tier 2: Core */}
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-blue-900">2. المستوى الأساسي والتطبيقي (Core)</span>
                      <p className="text-[10px] text-blue-700">مخصص للمستوى العام للدرس لجميع طلاب المجموعة</p>
                    </div>
                    <button
                      onClick={() => handlePublishDifferentiatedHomework('core')}
                      disabled={publishingHw}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>نشر كواجب رسمي</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(differentiatedHomework?.core || []).map((q, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-blue-100 text-xs text-slate-800">
                        {idx + 1}. {q.text} ({q.points} درجات)
                      </div>
                    ))}
                    {(!differentiatedHomework?.core || differentiatedHomework.core.length === 0) && (
                      <div className="text-xs text-slate-400 italic">اضغط "تحضير ذكي" لتوليد أسئلة هذا المستوى.</div>
                    )}
                  </div>
                </div>

                {/* Tier 3: Advanced */}
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-purple-900">3. المستوى الإثرائي والتحدي (Advanced)</span>
                      <p className="text-[10px] text-purple-700">مخصص للطلاب المتميزين والمسائل غير النمطية</p>
                    </div>
                    <button
                      onClick={() => handlePublishDifferentiatedHomework('advanced')}
                      disabled={publishingHw}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>نشر كواجب رسمي</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(differentiatedHomework?.advanced || []).map((q, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-purple-100 text-xs text-slate-800">
                        {idx + 1}. {q.text} ({q.points} درجات)
                      </div>
                    ))}
                    {(!differentiatedHomework?.advanced || differentiatedHomework.advanced.length === 0) && (
                      <div className="text-xs text-slate-400 italic">اضغط "تحضير ذكي" لتوليد أسئلة هذا المستوى.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Post-Lesson Feedback & Next Lesson Suggestions */}
          {activeModalTab === 'feedback' && (
            <div className="space-y-6">
              <form onSubmit={handleSaveFeedback} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800">توثيق مخرجات الحصة المنفذة:</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">مدى تحقق الأهداف التعليمية:</label>
                    <select
                      value={feedbackForm.objectivesAchieved}
                      onChange={e => setFeedbackForm(prev => ({ ...prev, objectivesAchieved: e.target.value }))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                    >
                      <option value="fully">تحققت بالكامل (ممتاز)</option>
                      <option value="partially">تحققت جزئياً (تحتاج تثبيت)</option>
                      <option value="minimal">تحتاج إعادة تدريس لبعض المفاهيم</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">مستوى استيعاب الطلاب العام (1-5):</label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFeedbackForm(prev => ({ ...prev, comprehensionRating: rating }))}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            rating <= feedbackForm.comprehensionRating
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-500'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الصعوبات أو الفجوات التي ظهرت أثناء الشرح:</label>
                  <input
                    type="text"
                    value={feedbackForm.encounteredDifficulties}
                    onChange={e => setFeedbackForm(prev => ({ ...prev, encounteredDifficulties: e.target.value }))}
                    placeholder="مثال: صعوبة في تحويل الوحدات، التردد في حل المعادلات المثلثية..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">ملاحظات المعلم وتوصياته للحصة التالية:</label>
                  <textarea
                    rows={2}
                    value={feedbackForm.teacherNotes}
                    onChange={e => setFeedbackForm(prev => ({ ...prev, teacherNotes: e.target.value }))}
                    placeholder="اكتب ملاحظاتك..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingFeedback}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingFeedback ? 'جاري الحفظ والتوليد...' : 'حفظ التقييم وتوليد مقترحات الحصة القادمة AI'}</span>
                  </button>
                </div>
              </form>

              {/* AI Next Lesson Suggestions Card */}
              {feedback?.nextLessonAiSuggestions && (
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>مقترحات وتوصيات الذكاء الاصطناعي للحصة القادمة:</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-indigo-900 block">مواضيع يجب البدء بها في التهيئة:</span>
                    <ul className="list-disc list-inside text-xs text-indigo-950 space-y-1">
                      {(feedback.nextLessonAiSuggestions.reviewFocusTopics || []).map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-indigo-100">
                    <span className="text-[11px] font-bold text-indigo-900 block">استراتيجيات تدريسية موصى بها:</span>
                    <ul className="list-disc list-inside text-xs text-indigo-950 space-y-1">
                      {(feedback.nextLessonAiSuggestions.recommendedTeachingStrategies || []).map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            إغلاق
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'جاري الحفظ...' : 'حفظ التحضير واعتماده'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

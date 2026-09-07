import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Brain,
  Sliders,
  Award,
  Users,
  Send,
  RefreshCw,
  Edit3,
  Save,
  Check,
  Zap,
  BookOpen,
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { InitialAssessment, PlacementTest, LearningProfile, PlacementRecommendation } from '../types.js';

interface StudentAssessmentAndPlacementProps {
  student: any;
  onStudentUpdated?: () => void;
}

export const StudentAssessmentAndPlacement: React.FC<StudentAssessmentAndPlacementProps> = ({
  student,
  onStudentUpdated
}) => {
  const { showToast } = useToast();
  const [subTab, setSubTab] = useState<'initial' | 'placement' | 'profile' | 'groupRec'>('profile');
  const [loading, setLoading] = useState(false);

  // Initial Assessment State
  const [initialAssessment, setInitialAssessment] = useState<InitialAssessment | null>(null);
  const [ratings, setRatings] = useState({
    comprehension: 3,
    learningSpeed: 3,
    focus: 3,
    participation: 3,
    problemSolving: 3,
    retention: 3,
    application: 3,
    independence: 3,
    homeworkCommitment: 3,
    attendanceDiscipline: 3
  });
  const [assessmentNotes, setAssessmentNotes] = useState({
    strengths: '',
    weaknesses: '',
    currentDifficulties: '',
    teacherNotes: '',
    expectedLevel: '',
    topicsNeedingReview: ''
  });
  const [savingAssessment, setSavingAssessment] = useState(false);

  // Placement Test State
  const [placementTests, setPlacementTests] = useState<PlacementTest[]>([]);
  const [activeTest, setActiveTest] = useState<PlacementTest | null>(null);
  const [generatingTest, setGeneratingTest] = useState(false);
  const [topicsInput, setTopicsInput] = useState('');
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [submittingTest, setSubmittingTest] = useState(false);

  // Learning Profile State
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSummary, setProfileSummary] = useState('');

  // Group Recommendation State
  const [recommendation, setRecommendation] = useState<PlacementRecommendation | null>(null);
  const [recommending, setRecommending] = useState(false);
  const [assigningGroup, setAssigningGroup] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Initial Assessment
      const initRes = await apiRequest(`/initial-assessments/${student.id}`);
      if (initRes.success && initRes.data) {
        setInitialAssessment(initRes.data);
        setRatings(initRes.data.ratings || ratings);
        setAssessmentNotes(initRes.data.notes || assessmentNotes);
      }

      // 2. Placement Tests
      const testRes = await apiRequest(`/placement-tests/${student.id}`);
      if (testRes.success && testRes.data) {
        setPlacementTests(testRes.data);
        if (testRes.data.length > 0) {
          setActiveTest(testRes.data[0]);
        }
      }

      // 3. Learning Profile
      const profRes = await apiRequest(`/learning-profiles/${student.id}`);
      if (profRes.success && profRes.data) {
        setLearningProfile(profRes.data);
        setProfileSummary(profRes.data.educationalSummary || '');
      }
    } catch (e) {
      console.error('Error loading assessment data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student?.id) {
      loadData();
    }
  }, [student?.id]);

  // Handle Initial Assessment Save
  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAssessment(true);
    const res = await apiRequest('/initial-assessments', {
      method: 'POST',
      body: JSON.stringify({
        studentId: student.id,
        ratings,
        notes: assessmentNotes
      })
    });
    setSavingAssessment(false);

    if (res.success) {
      showToast('تم حفظ التقييم الأولي بنجاح وتحديث مؤشرات الطالب.', 'success');
      setInitialAssessment(res.data);
      if (onStudentUpdated) onStudentUpdated();
    } else {
      showToast(res.error || 'تعذر حفظ التقييم الأولي.', 'error');
    }
  };

  // Handle Placement Test Generation
  const handleGeneratePlacementTest = async () => {
    setGeneratingTest(true);
    const topics = topicsInput.split(',').map(t => t.trim()).filter(Boolean);
    const res = await apiRequest('/placement-tests/generate', {
      method: 'POST',
      body: JSON.stringify({
        studentId: student.id,
        subject: student.groupSubject || 'الرياضيات',
        stage: 'المرحلة الثانوية',
        grade: 'الصف الثالث الثانوي',
        topics: topics.length > 0 ? topics : ['الأساسيات والمفاهيم الجبرية', 'التفاضل والتكامل', 'التطبيقات العملية'],
        initialLevelEstimate: student.comprehensionLevel
      })
    });

    if (res.success && res.data) {
      // Save generated test to backend
      const saveRes = await apiRequest('/placement-tests', {
        method: 'POST',
        body: JSON.stringify({
          studentId: student.id,
          title: res.data.title || `اختبار تحديد مستوى - ${student.name}`,
          subject: student.groupSubject || 'الرياضيات',
          stage: 'المرحلة الثانوية',
          grade: 'الصف الثالث الثانوي',
          topicsCovered: topics,
          questions: res.data.questions
        })
      });

      if (saveRes.success) {
        showToast('تم إنشاء اختبار تحديد المستوى الذكي بنجاح!', 'success');
        setPlacementTests(prev => [saveRes.data, ...prev]);
        setActiveTest(saveRes.data);
        setSubTab('placement');
      }
    } else {
      showToast('تعذر توليد الاختبار عبر الذكاء الاصطناعي.', 'error');
    }
    setGeneratingTest(false);
  };

  // Handle Placement Test Submission & Auto Grading
  const handleSubmitTest = async () => {
    if (!activeTest) return;
    setSubmittingTest(true);

    const answersPayload = Object.entries(testAnswers).map(([qId, ans]) => ({
      questionId: Number(qId),
      studentAnswer: ans
    }));

    const res = await apiRequest(`/placement-tests/${activeTest.id}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        answers: answersPayload
      })
    });

    setSubmittingTest(false);
    if (res.success) {
      showToast('تم تصحيح الاختبار وبناء ملف التعلم التشخيصي للطالب بنجاح!', 'success');
      setActiveTest(res.data);
      loadData();
      if (onStudentUpdated) onStudentUpdated();
      setSubTab('profile');
    } else {
      showToast(res.error || 'تعذر اعتماد درجات الاختبار.', 'error');
    }
  };

  // Handle AI Group Recommendation
  const handleGetRecommendation = async () => {
    setRecommending(true);
    const res = await apiRequest('/groups/recommend', {
      method: 'POST',
      body: JSON.stringify({ studentId: student.id })
    });
    setRecommending(false);

    if (res.success) {
      setRecommendation(res.data);
      showToast('تم استخراج توصية التسكين الملائمة بنجاح.', 'success');
      setSubTab('groupRec');
    } else {
      showToast(res.error || 'تعذر استخراج توصية المجموعة.', 'error');
    }
  };

  // Handle Group Assignment
  const handleAssignToGroup = async (groupId: string, recommendationId?: string) => {
    setAssigningGroup(true);
    const res = await apiRequest('/groups/assign-student', {
      method: 'POST',
      body: JSON.stringify({
        studentId: student.id,
        groupId,
        recommendationId
      })
    });
    setAssigningGroup(false);

    if (res.success) {
      showToast(res.message || 'تم تسكين الطالب في المجموعة المحددة بنجاح.', 'success');
      if (onStudentUpdated) onStudentUpdated();
      loadData();
    } else {
      showToast(res.error || 'تعذر تسكين الطالب.', 'error');
    }
  };

  // Handle Update Profile Summary
  const handleSaveProfileSummary = async () => {
    if (!learningProfile) return;
    const res = await apiRequest(`/learning-profiles/${student.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...learningProfile,
        educationalSummary: profileSummary
      })
    });

    if (res.success) {
      showToast('تم تعديل الملخص التربوي بنجاح.', 'success');
      setLearningProfile(res.data);
      setEditingProfile(false);
    }
  };

  const RATING_DIMENSIONS = [
    { key: 'comprehension', label: 'الفهم والاستيعاب للمفاهيم', desc: 'مدى سهولة التقاط الأفكار النظرية والرياضية' },
    { key: 'learningSpeed', label: 'سرعة التعلم والبديهة', desc: 'الزمن اللازم للانتقال من مرحلة الشرح إلى الحل' },
    { key: 'focus', label: 'التركيز والانتباه أثناء الحصة', desc: 'مستوى الثبات الذهني وتجنب التشتت' },
    { key: 'participation', label: 'التفاعل والمشاركة الصفية', desc: 'المبادرة بالإجابة وطرح الأسئلة الذكية' },
    { key: 'problemSolving', label: 'مهارة حل المشكلات والمسائل', desc: 'القدرة على التفكير المنطقي والخطوات المتسلسلة' },
    { key: 'retention', label: 'تذكر المعلومات السابقة واسترجاعها', desc: 'الربط التراكمي بين الدروس السابقة والجديدة' },
    { key: 'application', label: 'التطبيق العملي ونقل المعرفة', desc: 'حل نماذج واقعية وأسئلة غير نمطية' },
    { key: 'independence', label: 'الاستقلالية في أداء المهام', desc: 'الاعتماد على النفس دون الحاجة للتوجيه المستمر' },
    { key: 'homeworkCommitment', label: 'الالتزام بالواجبات والمهام', desc: 'تسليم الواجبات بدقة وفي المواعيد المحددة' },
    { key: 'attendanceDiscipline', label: 'الانضباط والجدية', desc: 'الحرص على عدم الغياب والاستعداد الذهني' }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header with Sub-Tabs */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base">ملف التعلم والتقييم الأولي الذكي</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            منظومة متكاملة لتشخيص مستوى الطالب التعليمي، تحديد نقاط القوة والفجوات، وتسكين المجموعة الأنسب.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'profile' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ملف التعلم الشامل</span>
          </button>

          <button
            onClick={() => setSubTab('initial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'initial' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>التقييم الأولي للمعلم</span>
          </button>

          <button
            onClick={() => setSubTab('placement')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'placement' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>اختبار تحديد المستوى ({placementTests.length})</span>
          </button>

          <button
            onClick={() => setSubTab('groupRec')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'groupRec' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>تسكين المجموعة</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* SUBTAB 1: Comprehensive Learning Profile */}
        {subTab === 'profile' && (
          <div className="space-y-6">
            {!learningProfile && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-4">
                <Brain className="w-12 h-12 text-slate-400 mx-auto" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">لم يتم إنشاء ملف تعلم تشخيصي للطالب بعد</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    يمكنك إكمال التقييم الأولي للمعلم أو توليد اختبار تحديد المستوى الذكي لبناء ملف التعلم تلقائياً بواسطة الذكاء الاصطناعي.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setSubTab('initial')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    بدء التقييم الأولي
                  </button>
                  <button
                    onClick={handleGeneratePlacementTest}
                    disabled={generatingTest}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{generatingTest ? 'جاري توليد الاختبار...' : 'توليد اختبار تحديد المستوى AI'}</span>
                  </button>
                </div>
              </div>
            )}

            {learningProfile && (
              <div className="space-y-6">
                {/* 4 Competency Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-[11px] font-bold text-emerald-800 block">الأساسيات والمفاهيم</span>
                    <span className="text-lg font-black text-emerald-950 mt-1 block">{learningProfile.basicsLevel}</span>
                    <span className="text-[10px] text-emerald-700 mt-1 block">القواعد والجذور المعرفية</span>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <span className="text-[11px] font-bold text-blue-800 block">الفهم والاستيعاب</span>
                    <span className="text-lg font-black text-blue-950 mt-1 block">{learningProfile.comprehensionLevel}</span>
                    <span className="text-[10px] text-blue-700 mt-1 block">استيعاب العلاقات والربط</span>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <span className="text-[11px] font-bold text-indigo-800 block">التطبيق المباشر</span>
                    <span className="text-lg font-black text-indigo-950 mt-1 block">{learningProfile.applicationLevel}</span>
                    <span className="text-[10px] text-indigo-700 mt-1 block">حل المسائل والتمارين</span>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <span className="text-[11px] font-bold text-purple-800 block">حل المشكلات والتفكير</span>
                    <span className="text-lg font-black text-purple-950 mt-1 block">{learningProfile.problemSolvingLevel}</span>
                    <span className="text-[10px] text-purple-700 mt-1 block">المسائل المركبة والإبداع</span>
                  </div>
                </div>

                {/* AI Educational Summary */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <h4 className="font-extrabold text-xs text-slate-800">التشخيص التربوي والملخص التراكمي (قابل للتعديل)</h4>
                    </div>
                    {!editingProfile ? (
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveProfileSummary}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>حفظ التعديل</span>
                      </button>
                    )}
                  </div>

                  {!editingProfile ? (
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200">
                      {learningProfile.educationalSummary || 'لا يوجد ملخص بعد.'}
                    </p>
                  ) : (
                    <textarea
                      rows={4}
                      value={profileSummary}
                      onChange={e => setProfileSummary(e.target.value)}
                      className="w-full p-3 bg-white border border-emerald-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  )}
                </div>

                {/* Strengths & Focus Areas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>نقاط القوة الأكاديمية</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-emerald-950 list-disc list-inside">
                      {(learningProfile.academicStrengths || []).length > 0 ? (
                        (learningProfile.academicStrengths || []).map((s, i) => <li key={i}>{s}</li>)
                      ) : (
                        <li className="text-emerald-700 text-[11px]">لم تسجل نقاط قوة بعد</li>
                      )}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      <span>فجوات ونقاط تحتاج تركيزاً</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-amber-950 list-disc list-inside">
                      {(learningProfile.focusAreas || []).length > 0 ? (
                        (learningProfile.focusAreas || []).map((w, i) => <li key={i}>{w}</li>)
                      ) : (
                        <li className="text-amber-700 text-[11px]">لا توجد فجوات محددة</li>
                      )}
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-xs">
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      <span>مواضيع مقترحة للمراجعة والتقوية</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-blue-950 list-disc list-inside">
                      {(learningProfile.recommendedReviewTopics || []).length > 0 ? (
                        (learningProfile.recommendedReviewTopics || []).map((r, i) => <li key={i}>{r}</li>)
                      ) : (
                        <li className="text-blue-700 text-[11px]">لا توجد موضوعات مراجعة حالياً</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Next Steps CTA */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    آخر تحديث للملف: {new Date(learningProfile.updatedAt).toLocaleDateString('ar-EG')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGetRecommendation}
                      disabled={recommending}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{recommending ? 'جاري التحليل...' : 'اقتراح المجموعة المناسبة للطالب'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: Initial Assessment Form */}
        {subTab === 'initial' && (
          <form onSubmit={handleSaveAssessment} className="space-y-6">
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>توجيه تربوي:</strong> يهدف هذا التقييم إلى رصد الانطباع الأكاديمي والمهاري الأولي للمعلم لمساعدة النظام في تخصيص خطة التعلم والواجبات. هذا التقييم مهاري وتدريسي بحت ولا يقدم أي أحكام نفسية أو طبية.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RATING_DIMENSIONS.map(dim => {
                const currentVal = (ratings as any)[dim.key] || 3;
                return (
                  <div key={dim.key} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{dim.label}</span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800">
                        {currentVal} / 5
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{dim.desc}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatings(prev => ({ ...prev, [dim.key]: star }))}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            star <= currentVal
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {star}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Qualitative Notes */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
              <h4 className="font-extrabold text-xs text-slate-800">الملاحظات النوعية للمعلم:</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">أبرز نقاط القوة الملحوظة:</label>
                  <input
                    type="text"
                    value={assessmentNotes.strengths}
                    onChange={e => setAssessmentNotes(prev => ({ ...prev, strengths: e.target.value }))}
                    placeholder="مثال: سرعة استيعاب القوانين، مهارة الحساب الذهني..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الفجوات أو الصعوبات الحالية:</label>
                  <input
                    type="text"
                    value={assessmentNotes.currentDifficulties}
                    onChange={e => setAssessmentNotes(prev => ({ ...prev, currentDifficulties: e.target.value }))}
                    placeholder="مثال: التسرع في الحسابات، ضعف في أساسيات المتجهات..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">مواضيع تحتاج إلى إعادة شرح أو مراجعة:</label>
                  <input
                    type="text"
                    value={assessmentNotes.topicsNeedingReview}
                    onChange={e => setAssessmentNotes(prev => ({ ...prev, topicsNeedingReview: e.target.value }))}
                    placeholder="مثال: التحليل الرياضي، التباديل والتوافيق..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">المستوى المتوقع للطالب في ختام الفصل:</label>
                  <input
                    type="text"
                    value={assessmentNotes.expectedLevel}
                    onChange={e => setAssessmentNotes(prev => ({ ...prev, expectedLevel: e.target.value }))}
                    placeholder="مثال: متفوق (A+), جيد جداً مرتفع..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">ملاحظات توجيهية خاصة بالمعلم:</label>
                <textarea
                  rows={2}
                  value={assessmentNotes.teacherNotes}
                  onChange={e => setAssessmentNotes(prev => ({ ...prev, teacherNotes: e.target.value }))}
                  placeholder="اكتب توجيهاتك الخاصة للتعامل مع الطالب في الحصص القادمة..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                {initialAssessment ? `تم التقييم سابقاً بتاريخ: ${new Date(initialAssessment.updatedAt).toLocaleDateString('ar-EG')}` : 'لم يتم الحفظ بعد'}
              </span>
              <button
                type="submit"
                disabled={savingAssessment}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingAssessment ? 'جاري الحفظ...' : 'حفظ التقييم وتحديث المؤشرات'}</span>
              </button>
            </div>
          </form>
        )}

        {/* SUBTAB 3: Diagnostic Placement Tests */}
        {subTab === 'placement' && (
          <div className="space-y-6">
            {/* Generate Test Panel */}
            <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h4 className="font-extrabold text-sm text-purple-950">توليد اختبار تشخيصي متدرج 5 مستويات (AI)</h4>
                </div>
                <span className="text-[11px] font-bold text-purple-700 bg-white px-2.5 py-1 rounded-full border border-purple-200">
                  5 مستويات متدرجة
                </span>
              </div>

              <p className="text-xs text-purple-900/80 leading-relaxed">
                يقوم الذكاء الاصطناعي بصياغة اختبار تشخيصي دقيق يغطي المستويات الخمسة: (1. الأساسيات، 2. الفهم المباشر، 3. التطبيق، 4. حل المشكلات، 5. التفكير المتقدم) لقياس القدرات الحقيقية للطالب.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={topicsInput}
                  onChange={e => setTopicsInput(e.target.value)}
                  placeholder="المواضيع المستهدفة (مثال: حساب المثلثات، النهايات، الاشتقاق)..."
                  className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <button
                  type="button"
                  onClick={handleGeneratePlacementTest}
                  disabled={generatingTest}
                  className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{generatingTest ? 'جاري التوليد والتحليل...' : 'توليد اختبار جديد'}</span>
                </button>
              </div>
            </div>

            {/* Active or Selected Test */}
            {activeTest ? (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{activeTest.title}</h4>
                    <span className="text-xs text-slate-500">
                      المادة: {activeTest.subject} • {activeTest.questions.length} أسئلة تشخيصية • إجمالي الدرجات: {activeTest.totalScore}
                    </span>
                  </div>

                  {activeTest.status === 'completed' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-200">
                        درجة الطالب: {activeTest.earnedScore} / {activeTest.totalScore} ({activeTest.masteryPercentage}%)
                      </span>
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200">
                      الاختبار قيد الإجابة
                    </span>
                  )}
                </div>

                {/* Tier Breakdown if completed */}
                {activeTest.tierScores && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Object.entries(activeTest.tierScores).map(([key, item]: any) => {
                      const labels: Record<string, string> = {
                        basics: '1. الأساسيات',
                        comprehension: '2. الفهم',
                        application: '3. التطبيق',
                        problemSolving: '4. حل المشكلات',
                        advanced: '5. التفكير المتقدم'
                      };
                      return (
                        <div key={key} className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">{labels[key] || key}</span>
                          <span className="text-sm font-black text-slate-900 block">{item.score} / {item.max}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-1 inline-block ${
                            item.level === 'ممتاز' ? 'bg-emerald-100 text-emerald-800' :
                            item.level === 'جيد جداً' ? 'bg-blue-100 text-blue-800' :
                            item.level === 'جيد' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.level}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Questions List with Answer Controls */}
                <div className="space-y-4">
                  {(activeTest.questions || []).map((q, idx) => {
                    const studentAns = testAnswers[q.id] !== undefined ? testAnswers[q.id] : (q.studentAnswer || '');
                    const isSubmitted = activeTest.status === 'completed';
                    const isCorrect = isSubmitted && studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isSubmitted
                            ? isCorrect
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-rose-50/50 border-rose-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              {q.tierName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              (المهارة: {q.measuredSkill})
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-500">{q.points} درجات</span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 leading-relaxed mb-3">
                          {q.questionText}
                        </p>

                        {/* Options if Multiple Choice */}
                        {q.options && q.options.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                            {(q.options || []).map((opt: string, optIdx: number) => {
                              const selected = studentAns === opt;
                              const isOptionCorrect = isSubmitted && opt === q.correctAnswer;
                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={isSubmitted}
                                  onClick={() => setTestAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                  className={`p-2.5 rounded-xl text-xs font-medium text-right border transition-all ${
                                    isOptionCorrect
                                      ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold'
                                      : selected
                                      ? isSubmitted && !isCorrect
                                        ? 'bg-rose-100 border-rose-300 text-rose-950'
                                        : 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mb-3">
                            <input
                              type="text"
                              disabled={isSubmitted}
                              value={studentAns}
                              onChange={e => setTestAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="إجابة الطالب..."
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                            />
                          </div>
                        )}

                        {/* If submitted, show explanation */}
                        {isSubmitted && (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                            <div className="font-bold text-slate-800">
                              الإجابة النموذجية: <span className="text-emerald-700 font-bold">{q.correctAnswer}</span>
                            </div>
                            <p className="text-[11px] text-slate-500">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {activeTest.status !== 'completed' && (
                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      disabled={submittingTest}
                      onClick={handleSubmitTest}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{submittingTest ? 'جاري التصحيح وبناء ملف التعلم...' : 'اعتماد درجات الاختبار وبناء الملف التشخيصي'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                لا يوجد اختبار محدد. استخدم زر التوليد بالأعلى لإنشاء اختبار تشخيصي متدرج.
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 4: Group Recommendation */}
        {subTab === 'groupRec' && (
          <div className="space-y-6">
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-200" />
                  <h4 className="font-extrabold text-sm">التسكين الذكي في المجموعة المناسبة</h4>
                </div>
                <button
                  onClick={handleGetRecommendation}
                  disabled={recommending}
                  className="px-3.5 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${recommending ? 'animate-spin' : ''}`} />
                  <span>{recommending ? 'جاري التحليل...' : 'تحديث التوصية'}</span>
                </button>
              </div>

              <p className="text-xs text-emerald-100 leading-relaxed">
                يقوم النظام بتحليل نتائج الاختبار التشخيصي وتقييم المعلم وسرعة التعلم لمطابقتها مع المجموعات المتاحة واقتراح المجموعة ذات التوافق والوتيرة التعليمية الأنسب للطالب.
              </p>
            </div>

            {recommendation ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">المجموعة المقترحة:</span>
                    <h4 className="font-black text-lg text-slate-900">{recommendation.suggestedGroupName}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">نسبة التوافق الأكاديمي:</span>
                    <span className="px-3 py-1 bg-emerald-600 text-white font-black text-sm rounded-xl">
                      {recommendation.compatibilityPercentage}%
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 block">مبررات التسكين والتحليل الأكاديمي:</span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {recommendation.reason}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    الحالة: {recommendation.status === 'accepted' ? 'تم اعتماد التسكين' : 'بانتظار قرار المعلم'}
                  </span>

                  <button
                    onClick={() => handleAssignToGroup(recommendation.suggestedGroupId, recommendation.id)}
                    disabled={assigningGroup || recommendation.suggestedGroupId === student.groupId}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {recommendation.suggestedGroupId === student.groupId
                        ? 'الطالب مسكن بالفعل في هذه المجموعة'
                        : assigningGroup
                        ? 'جاري النقل والتسكين...'
                        : 'اعتماد ونقل الطالب إلى المجموعة المقترحة'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">
                  انقر على زر "تحديث التوصية" لاستخراج المجموعة التعليمية الأكثر ملاءمة لقدرات الطالب.
                </p>
                <button
                  onClick={handleGetRecommendation}
                  disabled={recommending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تحليل واقتراح المجموعة الأنسب</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

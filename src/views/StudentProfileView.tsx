import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  GraduationCap,
  MessageSquare,
  Sparkles,
  ClipboardCheck,
  Award,
  BookOpenCheck,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  Phone,
  CheckCircle2,
  Clock,
  Printer,
  CreditCard,
  Wallet,
  DollarSign
} from 'lucide-react';
import { apiRequest, fetchStudentBillingLedger, recordStudentPayment, getBillingWhatsAppReminder } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { printDocument } from '../lib/exportUtils.js';
import { StudentAssessmentAndPlacement } from '../components/StudentAssessmentAndPlacement.js';
import { Brain } from 'lucide-react';

interface StudentProfileViewProps {
  studentId: string;
  onBack: () => void;
  onOpenParentMessage: (student: any) => void;
  onOpenAiStudentAnalysis: (student: any) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  studentId,
  onBack,
  onOpenParentMessage,
  onOpenAiStudentAnalysis
}) => {
  const { showToast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'attendance' | 'exams' | 'homework' | 'evaluations' | 'notes' | 'financial'>('overview');

  // Billing & Financial State
  const [billingLedger, setBillingLedger] = useState<any>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payNotes, setPayNotes] = useState('');
  const [submittingPay, setSubmittingPay] = useState(false);

  // New Note Modal / Input
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'educational' | 'behavioral' | 'private'>('educational');
  const [addingNote, setAddingNote] = useState(false);

  // New Behavior Modal / Input
  const [behaviorDesc, setBehaviorDesc] = useState('');
  const [behaviorType, setBehaviorType] = useState('talking_in_class');
  const [behaviorAction, setBehaviorAction] = useState('');
  const [addingBehavior, setAddingBehavior] = useState(false);

  const fetchStudent = async () => {
    setLoading(true);
    const res = await apiRequest(`/students/${studentId}`);
    setLoading(false);
    if (res.success && res.data) {
      setStudent(res.data);
    } else {
      showToast('تعذر تحميل بيانات الطالب.', 'error');
    }
  };

  const loadBilling = async () => {
    if (!studentId) return;
    setBillingLoading(true);
    const res = await fetchStudentBillingLedger(studentId);
    setBillingLoading(false);
    if (res.success) {
      setBillingLedger(res);
      if (res.summary?.balance > 0) {
        setPayAmount(String(res.summary.balance));
      }
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudent();
      loadBilling();
    }
  }, [studentId]);

  const handleRecordStudentPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      showToast('يرجى تحديد المبلغ بشكل صحيح.', 'error');
      return;
    }
    setSubmittingPay(true);
    const res = await recordStudentPayment({
      studentId,
      groupId: student?.groupId,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      notes: payNotes
    });
    setSubmittingPay(false);
    if (res.success) {
      showToast('تم تسجيل الدفعة بنجاح!', 'success');
      setPaymentModalOpen(false);
      setPayNotes('');
      loadBilling();
      fetchStudent();
    } else {
      showToast(res.error || 'تعذر تسجيل الدفعة.', 'error');
    }
  };

  const handleSendBillingReminder = async () => {
    const res = await getBillingWhatsAppReminder(studentId);
    if (res.success && res.whatsappUrl) {
      window.open(res.whatsappUrl, '_blank');
      showToast('تم فتح محادثة الواتساب مع ولي الأمر.', 'success');
    } else {
      showToast(res.error || 'تعذر إعداد رسالة الواتساب.', 'error');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setAddingNote(true);
    const res = await apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify({
        studentId,
        content: noteContent,
        type: noteType
      })
    });
    setAddingNote(false);

    if (res.success) {
      showToast('تمت إضافة الملاحظة بنجاح.', 'success');
      setNoteContent('');
      fetchStudent();
    }
  };

  const handleDeleteNote = async (id: string) => {
    const res = await apiRequest(`/notes/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('تم حذف الملاحظة.', 'success');
      fetchStudent();
    }
  };

  const handleAddBehavior = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!behaviorDesc.trim()) return;

    setAddingBehavior(true);
    const res = await apiRequest('/behavior', {
      method: 'POST',
      body: JSON.stringify({
        studentId,
        description: behaviorDesc,
        type: behaviorType,
        teacherActionTaken: behaviorAction
      })
    });
    setAddingBehavior(false);

    if (res.success) {
      showToast('تم توثيق الملاحظة السلوكية.', 'success');
      setBehaviorDesc('');
      setBehaviorAction('');
      fetchStudent();
    }
  };

  if (loading || !student) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        جاري تحميل الملف الأكاديمي للطالب...
      </div>
    );
  }

  const {
    attendanceHistory = [],
    examResults = [],
    homeworkHistory = [],
    evaluations = [],
    notes = [],
    behaviorRecords = []
  } = student;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Navigation & Profile Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة الطلاب</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={printDocument}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>طباعة الملف / PDF</span>
            </button>
            <button
              onClick={() => onOpenParentMessage(student)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>مراسلة ولي الأمر</span>
            </button>
          </div>
        </div>

        {/* Identity & KPI Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-xl flex items-center justify-center shadow-md">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg text-slate-900">{student.name}</h2>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {student.groupName}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                <span>ولي الأمر: <strong className="text-slate-700">{student.parentName}</strong> ({student.parentPhone})</span>
                {student.phone && <span>• هاتف الطالب: {student.phone}</span>}
                <span>• انضم في: {student.joinDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onOpenAiStudentAnalysis(student)}
              className="w-full md:w-auto px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>استشارة وتحليل الذكاء الاصطناعي</span>
            </button>
          </div>
        </div>

        {/* Score Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">نسبة الحضور</span>
            <span className="text-xl font-black text-emerald-700">{student.attendanceRate ?? 100}%</span>
            {student.consecutiveAbsences > 0 && (
              <span className="block text-[10px] text-rose-600 font-bold mt-0.5">غياب {student.consecutiveAbsences} حصص متتالية</span>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">متوسط درجات الاختبارات</span>
            <span className="text-xl font-black text-blue-700">{student.examsAverage ?? 0}%</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">نسبة تسليم الواجبات</span>
            <span className="text-xl font-black text-purple-700">{student.homeworkCompletionRate ?? 100}%</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">سرعة الاستيعاب والتعلم</span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">
              {student.learningSpeed === 'fast' ? 'سريع البديهة' : student.learningSpeed === 'needs_time' ? 'يحتاج وقتاً للتكرار' : 'طبيعي ومستقر'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'نظرة عامة والتحصيل', icon: GraduationCap },
          { id: 'assessment', label: 'التقييم الأولي وملف التعلم الذكي', icon: Brain },
          { id: 'attendance', label: `سجل الحضور (${attendanceHistory.length})`, icon: ClipboardCheck },
          { id: 'exams', label: `الاختبارات والدرجات (${examResults.length})`, icon: Award },
          { id: 'homework', label: `الواجبات (${homeworkHistory.length})`, icon: BookOpenCheck },
          { id: 'evaluations', label: `التقييمات الدورية (${evaluations.length})`, icon: FileText },
          { id: 'notes', label: `الملاحظات والسلوك (${notes.length + behaviorRecords.length})`, icon: MessageSquare },
          { id: 'financial', label: `الحسابات والمستحقات (${billingLedger?.summary?.balance ?? 0} ج.م)`, icon: CreditCard }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Assessment & Placement */}
      {activeTab === 'assessment' && (
        <StudentAssessmentAndPlacement
          student={student}
          onStudentUpdated={fetchStudent}
        />
      )}

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Learning Profile Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-3xl border border-emerald-800/40 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm">ملف التعلم الذكي والتقييم الأولي</h4>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                    {student.comprehensionLevel === 'advanced' ? 'مستوى متقدم' : student.comprehensionLevel === 'struggling' ? 'يحتاج لدعم وتأسيس' : 'مستوى متوسط مستقر'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  يمكنك إجراء اختبار تحديد مستوى تشخيصي، تقييم المحاور التربوية، أو طلب توصية ذكية لتسكين الطالب في المجموعة الأنسب.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('assessment')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>فتح ملف التقييم والتسكين</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths & Weaknesses */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">نقاط القوة والمجالات التعليمية</h3>
              <div>
                <span className="text-xs font-bold text-emerald-800 block mb-2">نقاط القوة والميزات الأكاديمية:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(student.strengths?.length ? student.strengths : ['المشاركة الصفية', 'الالتزام بالحضور']).map((str: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
                      ✓ {str}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-amber-800 block mb-2">موضوعات تحتاج إلى مراجعة وتدعيم:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(student.reviewNeeds?.length ? student.reviewNeeds : ['تطبيق المسائل المركبة']).map((rev: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-900 text-xs font-semibold rounded-lg border border-amber-200">
                      ⚠ {rev}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Teacher Summary Notes */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">ملاحظات المعلم العامة</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-28">
                {student.notes || 'طالب ملتزم بالحضور والمتابعة. يظهر رغبة في التطور واستيعاب القوانين الرياضية.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-900 mb-4">سجل الحضور والغياب التفصيلي</h3>
          {attendanceHistory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">لم يتم رصد أي حصص سابقة لهذا الطالب بعد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">التاريخ</th>
                    <th className="py-2.5 px-3 text-center">الحالة</th>
                    <th className="py-2.5 px-3">ملاحظات الحصة</th>
                    <th className="py-2.5 px-3">طريقة الرصد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceHistory.map((att: any) => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{att.date}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          att.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : att.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {att.status === 'present' ? 'حاضر' : att.status === 'late' ? 'متأخر' : 'غائب'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{att.note || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{att.method === 'qr' ? 'مسح QR' : 'رصد يدوي'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Exams */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-900 mb-4">نتائج وتدرج درجات الاختبارات</h3>
          {examResults.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">لم يتم رصد نتائج اختبارات بعد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">الاختبار</th>
                    <th className="py-2.5 px-3 text-center">الدرجة المحصلة</th>
                    <th className="py-2.5 px-3 text-center">النسبة المئوية</th>
                    <th className="py-2.5 px-3 text-center">الترتيب في المجموعة</th>
                    <th className="py-2.5 px-3">ملاحظات المصحح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examResults.map((ex: any) => (
                    <tr key={ex.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{ex.examTitle}</td>
                      <td className="py-2.5 px-3 text-center font-black text-slate-800">
                        {ex.score} / {ex.maxScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                        {ex.percentage}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {ex.rank ? <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">المركز {ex.rank}</span> : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{ex.feedback || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Homework */}
      {activeTab === 'homework' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-900 mb-4">سجل تسليم الواجبات والتطبيقات المنزلية</h3>
          {homeworkHistory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">لا توجد واجبات مسندة لهذا الطالب.</p>
          ) : (
            <div className="space-y-3">
              {homeworkHistory.map((hw: any) => (
                <div key={hw.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{hw.homeworkTitle}</h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">موعد التسليم: {hw.dueDate}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                    hw.status === 'completed' || hw.status === 'submitted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : hw.status === 'late'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {hw.status === 'completed' || hw.status === 'submitted' ? 'تم التسليم والحل' : hw.status === 'late' ? 'تسليم متأخر' : 'لم يسلم'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Evaluations */}
      {activeTab === 'evaluations' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">سجل التقييمات الشاملة (المستمرة)</h3>
          {evaluations.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">لم يتم إدخال تقييمات دورية بعد.</p>
          ) : (
            <div className="space-y-3">
              {evaluations.map((ev: any) => (
                <div key={ev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">تقييم بتاريخ: {ev.evaluationDate}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      {ev.overallProgress === 'rapid_progress' ? 'تقدم سريع' : 'تقدم مستمر'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{ev.teacherNotes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Notes & Behavior */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Notes Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">الملاحظات الصفية والتربوية</h3>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-700">تدوين ملاحظة جديدة:</span>
                <select
                  value={noteType}
                  onChange={e => setNoteType(e.target.value as any)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                >
                  <option value="educational">ملاحظة تعليمية</option>
                  <option value="behavioral">ملاحظة سلوكية</option>
                  <option value="private">ملاحظة خاصة بالمعلم فقط</option>
                </select>
              </div>
              <textarea
                rows={2}
                required
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="اكتب الملاحظة هنا..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingNote}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {addingNote ? 'جاري الحفظ...' : 'حفظ الملاحظة'}
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-2.5">
              {notes.map((n: any) => (
                <div key={n.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                        {n.type === 'private' ? 'خاص بالمعلم' : n.type === 'behavioral' ? 'سلوكي' : 'تعليمي'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.date} {n.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{n.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(n.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Financial & Billing */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">المتبقي المطلوب سداده</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${
                  (billingLedger?.summary?.balance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {billingLedger?.summary?.balance ?? 0}
                </span>
                <span className="text-xs font-bold text-slate-400">ج.م</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {(billingLedger?.summary?.balance || 0) > 0
                  ? `مستحق عن ${billingLedger?.summary?.unpaidItemsCount || 0} حصة غير مسددة`
                  : 'الحساب خالص ومسدد بالكامل'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي المستحق</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {billingLedger?.summary?.totalBilled ?? 0}
                </span>
                <span className="text-xs font-bold text-slate-400">ج.م</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">عن كافة الحصص والأنشطة المسجلة للطالب</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي المسدد</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-700">
                  {billingLedger?.summary?.totalPaid ?? 0}
                </span>
                <span className="text-xs font-bold text-emerald-600">ج.م</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">المقبوضات المسجلة نقدياً أو إلكترونياً</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">إدارة حساب الطالب والمدفوعات</h4>
                <p className="text-[11px] text-slate-500">تسجيل دفعة سداد جديدة أو إرسال تذكير بالمستحقات لولي الأمر</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSendBillingReminder}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>تذكير واتساب</span>
              </button>
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>تسجيل دفعة سداد</span>
              </button>
            </div>
          </div>

          {/* Billing Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-900">سجل استحقاقات الحصص والأنشطة</h4>
              <span className="text-xs text-slate-500">
                {billingLedger?.billingItems?.length || 0} استحقاق مسجل
              </span>
            </div>

            {(!billingLedger?.billingItems || billingLedger.billingItems.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500">
                لا توجد استحقاقات مسجلة بعد. تصدر الاستحقاقات آلياً عند تسجيل حضور الحصة.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">البند</th>
                      <th className="p-3">المستحق</th>
                      <th className="p-3">المسدد</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {billingLedger.billingItems.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="p-3 text-slate-600">{item.date}</td>
                        <td className="p-3 font-bold text-slate-900">{item.title}</td>
                        <td className="p-3 font-bold text-slate-900">{item.amountDue} ج.م</td>
                        <td className="p-3 text-emerald-700 font-bold">{item.amountPaid} ج.م</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'partially_paid'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.status === 'paid' ? 'مسدد' : item.status === 'partially_paid' ? 'جزئي' : 'غير مسدد'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payments History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-900">سجل المقبوضات والدفعات المستلمة</h4>
              <span className="text-xs text-slate-500">
                {billingLedger?.payments?.length || 0} عملية سداد
              </span>
            </div>

            {(!billingLedger?.payments || billingLedger.payments.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500">
                لم يتم تسجيل أي مدفوعات نقدية أو إلكترونية للطالب حتى الآن.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">رقم الإيصال</th>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">المبلغ</th>
                      <th className="p-3">طريقة الدفع</th>
                      <th className="p-3">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {billingLedger.payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono text-slate-500">{p.receiptNumber}</td>
                        <td className="p-3 text-slate-600">{p.paymentDate}</td>
                        <td className="p-3 font-black text-emerald-700">+{p.amount} ج.م</td>
                        <td className="p-3 text-slate-700">
                          {p.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                           p.paymentMethod === 'bank_transfer' ? 'انستاباي' : 'نقداً'}
                        </td>
                        <td className="p-3 text-slate-500">{p.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Payment Modal for this Student */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                تسجيل دفعة سداد لـ {student?.name}
              </h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordStudentPay} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المدفوع (ج.م)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cash">نقداً (كاش)</option>
                  <option value="vodafone_cash">فودافون كاش / محفظة</option>
                  <option value="bank_transfer">انستاباي / تحويل بنكي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات</label>
                <input
                  type="text"
                  placeholder="ملاحظات اختيارية..."
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingPay}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {submittingPay ? 'جاري الحفظ...' : 'تأكيد وحفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

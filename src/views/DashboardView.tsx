import React, { useState, useEffect } from 'react';
import {
  Users2,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  Award,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  Plus,
  QrCode,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

interface DashboardViewProps {
  onNavigate: (tab: string, extra?: any) => void;
  onOpenLessonPrep: (lessonId: string, title: string, subject: string) => void;
  onOpenAddStudent: () => void;
  onOpenAttendance: (groupId?: string) => void;
  onSelectStudent: (studentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenLessonPrep,
  onOpenAddStudent,
  onOpenAttendance,
  onSelectStudent
}) => {
  const { user, teacher } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  const fetchSummary = async () => {
    setLoading(true);
    const res = await apiRequest('/teacher/dashboard-summary');
    setLoading(false);
    if (res.success && res.data) {
      setSummary(res.data);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading && !summary) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        جاري تحميل مؤشرات الأداء والجدول...
      </div>
    );
  }

  const {
    totalGroupsCount = 0,
    totalStudentsCount = 0,
    todayLessonsCount = 0,
    todayAttendance = { present: 0, absent: 0, late: 0, total: 0 },
    performance = { averageAttendance: 100, averageExams: 0, improvingCount: 0, strugglingCount: 0 },
    upcomingLessons = [],
    strugglingStudentsList = [],
    attendanceTrend = []
  } = summary || {};

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-emerald-700 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مساعدك التربوي جاهز للعمل</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            أهلاً بك، {user?.name || 'أستاذنا الفاضل'} 👋
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
            لديك اليوم <span className="font-extrabold text-white">{todayLessonsCount} حصص مجدولة</span>، و<span className="font-extrabold text-white">{totalStudentsCount} طالب</span> موزعين على <span className="font-extrabold text-white">{totalGroupsCount} مجموعات</span> في مادة {teacher?.subject || 'التدريس'}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('attendance')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-700" />
            <span>تحضير حصة الآن</span>
          </button>
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-white border border-emerald-300/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>مساعد الذكاء الاصطناعي</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي الطلاب</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalStudentsCount}</span>
            <span className="text-[11px] text-emerald-600 font-bold">طالب مسجل</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">موزعين على {totalGroupsCount} مجموعات نشطة</p>
        </div>

        {/* Avg Attendance */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">متوسط الحضور العام</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{performance.averageAttendance}%</span>
            <span className="text-[11px] text-teal-600 font-bold">نسبة انضباط ممتازة</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">خلال الشهر الدراسي الحالي</p>
        </div>

        {/* Avg Exam Scores */}
        <div
          onClick={() => onNavigate('exams')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">متوسط درجات الاختبارات</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{performance.averageExams}%</span>
            <span className="text-[11px] text-blue-600 font-bold">مستوى عام</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{performance.improvingCount} طالب في مسار تصاعدي</p>
        </div>

        {/* Struggling Students Alert */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">يحتاجون متابعة وتدعيم</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${
              performance.strugglingCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{performance.strugglingCount}</span>
            <span className={`text-[11px] font-bold ${performance.strugglingCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              طلاب يحتاجون تركيزاً
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">بسبب الغياب أو صعوبة في المفاهيم</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today & Upcoming Lessons + Attendance Trend */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Lessons Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">جدول الحصص القادمة اليومية</h3>
              </div>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>عرض الجدول الأسبوعي</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {(!upcomingLessons || upcomingLessons.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                لا توجد حصص مجدولة حالياً. يمكنك إضافة حصص جديدة من صفحة الجدول.
              </div>
            ) : (
              <div className="space-y-3">
                {(upcomingLessons || []).map((lesson: any) => (
                  <div
                    key={lesson.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex flex-col items-center justify-center text-xs shrink-0">
                        <span>{lesson.startTime}</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900">{lesson.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">{lesson.groupName}</span>
                          <span>•</span>
                          <span>{lesson.studentCount || 0} طالب</span>
                          <span>•</span>
                          <span>{lesson.location || 'سنتر'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => onOpenLessonPrep(lesson.id, lesson.title, lesson.subject)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          lesson.hasPreparation
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lesson.hasPreparation ? 'عرض التحضير' : 'تحضير AI'}</span>
                      </button>

                      <button
                        onClick={() => onOpenAttendance(lesson.groupId)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>رصد الحضور</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Attendance Trend Visualizer */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-sm text-slate-900">معدل التزام وحضور الطلاب الأسبوعي</h3>
              </div>
              <span className="text-[11px] text-slate-400">آخر 6 أيام عمل</span>
            </div>

            <div className="grid grid-cols-6 gap-2 pt-2">
              {(attendanceTrend || []).map((item: any, idx: number) => (
                <div key={idx} className="text-center space-y-2">
                  <div className="h-28 bg-slate-50 rounded-xl p-1 flex flex-col justify-end items-center">
                    <div
                      style={{ height: `${item.rate}%` }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-lg transition-all"
                      title={`${item.day}: ${item.rate}%`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 block">{item.day}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">{item.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Struggling Students & Quick Toolkit */}
        <div className="space-y-6">
          {/* Struggling Students / At-Risk List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-sm text-slate-900">تنبيهات المتابعة والتدعيم</h3>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                {(strugglingStudentsList || []).length} طلاب
              </span>
            </div>

            {(!strugglingStudentsList || strugglingStudentsList.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                جميع الطلاب ملتزمون وبحالة جيدة ومستقرة ✨
              </div>
            ) : (
              <div className="space-y-2.5">
                {(strugglingStudentsList || []).map((student: any) => (
                  <div
                    key={student.id}
                    onClick={() => onSelectStudent(student.id)}
                    className="p-3 bg-amber-50/50 hover:bg-amber-50 border border-amber-200/70 rounded-2xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{student.name}</h4>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                        متوسط {student.examsAverage}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {student.groupName}
                      {student.consecutiveAbsences > 0 && ` • غياب متكرر (${student.consecutiveAbsences} حصص)`}
                    </p>
                    {student.reviewNeeds?.length > 0 && (
                      <div className="mt-2 text-[10px] text-amber-900 bg-white/80 p-1.5 rounded-lg border border-amber-200/60">
                        يحتاج مراجعة: {student.reviewNeeds.join('، ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Teacher Shortcuts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 mb-2">إجراءات سريعة</h3>

            <button
              onClick={onOpenAddStudent}
              className="w-full p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:text-emerald-900 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span>إضافة طالب جديد للمجموعة</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
            </button>

            <button
              onClick={() => onNavigate('groups')}
              className="w-full p-3 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:text-teal-900 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Users2 className="w-4 h-4" />
                </div>
                <span>رموز المجموعات ورموز الـ QR</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-teal-700" />
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="w-full p-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:text-blue-900 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span>تصدير كشوفات الإكسل والطباعة</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Users2,
  Award,
  ClipboardCheck,
  GraduationCap,
  Calendar,
  Sparkles,
  Check
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { exportToCsv, printDocument } from '../lib/exportUtils.js';
import { Group, Student } from '../types.js';

export const ReportsView: React.FC = () => {
  const { showToast } = useToast();
  const [reportType, setReportType] = useState<'attendance' | 'grades' | 'comprehensive'>('comprehensive');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<Group[]>('/groups'),
      apiRequest<any[]>('/students')
    ]).then(([grRes, stRes]) => {
      setLoading(false);
      if (grRes.success && grRes.data) setGroups(grRes.data);
      if (stRes.success && stRes.data) setStudents(stRes.data);
    });
  }, []);

  const filteredStudents = selectedGroupId === 'all'
    ? students
    : students.filter(s => s.groupId === selectedGroupId);

  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      showToast('لا توجد بيانات للتصدير.', 'info');
      return;
    }

    let headers: string[] = [];
    let rows: any[][] = [];
    const dateStr = new Date().toISOString().split('T')[0];

    if (reportType === 'attendance') {
      headers = ['اسم الطالب', 'المجموعة', 'نسبة الحضور', 'مرات الغياب المتتالي', 'رقم ولي الأمر'];
      rows = filteredStudents.map(s => [
        s.name,
        s.groupName || '-',
        `${s.attendanceRate ?? 100}%`,
        s.consecutiveAbsences || 0,
        s.parentPhone || '-'
      ]);
    } else if (reportType === 'grades') {
      headers = ['اسم الطالب', 'المجموعة', 'متوسط الاختبارات', 'مستوى التحصيل', 'رقم ولي الأمر'];
      rows = filteredStudents.map(s => [
        s.name,
        s.groupName || '-',
        `${s.examsAverage ?? 0}%`,
        s.performanceLevel || 'مستقر',
        s.parentPhone || '-'
      ]);
    } else {
      headers = ['اسم الطالب', 'المجموعة', 'نسبة الحضور', 'متوسط الاختبارات', 'نسبة الواجبات', 'المستوى العام', 'اسم ولي الأمر', 'هاتف ولي الأمر'];
      rows = filteredStudents.map(s => [
        s.name,
        s.groupName || '-',
        `${s.attendanceRate ?? 100}%`,
        `${s.examsAverage ?? 0}%`,
        `${s.homeworkCompletionRate ?? 100}%`,
        s.performanceLevel || 'مستقر',
        s.parentName || '-',
        s.parentPhone || '-'
      ]);
    }

    exportToCsv(`تقرير_معين_${reportType}_${dateStr}`, headers, rows);
    showToast('تم تصدير كشف الإكسل بنجاح (Excel CSV مع دعم UTF-8 العربي)!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">مركز التقارير والكشوفات الرسمية</h2>
            <p className="text-xs text-slate-500">تصدير تقارير مهنية جاهزة للطباعة بصيغة PDF وجداول Excel</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={printDocument}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة التقرير / PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تنزيل ملف إكسل</span>
          </button>
        </div>
      </div>

      {/* Control Panel Filter */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Report Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">نوع التقرير:</span>
          <div className="inline-flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setReportType('comprehensive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportType === 'comprehensive'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              التقرير الشامل
            </button>
            <button
              onClick={() => setReportType('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportType === 'attendance'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كشف الحضور والغياب
            </button>
            <button
              onClick={() => setReportType('grades')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportType === 'grades'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كشف نتائج الاختبارات
            </button>
          </div>
        </div>

        {/* Group Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-700">تصفية المجموعة:</span>
          <select
            value={selectedGroupId}
            onChange={e => setSelectedGroupId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">جميع المجموعات الدراسية</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Sheet Layout */}
      <div id="printable-report" className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
        {/* Printable Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
              مُ
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">منصة مُعين — التقرير الأكاديمي الدوري</h3>
              <p className="text-xs text-slate-500">
                {reportType === 'comprehensive' ? 'تقرير الأداء الشامل للطلاب' : reportType === 'attendance' ? 'تقرير التزام وانضباط الحضور' : 'تقرير نتائج واختبارات الطلاب'}
              </p>
            </div>
          </div>

          <div className="text-left text-xs text-slate-500 font-mono">
            <div>تاريخ الاستخراج: {new Date().toISOString().split('T')[0]}</div>
            <div>إجمالي المسجلين: {filteredStudents.length} طالب</div>
          </div>
        </div>

        {/* Report Content Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">جاري إعداد التقرير...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">لا توجد بيانات متاحة لهذا التقرير.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3">اسم الطالب</th>
                  <th className="py-3 px-3">المجموعة</th>
                  <th className="py-3 px-3 text-center">نسبة الحضور</th>
                  <th className="py-3 px-3 text-center">متوسط الاختبارات</th>
                  <th className="py-3 px-3 text-center">نسبة الواجبات</th>
                  <th className="py-3 px-3">ولي الأمر</th>
                  <th className="py-3 px-3 text-center">الحالة العامة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3 px-3 text-slate-600">{s.groupName || '-'}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700">
                      {s.attendanceRate ?? 100}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-blue-700">
                      {s.examsAverage ?? 0}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-purple-700">
                      {s.homeworkCompletionRate ?? 100}%
                    </td>
                    <td className="py-3 px-3">
                      <span className="block font-medium text-slate-800">{s.parentName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{s.parentPhone}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.performanceLevel === 'top'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.performanceLevel === 'improving'
                          ? 'bg-teal-100 text-teal-800'
                          : s.performanceLevel === 'struggling'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {s.performanceLevel === 'top' ? 'متميز' : s.performanceLevel === 'improving' ? 'في تحسن' : s.performanceLevel === 'struggling' ? 'يحتاج متابعة' : 'مستقر'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Printable Footer Stamp */}
        <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>توقيع المعلم المسؤول: __________________</span>
          </div>
          <div>
            <span>ختم الإدارة / السنتر: __________________</span>
          </div>
        </div>
      </div>
    </div>
  );
};

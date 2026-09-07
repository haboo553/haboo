import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Save,
  CheckCheck,
  AlertTriangle,
  UserCheck,
  Calendar
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { Group, Student, AttendanceRecord } from '../types.js';

interface AttendanceViewProps {
  initialGroupId?: string;
  onOpenQrModal: (groupName: string, groupCode: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  initialGroupId,
  onOpenQrModal
}) => {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialGroupId) {
      setSelectedGroupId(initialGroupId);
    }
  }, [initialGroupId]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; note: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch groups
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

  // Fetch group students and existing attendance
  useEffect(() => {
    if (!selectedGroupId) return;

    setLoading(true);
    Promise.all([
      apiRequest<Student[]>(`/students?groupId=${selectedGroupId}`),
      apiRequest<AttendanceRecord[]>(`/attendance?groupId=${selectedGroupId}&date=${date}`)
    ]).then(([stRes, attRes]) => {
      setLoading(false);
      if (stRes.success && stRes.data) {
        setStudents(stRes.data);

        // Build attendance map
        const map: Record<string, { status: any; note: string }> = {};
        const existingRecords = attRes.data || [];

        stRes.data.forEach(s => {
          const record = existingRecords.find(r => r.studentId === s.id);
          if (record) {
            map[s.id] = { status: record.status, note: record.note || '' };
          } else {
            // Default to present
            map[s.id] = { status: 'present', note: '' };
          }
        });

        setAttendanceMap(map);
      }
    });
  }, [selectedGroupId, date]);

  const setAllStatus = (status: 'present' | 'absent') => {
    const nextMap = { ...attendanceMap };
    students.forEach(s => {
      nextMap[s.id] = { ...nextMap[s.id], status };
    });
    setAttendanceMap(nextMap);
    showToast(`تم تحديد جميع الطلاب كـ ${status === 'present' ? 'حاضرين' : 'غائبين'}.`, 'info');
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note }
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedGroupId || students.length === 0) return;

    setSaving(true);
    const records = students.map(s => ({
      studentId: s.id,
      status: attendanceMap[s.id]?.status || 'present',
      note: attendanceMap[s.id]?.note || '',
      method: 'bulk'
    }));

    const res = await apiRequest('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({
        groupId: selectedGroupId,
        date,
        records
      })
    });

    setSaving(false);
    if (res.success) {
      showToast('تم حفظ سجل الحضور وتحديث مؤشرات الطلاب بنجاح!', 'success');
    } else {
      showToast(res.error || 'تعذر حفظ الحضور.', 'error');
    }
  };

  const currentGroup = groups.find(g => g.id === selectedGroupId);

  const presentCount = Object.values(attendanceMap).filter((v: any) => v?.status === 'present').length;
  const absentCount = Object.values(attendanceMap).filter((v: any) => v?.status === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter((v: any) => v?.status === 'late').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">رصد الحضور والغياب اليومي</h2>
            <p className="text-xs text-slate-500">تحضير سريع للفصول، تسجيل التأخير، وتنبيهات الغياب المتكرر</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Group Selector */}
          <select
            value={selectedGroupId}
            onChange={e => setSelectedGroupId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.subject})</option>
            ))}
          </select>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-transparent font-mono font-bold text-slate-800 outline-none"
            />
          </div>

          {currentGroup && (
            <button
              onClick={() => onOpenQrModal(currentGroup.name, currentGroup.groupCode)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>كود الـ QR</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Counters & Fast Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>حاضر: {presentCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>غائب: {absentCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>متأخر: {lateCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setAllStatus('present')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>تحديد الكل حاضر</span>
          </button>
          <button
            onClick={() => setAllStatus('absent')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>تحديد الكل غائب</span>
          </button>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">جاري تحميل قائمة الطلاب...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لا يوجد طلاب مسجلين في هذه المجموعة حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">اسم الطالب</th>
                  <th className="py-3.5 px-4 text-center">نسبة الحضور التراكمية</th>
                  <th className="py-3.5 px-4 text-center">حالة الحضور اليوم</th>
                  <th className="py-3.5 px-4">ملاحظة الحصة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student, idx) => {
                  const current = attendanceMap[student.id] || { status: 'present', note: '' };
                  const isConsecutiveAbsent = (student.consecutiveAbsences || 0) >= 2;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{student.name}</span>
                          {isConsecutiveAbsent && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>غياب متكرر ({student.consecutiveAbsences} حصص)</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                        {student.attendanceRate ?? 100}%
                      </td>

                      {/* Status Selector Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              current.status === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            حاضر
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'late')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              current.status === 'late'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            متأخر
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              current.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            غائب
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          value={current.note}
                          onChange={e => handleNoteChange(student.id, e.target.value)}
                          placeholder="ملاحظة خاصة بالحضور..."
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-emerald-600"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Save Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            يتم تحديث نسب الحضور والغياب في ملف كل طالب تلقائياً فور الحفظ.
          </p>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ كشف الحضور'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

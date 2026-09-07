import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Sparkles,
  ClipboardCheck,
  Trash2,
  Edit,
  X,
  Check
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { ConfirmationModal } from '../components/ConfirmationModal.js';
import { Lesson, Group } from '../types.js';

interface ScheduleViewProps {
  onOpenLessonPrep: (lessonId: string, title: string, subject: string) => void;
  onOpenAttendance: (groupId: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  onOpenLessonPrep,
  onOpenAttendance
}) => {
  const { showToast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Confirmation Modal
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);

  // New Lesson Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [groupId, setGroupId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayOfWeek, setDayOfWeek] = useState('sat');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:30');
  const [location, setLocation] = useState('سنتر تعليمي');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [lessonsRes, groupsRes] = await Promise.all([
      apiRequest<Lesson[]>('/lessons'),
      apiRequest<Group[]>('/groups')
    ]);
    setLoading(false);

    if (lessonsRes.success && lessonsRes.data) {
      setLessons(lessonsRes.data);
    }
    if (groupsRes.success && groupsRes.data) {
      setGroups(groupsRes.data);
      if (groupsRes.data.length > 0 && !groupId) {
        setGroupId(groupsRes.data[0].id);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !title || !date) {
      showToast('يرجى ملء جميع الحقول المطلوبة.', 'error');
      return;
    }

    setSubmitting(true);
    const selGroup = groups.find(g => g.id === groupId);
    const res = await apiRequest('/lessons', {
      method: 'POST',
      body: JSON.stringify({
        groupId,
        title,
        subject: selGroup?.subject || 'المادة',
        date,
        dayOfWeek,
        startTime,
        endTime,
        location,
        notes
      })
    });

    setSubmitting(false);
    if (res.success) {
      showToast('تمت إضافة الحصة بنجاح!', 'success');
      setModalOpen(false);
      setTitle('');
      fetchData();
    } else {
      showToast(res.error || 'فشل إنشاء الحصة.', 'error');
    }
  };

  const confirmDeleteLesson = async () => {
    if (!deleteLessonId) return;
    const id = deleteLessonId;
    setDeleteLessonId(null);
    const res = await apiRequest(`/lessons/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('تم حذف الحصة بنجاح.', 'success');
      setLessons(prev => prev.filter(l => l.id !== id));
    } else {
      showToast('تعذر حذف الحصة.', 'error');
    }
  };

  const filteredLessons = (lessons || []).filter(l => 
    selectedGroupId === 'all' || l.groupId === selectedGroupId
  );

  const daysMap = [
    { key: 'sat', label: 'السبت' },
    { key: 'sun', label: 'الأحد' },
    { key: 'mon', label: 'الاثنين' },
    { key: 'tue', label: 'الثلاثاء' },
    { key: 'wed', label: 'الأربعاء' },
    { key: 'thu', label: 'الخميس' },
    { key: 'fri', label: 'الجمعة' }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">الجدول الزمني ومواعيد الحصص</h2>
            <p className="text-xs text-slate-500">تنظيم مواعيد الفصول، التحضير المسبق، وتسجيل الحضور اليومي</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedGroupId}
            onChange={e => setSelectedGroupId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">جميع المجموعات ({(groups || []).length})</option>
            {(groups || []).map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حصة</span>
          </button>
        </div>
      </div>

      {/* Days & Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daysMap.map(day => {
          const dayLessons = filteredLessons.filter(l => l.dayOfWeek === day.key);
          return (
            <div
              key={day.key}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <h3 className="font-extrabold text-sm text-slate-900">يوم {day.label}</h3>
                  </div>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                    {dayLessons.length} حصص
                  </span>
                </div>

                {dayLessons.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    لا توجد حصص مجدولة لهذا اليوم
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(dayLessons || []).map(lesson => (
                      <div
                        key={lesson.id}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                              {lesson.title}
                            </h4>
                            <span className="text-[11px] text-emerald-800 font-bold block mt-0.5">
                              {lesson.groupName}
                            </span>
                          </div>
                          <button
                            onClick={() => setDeleteLessonId(lesson.id)}
                            className="p-1 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                            title="حذف الحصة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {lesson.startTime} - {lesson.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {lesson.location || 'سنتر'}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                          <button
                            onClick={() => onOpenLessonPrep(lesson.id, lesson.title, lesson.subject)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                              lesson.hasPreparation
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>{lesson.hasPreparation ? 'التحضير جاهز' : 'تحضير AI'}</span>
                          </button>

                          <button
                            onClick={() => onOpenAttendance(lesson.groupId)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <ClipboardCheck className="w-3 h-3" />
                            <span>تحضير</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lesson Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">إضافة موعد حصة دراسية جديدة</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLesson} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المجموعة المستهدفة</label>
                <select
                  required
                  value={groupId}
                  onChange={e => setGroupId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.subject})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان موضوع الحصة</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: نظرية ذات الحدين وتطبيقاتها"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">يوم الأسبوع</label>
                  <select
                    value={dayOfWeek}
                    onChange={e => setDayOfWeek(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  >
                    {daysMap.map(d => (
                      <option key={d.key} value={d.key}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الحصة</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">وقت البدء</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">وقت الانتهاء</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المكان / القاعة</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="سنتر الأوائل - قاعة 3"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
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
                  {submitting ? 'جاري الحفظ...' : 'حفظ الحصة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Lesson Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteLessonId}
        title="حذف موعد الحصة"
        message="هل أنت متأكد من حذف هذه الحصة من الجدول؟ سيتم إلغاء سجلات التحضير المرتبطة بها."
        confirmText="نعم، احذف الحصة"
        cancelText="تراجع"
        isDestructive={true}
        onConfirm={confirmDeleteLesson}
        onCancel={() => setDeleteLessonId(null)}
      />
    </div>
  );
};

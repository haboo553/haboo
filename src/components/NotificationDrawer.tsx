import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, AlertCircle, Info, Calendar, Sparkles } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { NotificationItem } from '../types.js';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (link?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = () => {
    setLoading(true);
    apiRequest<NotificationItem[]>('/notifications').then(res => {
      setLoading(false);
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const markAllRead = () => {
    apiRequest('/notifications/read-all', { method: 'POST' }).then(res => {
      if (res.success) {
        setNotifications(prev => (prev || []).map(n => ({ ...n, read: true })));
      }
    });
  };

  const markSingleRead = (id: string, link?: string) => {
    apiRequest(`/notifications/${id}/read`, { method: 'POST' }).then(() => {
      setNotifications(prev => (prev || []).map(n => n.id === id ? { ...n, read: true } : n));
      if (link) {
        onNavigate(link);
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'absence_alert': return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'exam_reminder': return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'homework_due': return <Info className="w-4 h-4 text-blue-600" />;
      case 'ai_suggestion': return <Sparkles className="w-4 h-4 text-emerald-600" />;
      default: return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-r border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">مركز التنبيهات والإشعارات</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              title="تحديد الكل كمقروء"
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 text-xs flex items-center gap-1 font-medium transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">قراءة الكل</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading && (
            <div className="p-8 text-center text-xs text-slate-400">جاري تحميل الإشعارات...</div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-xs text-slate-700">لا توجد إشعارات جديدة</h4>
              <p className="text-[11px] text-slate-400 mt-1">ستصلك التنبيهات حول غياب الطلاب والاختبارات والتذكيرات هنا</p>
            </div>
          )}

          {!loading && (notifications || []).map(notif => (
            <div
              key={notif.id}
              onClick={() => markSingleRead(notif.id, notif.link)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                notif.read
                  ? 'bg-white border-slate-200/80 text-slate-600 opacity-80'
                  : 'bg-emerald-50/60 border-emerald-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-bold text-xs truncate">{notif.title}</h5>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    {new Date(notif.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

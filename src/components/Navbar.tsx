import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  Plus,
  Crown,
  Calendar,
  UserCheck,
  CheckCircle2,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { apiRequest } from '../lib/api.js';
import { NotificationItem } from '../types.js';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenUpgrade: () => void;
  onQuickAction?: (action: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeTab,
  onOpenSearch,
  onOpenNotifications,
  onOpenUpgrade,
  onQuickAction,
  onToggleMobileMenu
}) => {
  const { user, subscription, planConfig, isTrialExpired } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const effectiveTab = activeTab || currentTab || 'dashboard';

  useEffect(() => {
    if (user) {
      apiRequest<NotificationItem[]>('/notifications').then(res => {
        if (res.success && res.data) {
          const unread = res.data.filter(n => !n.read).length;
          setUnreadCount(unread);
        }
      });
    }
  }, [user, effectiveTab]);

  const getPageTitle = () => {
    switch (effectiveTab) {
      case 'dashboard': return 'لوحة التحكم الرئيسية';
      case 'schedule': return 'الجدول الزمني والحصص';
      case 'groups': return 'إدارة المجموعات الدراسية';
      case 'students': return 'شؤون الطلاب وقوائم الفصول';
      case 'student-profile': return 'الملف الأكاديمي للطالب';
      case 'attendance': return 'رصد الحضور والغياب اليومي';
      case 'exams': return 'الاختبارات ورصد الدرجات';
      case 'homework': return 'الواجبات والتطبيقات المنزلية';
      case 'evaluations': return 'تقييم الأداء والمستوى التراكمي';
      case 'reports': return 'التقارير الشاملة والإحصاءات';
      case 'ai-assistant': return 'المساعد الذكي للمدرس (AI Assistant)';
      case 'subscription': return 'إدارة الباقات والاشتراك';
      case 'settings': return 'إعدادات الحساب والتطبيق';
      case 'admin-dashboard': return 'لوحة إدارة المنصة (Super Admin)';
      case 'admin-teachers': return 'إدارة المدرسين والمشتركين';
      case 'admin-plans': return 'إدارة الباقات والأسعار';
      case 'admin-logs': return 'سجلات النظام والأمان';
      default: return 'منصة مُعين';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Right Side: Mobile menu trigger + View title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-extrabold text-sm md:text-base text-slate-900 tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
          </p>
        </div>
      </div>

      {/* Center/Left: Search Bar + Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-slate-500 rounded-xl text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">بحث سريع عن طالب، مجموعة، حصة...</span>
          <span className="sm:hidden">بحث</span>
          <kbd className="hidden md:inline-block text-[10px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-300 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Quick AI Lesson Prep */}
        {user?.role === 'teacher' && onQuickAction && (
          <button
            onClick={() => onQuickAction('ai-prep')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تحضير درس AI</span>
          </button>
        )}

        {/* Quick Add Student */}
        {user?.role === 'teacher' && onQuickAction && (
          <button
            onClick={() => onQuickAction('add-student')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة طالب</span>
          </button>
        )}

        {/* Upgrade / Plan Status */}
        {user?.role === 'teacher' && (
          <button
            onClick={onOpenUpgrade}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isTrialExpired
                ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">
              {isTrialExpired ? 'انتهت التجربة - ترقية' : planConfig?.nameAr || 'الباقة'}
            </span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="الإشعارات"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

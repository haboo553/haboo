import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users2,
  GraduationCap,
  ClipboardCheck,
  Award,
  BookOpenCheck,
  FileBarChart,
  Sparkles,
  Settings,
  ShieldAlert,
  CreditCard,
  LogOut,
  X,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenUpgrade: () => void;
}

interface DrawerNavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigate,
  onOpenUpgrade
}) => {
  const { user, teacher, subscriptionStatus, planConfig, logout } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  if (!isOpen) return null;

  const teacherNavItems: DrawerNavItem[] = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'schedule', label: 'الجدول والحصص', icon: Calendar },
    { id: 'groups', label: 'المجموعات الدراسية', icon: Users2 },
    { id: 'students', label: 'شؤون وقوائم الطلاب', icon: GraduationCap },
    { id: 'attendance', label: 'رصد الحضور والغياب', icon: ClipboardCheck },
    { id: 'financial', label: 'حسابات الحصص والمالية', icon: CreditCard, badge: 'محاسبة' },
    { id: 'exams', label: 'الاختبارات والدرجات', icon: Award },
    { id: 'homework', label: 'الواجبات والمهام', icon: BookOpenCheck },
    { id: 'evaluations', label: 'تقييم أداء الطلاب', icon: Award },
    { id: 'reports', label: 'التقارير والإحصائيات', icon: FileBarChart },
    { id: 'ai-assistant', label: 'مساعد AI الذكي', icon: Sparkles, badge: 'جديد' }
  ];

  const adminNavItems: DrawerNavItem[] = [
    { id: 'admin-dashboard', label: 'لوحة تحكم المنصة', icon: ShieldAlert },
    { id: 'admin-teachers', label: 'إدارة المدرسين', icon: GraduationCap },
    { id: 'admin-plans', label: 'الباقات والاشتراكات', icon: CreditCard },
    { id: 'admin-logs', label: 'سجلات النظام والأمان', icon: FileBarChart }
  ];

  const navItems = isAdmin ? adminNavItems : teacherNavItems;

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-in Drawer (RTL: right side) */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              مُ
            </div>
            <div>
              <span className="font-black text-base text-slate-900 tracking-tight">مُـعـيـن</span>
              <p className="text-[10px] text-slate-500 font-medium">المساعد الذكي للمدرس</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 my-2 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0">
              {user?.name ? user.name.charAt(0) : 'م'}
            </div>
            <div className="overflow-hidden flex-1">
              <h4 className="font-bold text-xs text-slate-900 truncate">{user?.name || 'مستخدم'}</h4>
              <p className="text-[11px] text-slate-500 truncate">{isAdmin ? 'مدير المنصة' : teacher?.subject || 'مدرس'}</p>
            </div>
          </div>

          {isTeacher && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-600 font-medium">
                {subscriptionStatus?.status === 'trial'
                  ? `تجربة (${subscriptionStatus?.daysRemaining} يوم)`
                  : subscriptionStatus?.status === 'expired'
                  ? 'انتهت الصلاحية'
                  : `باقة ${planConfig?.nameAr || 'المحترف'}`}
              </span>
              <button
                onClick={() => {
                  onOpenUpgrade();
                  onClose();
                }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                  subscriptionStatus?.isExpired
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {subscriptionStatus?.isExpired ? 'تجديد' : 'ترقية'}
              </button>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 px-3 py-1">أقسام المنظومة</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-200/80 space-y-1 bg-slate-50/50">
          <button
            onClick={() => handleItemClick('subscription')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'subscription' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>الاشتراك والباقات</span>
          </button>
          <button
            onClick={() => handleItemClick('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'settings' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>الإعدادات والخصوصية</span>
          </button>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
};

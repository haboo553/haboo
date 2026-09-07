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
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  openUpgradeModal?: () => void;
  onOpenUpgrade?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  activeTab,
  setCurrentTab,
  onNavigate,
  openUpgradeModal,
  onOpenUpgrade
}) => {
  const active = activeTab || currentTab || 'dashboard';
  const navigate = onNavigate || setCurrentTab || (() => {});
  const handleUpgrade = onOpenUpgrade || openUpgradeModal || (() => {});
  const { user, teacher, subscription, subscriptionStatus, planConfig, logout } = useAuth();

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
  }

  const teacherNavItems: NavItem[] = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'schedule', label: 'الجدول والحصص', icon: Calendar },
    { id: 'groups', label: 'المجموعات', icon: Users2 },
    { id: 'students', label: 'الطلاب', icon: GraduationCap },
    { id: 'attendance', label: 'الحضور والغياب', icon: ClipboardCheck },
    { id: 'financial', label: 'حسابات الحصص والمالية', icon: CreditCard, badge: 'محاسبة' },
    { id: 'exams', label: 'الاختبارات والدرجات', icon: Award },
    { id: 'homework', label: 'الواجبات والمهام', icon: BookOpenCheck },
    { id: 'evaluations', label: 'تقييم الطلاب', icon: Award },
    { id: 'reports', label: 'التقارير والإحصائيات', icon: FileBarChart },
    { id: 'ai-assistant', label: 'مساعد AI الذكي', icon: Sparkles, badge: 'جديد' }
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin-dashboard', label: 'لوحة تحكم المنصة', icon: ShieldAlert },
    { id: 'admin-teachers', label: 'إدارة المدرسين', icon: GraduationCap },
    { id: 'admin-plans', label: 'الباقات والاشتراكات', icon: CreditCard },
    { id: 'admin-logs', label: 'سجلات النظام', icon: FileBarChart }
  ];

  const navItems = isAdmin ? adminNavItems : teacherNavItems;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-l border-slate-200 h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-500/20">
            مُ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">مُـعـيـن</span>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-slate-500">المساعد الذكي للمدرس</p>
          </div>
        </div>
      </div>

      {/* Teacher / Admin Profile Card */}
      <div className="p-4 mx-3 my-2 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200">
            {user?.name ? user.name.charAt(0) : 'م'}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="font-bold text-xs text-slate-900 truncate">{user?.name || 'مستخدم'}</h4>
            <p className="text-[11px] text-slate-500 truncate">{isAdmin ? 'مدير المنصة' : teacher?.subject || 'مدرس'}</p>
          </div>
        </div>

        {/* Subscription Status Pill for Teachers */}
        {isTeacher && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-600 font-medium">
                {subscriptionStatus?.status === 'trial'
                  ? `تجربة مجانية (${subscriptionStatus?.daysRemaining} يوم)`
                  : subscriptionStatus?.status === 'expired'
                  ? 'انتهت الصلاحية'
                  : `باقة ${planConfig?.nameAr || 'المحترف'}`}
              </span>
              <button
                onClick={handleUpgrade}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                  subscriptionStatus?.isExpired
                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    : 'bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-700'
                }`}
              >
                {subscriptionStatus?.isExpired ? 'تجديد' : 'ترقية'}
              </button>
            </div>
            {subscriptionStatus?.isExpired && (
              <p className="text-[10px] text-rose-500 font-bold leading-tight">
                يرجى الترقية لمتابعة إضافة الحصص والذكاء الاصطناعي
              </p>
            )}
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-200/80 space-y-1">
        <button
          onClick={() => navigate('subscription')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
            active === 'subscription'
              ? 'bg-emerald-50 text-emerald-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span>الاشتراك والباقات</span>
        </button>
        <button
          onClick={() => navigate('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
            active === 'settings'
              ? 'bg-emerald-50 text-emerald-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>الإعدادات والخصوصية</span>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

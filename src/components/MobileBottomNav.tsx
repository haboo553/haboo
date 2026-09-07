import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users2,
  GraduationCap,
  ClipboardCheck,
  Sparkles,
  Plus,
  Menu,
  ShieldAlert,
  CreditCard,
  FileBarChart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface MobileBottomNavProps {
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onOpenQuickMenu?: () => void;
  onToggleMenu?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  activeTab,
  setCurrentTab,
  onNavigate,
  onOpenQuickMenu,
  onToggleMenu
}) => {
  const { user } = useAuth();
  const current = activeTab || currentTab || 'dashboard';
  const handleNav = onNavigate || setCurrentTab || (() => {});

  if (user?.role === 'admin') {
    const adminItems = [
      { id: 'admin-dashboard', label: 'الرئيسية', icon: ShieldAlert },
      { id: 'admin-teachers', label: 'المدرسين', icon: GraduationCap },
      { id: 'admin-plans', label: 'الباقات', icon: CreditCard },
      { id: 'admin-logs', label: 'السجلات', icon: FileBarChart }
    ];

    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around z-30 shadow-lg">
        {adminItems.map(item => {
          const Icon = item.icon;
          const active = current === item.id || (current === 'admin' && item.id === 'admin-dashboard');
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                active ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
        {onToggleMenu && (
          <button
            onClick={onToggleMenu}
            className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition-all font-medium"
          >
            <Menu className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] mt-0.5">المزيد</span>
          </button>
        )}
      </div>
    );
  }

  const items = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'schedule', label: 'الجدول', icon: Calendar },
    { id: 'attendance', label: 'التحضير', icon: ClipboardCheck },
    { id: 'students', label: 'الطلاب', icon: GraduationCap }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around z-30 shadow-lg">
      {items.slice(0, 2).map(item => {
        const Icon = item.icon;
        const active = current === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
              active ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Floating Center Action Button */}
      <button
        onClick={() => {
          if (onOpenQuickMenu) {
            onOpenQuickMenu();
          } else {
            handleNav('attendance');
          }
        }}
        className="w-11 h-11 -mt-5 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 border-2 border-white active:scale-95 transition-transform"
        aria-label="إجراء سريع"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {items.slice(2, 3).map(item => {
        const Icon = item.icon;
        const active = current === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
              active ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Menu / All Pages Button */}
      <button
        onClick={() => {
          if (onToggleMenu) {
            onToggleMenu();
          } else {
            handleNav('ai-assistant');
          }
        }}
        className="flex flex-col items-center py-1.5 px-3 rounded-xl transition-all text-slate-500 hover:text-slate-900 font-medium"
      >
        <Menu className="w-5 h-5 text-slate-400" />
        <span className="text-[10px] mt-0.5">الأقسام</span>
      </button>
    </div>
  );
};

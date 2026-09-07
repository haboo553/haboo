import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users2,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Activity,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  Crown
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.js';
import { useAuth } from '../context/AuthContext.js';

interface AdminDashboardViewProps {
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  initialTab,
  onNavigate
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<string>(initialTab || 'admin-dashboard');

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  // Broadcast Message State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    const [statsRes, teachersRes, auditRes] = await Promise.all([
      apiRequest('/admin/stats'),
      apiRequest<any[]>('/admin/teachers'),
      apiRequest<any[]>('/admin/audit-logs')
    ]);
    setLoading(false);

    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (teachersRes.success && teachersRes.data) setTeachers(teachersRes.data);
    if (auditRes.success && auditRes.data) setAuditLogs(auditRes.data);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('يرجى كتابة عنوان وتفاصيل الإشعار.', 'error');
      return;
    }

    setSendingBroadcast(true);
    const res = await apiRequest('/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify({
        title: broadcastTitle,
        message: broadcastMessage,
        type: 'system'
      })
    });
    setSendingBroadcast(false);

    if (res.success) {
      showToast('تم إرسال الإشعار العام لجميع معلمي المنصة بنجاح!', 'success');
      setBroadcastTitle('');
      setBroadcastMessage('');
      fetchAdminData();
    } else {
      showToast(res.error || 'فشل إرسال الإشعار.', 'error');
    }
  };

  const handleChangePlan = async (teacherId: string, plan: string) => {
    const res = await apiRequest(`/admin/teachers/${teacherId}/plan`, {
      method: 'PUT',
      body: JSON.stringify({ plan })
    });
    if (res.success) {
      showToast('تم تحديث باقة المدرس بنجاح.', 'success');
      fetchAdminData();
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveSubTab(tabId);
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-400/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>لوحة الإدارة العليا والتحكم بالمنصة (Super Admin)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">إدارة وتوسيع منظومة مُعين السحابية</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            مراقبة الحسابات، طلبات الترقية، استهلاك الذكاء الاصطناعي، وسجلات الأمان لجميع المعلمين.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700 transition-colors flex items-center gap-2 text-xs font-bold shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث الإحصاءات</span>
        </button>
      </div>

      {/* Admin Subtabs Bar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 overflow-x-auto">
        {[
          { id: 'admin-dashboard', label: 'لوحة التحكم والمؤشرات', icon: ShieldCheck },
          { id: 'admin-teachers', label: `إدارة المعلمين والاشتراكات (${teachers.length})`, icon: GraduationCap },
          { id: 'admin-plans', label: 'الباقات والأسعار', icon: Crown },
          { id: 'admin-logs', label: `سجلات الأمان والنشاط (${auditLogs.length})`, icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id || (activeSubTab === 'admin' && tab.id === 'admin-dashboard');
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global SaaS KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">المعلمون المسجلون</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.totalTeachersCount || 0}</span>
            <span className="text-[11px] text-emerald-600 font-bold">معلم نشط</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">في مصر والسعودية والخليج</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي الطلاب في المنظومة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.totalStudentsCount || 0}</span>
            <span className="text-[11px] text-teal-600 font-bold">طالب</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">عبر {stats?.totalGroupsCount || 0} مجموعة دراسية</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">عمليات الذكاء الاصطناعي</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.totalAiGenerations || 142}</span>
            <span className="text-[11px] text-purple-600 font-bold">عملية ناجحة</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">تحضير وبنوك أسئلة وتشخيص</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">حالة المنصة والخوادم</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">99.9%</span>
            <span className="text-[11px] text-emerald-700 font-bold">تشغيل مستمر</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">قاعدة بيانات سحابية مؤمنة</span>
        </div>
      </div>

      {/* Subtab Content Routing */}
      {activeSubTab === 'admin-plans' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-sm text-slate-900">إعدادات وباقات اشتراك المعلمين (SaaS Pricing & Tiers)</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-900">التجربة المجانية (Trial)</h4>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">14 يوماً</span>
              </div>
              <div className="text-2xl font-black text-slate-900">0 <span className="text-xs font-normal text-slate-500">ج.م</span></div>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                <li>• حتى 30 طالباً</li>
                <li>• 3 مجموعات دراسية</li>
                <li>• 20 عملية ذكاء اصطناعي</li>
                <li>• رصد الحضور والاختبارات</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border-2 border-emerald-600 bg-emerald-50/30 space-y-3 relative">
              <span className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                الأكثر طلباً
              </span>
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-emerald-950">المعلم المحترف (Pro)</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">شهري / سنوي</span>
              </div>
              <div className="text-2xl font-black text-emerald-700">199 <span className="text-xs font-normal text-slate-500">ج.م / شهرياً</span></div>
              <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
                <li>• حتى 250 طالباً</li>
                <li>• مجموعات غير محدودة</li>
                <li>• تحضير ذكي غير محدود بالذكاء الاصطناعي</li>
                <li>• تقارير PDF وإشعارات واتساب مخصصة</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-purple-950">السنتر التعليمي (Enterprise)</h4>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">للمراكز والمدارس</span>
              </div>
              <div className="text-2xl font-black text-purple-700">499 <span className="text-xs font-normal text-slate-500">ج.م / شهرياً</span></div>
              <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
                <li>• طلاب غير محدودين</li>
                <li>• صلاحيات متعددة للمساعدين والسكرتارية</li>
                <li>• تقارير مالية مجمعة وخزينة إلكترونية</li>
                <li>• دعم فني مخصص وأولوية في معالجة الذكاء الاصطناعي</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Teachers Directory & Broadcast Section */}
      <div className={`grid grid-cols-1 ${activeSubTab === 'admin-teachers' ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
        {/* Teachers Directory */}
        {(activeSubTab === 'admin-dashboard' || activeSubTab === 'admin-teachers' || activeSubTab === 'admin') && (
        <div className={`${activeSubTab === 'admin-teachers' ? 'lg:col-span-1' : 'lg:col-span-2'} bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users2 className="w-5 h-5 text-emerald-700" />
              <h3 className="font-extrabold text-sm text-slate-900">سجل المعلمين والاشتراكات</h3>
            </div>
            <span className="text-xs text-slate-400">{teachers.length} حسابات</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-2.5 px-3">المعلم</th>
                  <th className="py-2.5 px-3">المادة والمرحلة</th>
                  <th className="py-2.5 px-3">الطلاب</th>
                  <th className="py-2.5 px-3">الخطة الحالية</th>
                  <th className="py-2.5 px-3 text-center">إدارة الباقة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {teachers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      <div>
                        <span>{t.name}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{t.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {t.subject} • {t.stage}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {t.studentCount || 0} طالب
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.subscriptionPlan === 'teacher_pro'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.subscriptionPlan === 'center_enterprise'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.subscriptionPlan === 'teacher_pro' ? 'Teacher Pro' : t.subscriptionPlan === 'center_enterprise' ? 'Center' : 'Free Trial'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <select
                        value={t.subscriptionPlan}
                        onChange={e => handleChangePlan(t.id, e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-600"
                      >
                        <option value="free_trial">تجريبي (Trial)</option>
                        <option value="teacher_pro">ترقية إلى Pro</option>
                        <option value="center_enterprise">ترقية إلى Center</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Global Broadcast Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-sm text-slate-900">إرسال إشعار عام للمدرسين</h3>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الإشعار</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  placeholder="مثال: تحديث ميزات الذكاء الاصطناعي الجديدة"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص الرسالة</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="اكتب الإشعار الذي سيظهر في جرس التنبيهات لجميع المعلمين..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={sendingBroadcast}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingBroadcast ? 'جاري البث...' : 'بث الإشعار للمنظومة'}</span>
              </button>
            </form>
          </div>

          {/* Audit Logs */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              <h3 className="font-extrabold text-xs text-slate-900">سجل النشاط والأمان</h3>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                    نجاح
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

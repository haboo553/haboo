import React, { useState } from 'react';
import {
  Crown,
  CheckCircle2,
  Zap,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Building,
  Users2,
  Calendar,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

interface SubscriptionViewProps {
  onOpenUpgradeModal: () => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onOpenUpgradeModal }) => {
  const { teacher, subscription, subscriptionStatus, planConfig } = useAuth();
  const { showToast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const currentPlan = planConfig?.id || teacher?.subscriptionPlan || 'free_trial';
  const planName = planConfig?.nameAr || (currentPlan === 'free_trial' ? 'باقة التجربة المجانية' : 'باقة المعلم المحترف');
  const expiryDate = subscription?.trialEndsAt || subscription?.currentPeriodEnd || teacher?.subscriptionExpiry || '2026-10-01';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Active Subscription Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/20">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>خطة الاشتراك الحالية: {planName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {planName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            {subscriptionStatus?.status === 'trial' ? (
              <>متبقي في الفترة التجريبية: <span className="font-bold text-emerald-300">{subscriptionStatus?.daysRemaining} يوم</span> (تنتهي في {expiryDate})</>
            ) : subscriptionStatus?.status === 'expired' ? (
              <span className="text-rose-400 font-bold">انتهت صلاحية باقتك. يرجى التجديد لتفعيل ميزات الذكاء الاصطناعي والإضافة.</span>
            ) : (
              <>الاشتراك نشط حتى <span className="font-bold text-white font-mono">{expiryDate}</span>.</>
            )}
          </p>
        </div>

        <button
          onClick={onOpenUpgradeModal}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>ترقية / تجديد الاشتراك</span>
        </button>
      </div>

      {/* Quota Usage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>سعة الطلاب المستهلكة</span>
            <span className="font-mono text-slate-900">
              {planConfig?.maxStudents === -1 ? 'غير محدود' : `حتى ${planConfig?.maxStudents || 250} طالب`}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-[35%] h-full bg-emerald-600 rounded-full" />
          </div>
          <span className="text-[11px] text-slate-400 block">
            {planConfig?.maxStudents === -1 ? 'إمكانية تسجيل طلاب بلا سقف' : `الحد الأقصى المتاح للباقة: ${planConfig?.maxStudents || 250}`}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>المجموعات المفعلة</span>
            <span className="font-mono text-slate-900">
              {planConfig?.maxGroups === -1 ? 'غير محدود' : `حتى ${planConfig?.maxGroups || 15} مجموعة`}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-[40%] h-full bg-teal-600 rounded-full" />
          </div>
          <span className="text-[11px] text-slate-400 block">
            {planConfig?.maxGroups === -1 ? 'إنشاء مجموعات دراسية وسناتر غير محدودة' : `السعة القصوى: ${planConfig?.maxGroups || 15} مجموعة`}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>رصيد توليد AI الشهري</span>
            <span className="font-mono text-emerald-700 font-bold">
              {subscription?.aiUsageThisMonth || 0} / {planConfig?.maxAiQueriesPerMonth === -1 ? 'غير محدود ✨' : `${planConfig?.maxAiQueriesPerMonth || 150} طلب`}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{
                width: planConfig?.maxAiQueriesPerMonth === -1 ? '100%' : `${Math.min(100, Math.round(((subscription?.aiUsageThisMonth || 0) / (planConfig?.maxAiQueriesPerMonth || 150)) * 100))}%`
              }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block">
            {subscriptionStatus?.canUseAi ? 'الذكاء الاصطناعي متاح ونشط بالكامل' : 'تم استهلاك رصيد الذكاء الاصطناعي الشهري'}
          </span>
        </div>
      </div>

      {/* Pricing Comparison Grid */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-slate-900">باقات الاشتراك والأسعار المعتمدة</h3>
          <p className="text-xs text-slate-500">اختر الخطة المناسبة لحجم فصولك وطلابك</p>

          {/* Cycle Toggle */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 mt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              دفع شهري
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <span>دفع سنوي</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                خصم 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Plan 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500">باقة البداية</span>
              <h4 className="text-lg font-black text-slate-900">المعلم الأساسي (Starter)</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{billingCycle === 'yearly' ? '$9' : '$12'}</span>
                <span className="text-xs text-slate-400">/ شهرياً</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                مثالية للمدرس المبتدئ الذي يدير حتى 50 طالباً ومجموعتين.
              </p>

              <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>حتى 50 طالب و 2 مجموعة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>رصد الحضور والغياب والواجبات</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تصدير تقارير Excel</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenUpgradeModal}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              اختيار هذه الخطة
            </button>
          </div>

          {/* Plan 2: Highlighted */}
          <div className="bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-900 text-white p-6 rounded-3xl border-2 border-emerald-500 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 left-4 bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full">
              الأكثر طلباً ⭐
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-300">باقة الاحتراف والتوسع</span>
              <h4 className="text-lg font-black text-white">المعلم المحترف (Teacher Pro)</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{billingCycle === 'yearly' ? '$19' : '$24'}</span>
                <span className="text-xs text-slate-400">/ شهرياً</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                الباقة المتكاملة لكبار المدرسين مع كافة ميزات الذكاء الاصطناعي بلا حدود.
              </p>

              <ul className="space-y-2 text-xs text-slate-200 pt-3 border-t border-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>حتى 300 طالب و 10 مجموعات</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>توليد غير محدود لخطط الدروس وبنوك الأسئلة (AI)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تسجيل الحضور الذكي برمز الـ QR</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>صياغة رسائل واتساب ذكية ومخصصة لأولياء الأمور</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تقارير PDF الرسمية القابلة للطباعة</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenUpgradeModal}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all"
            >
              الترقية إلى Teacher Pro
            </button>
          </div>

          {/* Plan 3: Center */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500">المراكز التعليمية</span>
              <h4 className="text-lg font-black text-slate-900">السنتر والأكاديمية (Center)</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{billingCycle === 'yearly' ? '$49' : '$59'}</span>
                <span className="text-xs text-slate-400">/ شهرياً</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                مخصصة للسناتر والمراكز ذات المعلمين المتعددين وإدارة الحسابات الشاملة.
              </p>

              <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>عدد غير محدود من الطلاب والمجموعات</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>حسابات متعددة للمساعدين والمشرفين</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>دعم فني مخصص على مدار الساعة</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenUpgradeModal}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              التواصل مع المبيعات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

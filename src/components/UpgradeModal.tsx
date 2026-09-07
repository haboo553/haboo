import React, { useState, useEffect } from 'react';
import { Crown, Check, X, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiRequest } from '../lib/api.js';
import { PlanConfig } from '../types.js';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { subscription, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      apiRequest<PlanConfig[]>('/plans').then(res => {
        if (res.success && res.data) {
          setPlans(res.data);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = async (planId: string) => {
    setLoadingPlanId(planId);
    const res = await apiRequest('/subscriptions/upgrade', {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle })
    });

    setLoadingPlanId(null);
    if (res.success) {
      showToast(res.message || 'تمت الترقية بنجاح!', 'success');
      await refreshUser();
      onClose();
    } else {
      showToast(res.error || 'تعذر إتمام الترقية.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-scale-up">
        {/* Header */}
        <div className="p-6 md:p-8 bg-gradient-to-b from-slate-900 to-slate-800 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>باقات مصممة خصيصاً للمدرس المحترف والسناتر التعليمية</span>
          </div>

          <h2 className="text-xl md:text-2xl font-black">اختر الخطة المناسبة لحجم عملك التدريسي</h2>
          <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
            احصل على عدد غير محدود من الطلاب، التحضير الذكي بالذكاء الاصطناعي، وتقارير PDF تفصيلية لأولياء الأمور
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 inline-flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              دفع شهري
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>دفع سنوي</span>
              <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded font-black">
                وفر 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50">
          {plans.map(plan => {
            const isCurrent = subscription?.plan === plan.id;
            const isPopular = plan.isPopular;
            const price = billingCycle === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                  isPopular
                    ? 'bg-white border-2 border-emerald-600 shadow-xl shadow-emerald-600/10'
                    : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 right-1/2 translate-x-1/2 bg-emerald-600 text-white text-[11px] font-black px-3 py-0.5 rounded-full shadow-sm">
                    الأكثر طلباً بين المدرسين
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-base text-slate-900">{plan.nameAr}</h3>
                    {isPopular ? <Zap className="w-5 h-5 text-emerald-600" /> : <Shield className="w-4 h-4 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{plan.descriptionAr}</p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{price}</span>
                      <span className="text-xs font-bold text-slate-500">{plan.currency} / شهر</span>
                    </div>
                    {billingCycle === 'yearly' && plan.priceYearly > 0 && (
                      <p className="text-[11px] text-emerald-600 font-medium mt-1">
                        تُدفع {plan.priceYearly} {plan.currency} سنوياً
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-6">
                    {(plan.featuresAr || []).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || loadingPlanId === plan.id}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : isPopular
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {loadingPlanId === plan.id ? (
                    <span>جاري التفعيل...</span>
                  ) : isCurrent ? (
                    <span>باقتك الحالية</span>
                  ) : (
                    <span>ترقية إلى {plan.nameAr}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-100 border-t border-slate-200/80 text-center">
          <p className="text-[11px] text-slate-500">
            🔒 دفع آمن مع دعم فني متواصل على مدار الساعة عبر الواتساب. يمكنك إلغاء أو تغيير باقتك في أي وقت.
          </p>
        </div>
      </div>
    </div>
  );
};

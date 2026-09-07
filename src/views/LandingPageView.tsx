import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Users2,
  GraduationCap,
  Calendar,
  Award,
  ArrowLeft,
  Crown,
  ShieldCheck,
  Zap,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

interface LandingPageViewProps {
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onOpenRegister,
  onOpenLogin
}) => {
  const { loginAsDemoTeacher, loginAsDemoAdmin, login, register } = useAuth();
  const { showToast } = useToast();
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register'>('landing');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSubject, setRegSubject] = useState('الرياضيات');
  const [regStage, setRegStage] = useState('المرحلة الثانوية');
  const [regLoading, setRegLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (!res.success) {
      showToast(res.error || 'فشل تسجيل الدخول.', 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    const res = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      subject: regSubject,
      stage: regStage
    });
    setRegLoading(false);
    if (!res.success) {
      showToast(res.error || 'فشل إنشاء الحساب.', 'error');
    } else {
      showToast('مرحباً بك في مُعين! تم تفعيل تجربتك المجانية بنجاح.', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-600/20">
              مُ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">مُـعـيـن</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  المساعد الذكي للمدرس
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setAuthMode('login')}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              ابدأ مجاناً (7 أيام)
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        {authMode === 'landing' && (
          <div className="space-y-16">
            {/* Hero Main */}
            <div className="text-center max-w-3xl mx-auto space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>المنصة السحابية المتكاملة لإدارة التدريس والطلاب بالذكاء الاصطناعي</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.25]">
                تحضير الدروس، رصد الحضور، ومتابعة الطلاب في مكان واحد وبذكاء
              </h1>

              <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
                صُممت منصة <span className="font-bold text-emerald-700">مُعين</span> لتمنح المدرس الحر والمراكز التعليمية في العالم العربي أداة رقمية جادة وعصرية للتخلص من دفاتر الورق، وتحضير الحصص بالذكاء الاصطناعي، وبناء تقارير دورية فورية لأولياء الأمور.
              </p>

              {/* Quick Demo Access Bar */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={loginAsDemoTeacher}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>دخول فوري بحساب مدرس تجريبي (د. أحمد المنشاوي)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={loginAsDemoAdmin}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>دخول لوحة تحكم المنصة (Admin)</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 font-medium">
                ✨ تجربة فورية بدون بطاقة ائتمان • قاعدة بيانات سحابية حقيقية • جاهز للاستخدام الفعلي
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">مساعد التحضير بالذكاء الاصطناعي</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  توليد خطط الدروس النموذجية، الأهداف السلوكية، الأنشطة الصفية، بنوك الأسئلة، وتبسيط المفاهيم المعقدة للمناهج العربية.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">ملف الطالب الأكاديمي الشامل</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تتبع دقيق لنسب الحضور، درجات الاختبارات، إنجاز الواجبات، تقييم الأداء التراكمي، ورصد تنبيهات الغياب المتكرر.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">تقارير PDF وتواصل واتساب فوري</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تصدير تقارير مهنية جاهزة للطباعة بصيغة PDF وExcel، وصياغة رسائل واتساب ذكية ومخصصة لأولياء الأمور بنقرة واحدة.
                </p>
              </div>
            </div>

            {/* Platform Trust Metrics */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-2xl md:text-3xl font-black">منصة صُممت لحل التحديات اليومية للمدرس</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
                    <span className="block text-2xl md:text-3xl font-black text-emerald-400">100%</span>
                    <span className="text-xs text-slate-300 font-medium">عربي بالكامل (RTL)</span>
                  </div>
                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
                    <span className="block text-2xl md:text-3xl font-black text-emerald-400">0</span>
                    <span className="text-xs text-slate-300 font-medium">فقدان في البيانات</span>
                  </div>
                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
                    <span className="block text-2xl md:text-3xl font-black text-emerald-400">QR</span>
                    <span className="text-xs text-slate-300 font-medium">تحضير سريع وذكي</span>
                  </div>
                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
                    <span className="block text-2xl md:text-3xl font-black text-emerald-400">AI</span>
                    <span className="text-xs text-slate-300 font-medium">تحليلات تعليمية آمنة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Card */}
        {authMode === 'login' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-scale-up">
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-slate-900">تسجيل الدخول إلى مُعين</h2>
              <p className="text-xs text-slate-500 mt-1">أدخل بريدك الإلكتروني وكلمة المرور للمتابعة</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="teacher@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{loginLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">ليس لديك حساب؟</span>
                <button
                  onClick={() => setAuthMode('register')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  إنشاء حساب جديد
                </button>
              </div>

              <button
                onClick={loginAsDemoTeacher}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                دخول فوري بحساب المدرس التجريبي
              </button>

              <button
                onClick={() => setAuthMode('landing')}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
          </div>
        )}

        {/* Register Card */}
        {authMode === 'register' && (
          <div className="max-w-lg mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-scale-up">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                <Crown className="w-3.5 h-3.5" />
                <span>تجربة مجانية لمدة 7 أيام مع كافة الميزات</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">إنشاء حساب مدرس جديد</h2>
              <p className="text-xs text-slate-500 mt-1">ابدأ إدارة طلابك وحصصك في أقل من دقيقة</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل للمدرس</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="أ. محمد أحمد"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="teacher@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف / واتساب</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المادة الدراسية الأساسية</label>
                  <input
                    type="text"
                    required
                    value={regSubject}
                    onChange={e => setRegSubject(e.target.value)}
                    placeholder="الرياضيات، الفيزياء، اللغة العربية..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة التعليمية</label>
                  <select
                    value={regStage}
                    onChange={e => setRegStage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
                  >
                    <option value="المرحلة الابتدائية">المرحلة الابتدائية</option>
                    <option value="المرحلة الإعدادية / المتوسطة">المرحلة الإعدادية / المتوسطة</option>
                    <option value="المرحلة الثانوية">المرحلة الثانوية</option>
                    <option value="المرحلة الجامعية">المرحلة الجامعية</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{regLoading ? 'جاري إنشاء الحساب...' : 'بدء التجربة المجانية الفورية'}</span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">لديك حساب بالفعل؟</span>
              <button
                onClick={() => setAuthMode('login')}
                className="font-bold text-emerald-700 hover:underline"
              >
                تسجيل الدخول
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} منصة مُعين — المساعد الذكي للمدرس. جميع الحقوق محفوظة.</p>
        <p className="mt-1 text-[11px] text-slate-400">تطوير احترافي لمنظومة التعليم العربي والسناتر التعليمية</p>
      </footer>
    </div>
  );
};

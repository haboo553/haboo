import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users2,
  Search,
  Filter,
  Plus,
  Send,
  Printer,
  Download,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  FileText,
  MessageSquare,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import {
  fetchTeacherFinancialOverview,
  recordStudentPayment,
  createManualCharge,
  getBillingWhatsAppReminder
} from '../lib/api.js';

interface FinancialDashboardViewProps {
  onSelectStudent?: (studentId: string) => void;
}

export const FinancialDashboardView: React.FC<FinancialDashboardViewProps> = ({ onSelectStudent }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'debtors' | 'payments' | 'charges'>('debtors');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Recording Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    groupId: '',
    amount: '',
    paymentMethod: 'cash',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Manual Charge Modal
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [chargeForm, setChargeForm] = useState({
    studentId: '',
    groupId: '',
    title: 'مذكرة دراسية',
    amountDue: '',
    notes: ''
  });
  const [submittingCharge, setSubmittingCharge] = useState(false);

  // Receipt Modal
  const [receiptData, setReceiptData] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchTeacherFinancialOverview();
      if (res.success) {
        setData(res);
      } else {
        showToast(res.error || 'تعذر جلب البيانات المالية.', 'error');
      }
    } catch {
      showToast('تعذر الاتصال بالخادم.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.studentId || !paymentForm.amount || Number(paymentForm.amount) <= 0) {
      showToast('يرجى تحديد الطالب والمبلغ بشكل صحيح.', 'error');
      return;
    }

    setSubmittingPayment(true);
    const res = await recordStudentPayment({
      studentId: paymentForm.studentId,
      groupId: paymentForm.groupId || undefined,
      amount: Number(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod,
      paymentDate: paymentForm.date,
      notes: paymentForm.notes
    });

    setSubmittingPayment(false);
    if (res.success) {
      showToast('تم تسجيل الدفعة وتحديث حساب الطالب بنجاح!', 'success');
      setShowPaymentModal(false);
      setPaymentForm({
        studentId: '',
        groupId: '',
        amount: '',
        paymentMethod: 'cash',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } else {
      showToast(res.error || 'تعذر تسجيل الدفعة.', 'error');
    }
  };

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeForm.studentId || !chargeForm.amountDue || Number(chargeForm.amountDue) <= 0) {
      showToast('يرجى تعبئة بيانات الرسوم بشكل صحيح.', 'error');
      return;
    }

    setSubmittingCharge(true);
    const res = await createManualCharge({
      studentId: chargeForm.studentId,
      groupId: chargeForm.groupId || undefined,
      title: chargeForm.title,
      amountDue: Number(chargeForm.amountDue),
      notes: chargeForm.notes
    });

    setSubmittingCharge(false);
    if (res.success) {
      showToast('تمت إضافة الرسوم بنجاح!', 'success');
      setShowChargeModal(false);
      setChargeForm({
        studentId: '',
        groupId: '',
        title: 'مذكرة دراسية',
        amountDue: '',
        notes: ''
      });
      loadData();
    } else {
      showToast(res.error || 'تعذر إضافة الرسوم.', 'error');
    }
  };

  const handleSendReminder = async (studentId: string) => {
    const res = await getBillingWhatsAppReminder(studentId);
    if (res.success && res.whatsappUrl) {
      window.open(res.whatsappUrl, '_blank');
      showToast('تم تجهيز رسالة التذكير عبر واتساب!', 'success');
    } else {
      showToast(res.error || 'تعذر إعداد رسالة الواتساب.', 'error');
    }
  };

  const overview = data?.overview || {
    totalBilled: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    collectionRate: 0,
    todayIncome: 0,
    weekIncome: 0,
    monthIncome: 0,
    debtorsCount: 0
  };

  const groups = data?.groups || [];
  const debtors = (data?.debtors || []).filter((d: any) => {
    if (selectedGroupFilter !== 'all' && d.groupId !== selectedGroupFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.studentName?.toLowerCase().includes(q) ||
        d.parentPhone?.includes(q) ||
        d.groupName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const payments = (data?.recentPayments || []).filter((p: any) => {
    if (selectedGroupFilter !== 'all' && p.groupId !== selectedGroupFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.studentName?.toLowerCase().includes(q) ||
        p.groupName?.toLowerCase().includes(q) ||
        p.receiptNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const charges = (data?.recentCharges || []).filter((c: any) => {
    if (selectedGroupFilter !== 'all' && c.groupId !== selectedGroupFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.studentName?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.groupName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500">جاري تحميل البيانات المالية وحسابات الحصص...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="financial-dashboard-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900">
              المالية وحسابات الحصص
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500">
            تتبع مستحقات الحصص، التحصيلات، المديونيات المتأخرة، وإشعارات أولياء الأمور تلقائياً
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-add-manual-charge"
            onClick={() => setShowChargeModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>رسوم / مذكرة</span>
          </button>
          <button
            id="btn-record-payment"
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4" />
            <span>تسجيل دفعة طالب</span>
          </button>
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي المستحقات</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {overview.totalBilled.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">عن كافة الحصص والأنشطة المسجلة</p>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي المحصّل</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-700">
              {overview.totalPaid.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600">ج.م</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[11px] font-bold text-emerald-600">
              نسبة التحصيل: {overview.collectionRate}%
            </span>
          </div>
        </div>

        {/* Outstanding Debt */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">المتبقي المتأخر (المديونيات)</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600">
              {overview.totalOutstanding.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-rose-500">ج.م</span>
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-2">
            لدى {overview.debtorsCount} طالب مطلوب سدادهم
          </p>
        </div>

        {/* Recent Inflow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">تحصيل الشهر الحالي</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {overview.monthIncome.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>اليوم: {overview.todayIncome} ج.م</span>
            <span>الأسبوع: {overview.weekIncome} ج.م</span>
          </div>
        </div>
      </div>

      {/* Filter and Tab Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            id="tab-debtors"
            onClick={() => setActiveTab('debtors')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'debtors'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>الطلاب المتأخرين</span>
            <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-black">
              {debtors.length}
            </span>
          </button>

          <button
            id="tab-payments"
            onClick={() => setActiveTab('payments')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>سجل المقبوضات</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-black">
              {payments.length}
            </span>
          </button>

          <button
            id="tab-charges"
            onClick={() => setActiveTab('charges')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'charges'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>استحقاقات الحصص</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-black">
              {charges.length}
            </span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الرقم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Group Filter */}
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">كافة المجموعات</option>
            {groups.map((g: any) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab 1: Debtors Table */}
      {activeTab === 'debtors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <h3 className="font-extrabold text-sm text-slate-900">
                قائمة الطلاب الذين عليهم مستحقات متأخرة
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              إجمالي المتأخرات في هذه القائمة:{' '}
              <strong className="text-rose-600">
                {debtors.reduce((sum: number, d: any) => sum + (d.outstandingBalance || 0), 0).toLocaleString()} ج.م
              </strong>
            </span>
          </div>

          {debtors.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-slate-900">رائع! لا توجد مديونيات متأخرة</h4>
              <p className="text-xs text-slate-500 mt-1">جميع الطلاب مسددون لكافة استحقاقات الحصص حتى الآن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">اسم الطالب</th>
                    <th className="p-3.5">المجموعة</th>
                    <th className="p-3.5">المبلغ المطلوب</th>
                    <th className="p-3.5">الحصص المستحقة</th>
                    <th className="p-3.5">هاتف ولي الأمر</th>
                    <th className="p-3.5">آخر دفعة</th>
                    <th className="p-3.5 text-center">الإجراءات السريعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {debtors.map((d: any) => (
                    <tr key={d.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        <button
                          onClick={() => onSelectStudent && onSelectStudent(d.studentId)}
                          className="hover:text-emerald-700 transition-colors flex items-center gap-1.5"
                        >
                          <span>{d.studentName}</span>
                          <ArrowUpRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                      <td className="p-3.5 text-slate-600">{d.groupName}</td>
                      <td className="p-3.5">
                        <span className="font-black text-rose-600 text-sm">
                          {d.outstandingBalance} ج.م
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-bold">
                          {d.unpaidItemsCount || 0} حصة
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono" dir="ltr">
                        {d.parentPhone || 'غير مسجل'}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {d.lastPaymentDate || 'لم يسجل سداد'}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="تسجيل دفعة نقدية أو إلكترونية"
                            onClick={() => {
                              setPaymentForm({
                                studentId: d.studentId,
                                groupId: d.groupId || '',
                                amount: String(d.outstandingBalance),
                                paymentMethod: 'cash',
                                notes: 'سداد الحصص المستحقة',
                                date: new Date().toISOString().split('T')[0]
                              });
                              setShowPaymentModal(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            سداد
                          </button>
                          <button
                            title="إرسال تذكير عبر واتساب"
                            onClick={() => handleSendReminder(d.studentId)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>واتساب</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Payments Ledger */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                سجل المقبوضات والتحصيلات النقدية والإلكترونية
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              إجمالي المبالغ المسددة في السجل:{' '}
              <strong className="text-emerald-600">
                {payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0).toLocaleString()} ج.م
              </strong>
            </span>
          </div>

          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-slate-900">لا توجد مقبوضات مسجلة حتى الآن</h4>
              <p className="text-xs text-slate-500 mt-1">اضغط على زر "تسجيل دفعة طالب" لإضافة عملية سداد جديدة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">رقم الإيصال</th>
                    <th className="p-3.5">تاريخ الدفع</th>
                    <th className="p-3.5">اسم الطالب</th>
                    <th className="p-3.5">المجموعة</th>
                    <th className="p-3.5">المبلغ</th>
                    <th className="p-3.5">طريقة الدفع</th>
                    <th className="p-3.5">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono text-slate-500">{p.receiptNumber}</td>
                      <td className="p-3.5 text-slate-700">{p.paymentDate}</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        <button
                          onClick={() => onSelectStudent && onSelectStudent(p.studentId)}
                          className="hover:text-emerald-700 transition-colors"
                        >
                          {p.studentName}
                        </button>
                      </td>
                      <td className="p-3.5 text-slate-600">{p.groupName}</td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          +{p.amount} ج.م
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {p.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                         p.paymentMethod === 'bank_transfer' ? 'انستاباي / تحويل' : 'نقداً (كاش)'}
                      </td>
                      <td className="p-3.5 text-slate-500">{p.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Lesson Billing Charges */}
      {activeTab === 'charges' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                سجل استحقاقات الحصص الصادرة تلقائياً عند تسجيل الحضور
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              إجمالي الاستحقاقات في السجل:{' '}
              <strong className="text-blue-600">
                {charges.reduce((sum: number, c: any) => sum + (c.amountDue || 0), 0).toLocaleString()} ج.م
              </strong>
            </span>
          </div>

          {charges.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-slate-900">لا توجد استحقاقات مسجلة بعد</h4>
              <p className="text-xs text-slate-500 mt-1">يتم إصدار الاستحقاقات آلياً عند تسجيل حضور وغياب الطلاب في الحصص</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">تاريخ الحصة</th>
                    <th className="p-3.5">البند / العنوان</th>
                    <th className="p-3.5">اسم الطالب</th>
                    <th className="p-3.5">المجموعة</th>
                    <th className="p-3.5">المبلغ المستحق</th>
                    <th className="p-3.5">المسدد</th>
                    <th className="p-3.5">حالة السداد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {charges.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 text-slate-700">{c.date}</td>
                      <td className="p-3.5 font-bold text-slate-900">{c.title}</td>
                      <td className="p-3.5 text-slate-800">{c.studentName}</td>
                      <td className="p-3.5 text-slate-600">{c.groupName}</td>
                      <td className="p-3.5 font-bold text-slate-900">{c.amountDue} ج.م</td>
                      <td className="p-3.5 text-emerald-600 font-bold">{c.amountPaid} ج.م</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          c.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'partially_paid'
                            ? 'bg-amber-100 text-amber-800'
                            : c.status === 'waived'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {c.status === 'paid' ? 'مدفوع بالكامل' :
                           c.status === 'partially_paid' ? 'مدفوع جزئياً' :
                           c.status === 'waived' ? 'معفى' : 'غير مدفوع'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Record Student Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </span>
                <h3 className="font-extrabold text-base text-slate-900">تسجيل دفعة سداد جديدة</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر الطالب <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={paymentForm.studentId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    const foundDebtor = debtors.find((d: any) => d.studentId === sId);
                    setPaymentForm(prev => ({
                      ...prev,
                      studentId: sId,
                      groupId: foundDebtor?.groupId || prev.groupId,
                      amount: foundDebtor ? String(foundDebtor.outstandingBalance) : prev.amount
                    }));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- اختر الطالب --</option>
                  {debtors.map((d: any) => (
                    <option key={d.studentId} value={d.studentId}>
                      {d.studentName} ({d.groupName}) - متبقي {d.outstandingBalance} ج.م
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المبلغ المدفوع (ج.م) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="مثلاً: 150"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طريقة السداد</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="cash">نقداً (كاش)</option>
                    <option value="vodafone_cash">فودافون كاش / محفظة</option>
                    <option value="bank_transfer">انستاباي / بنكي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الدفع</label>
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  placeholder="مثلاً: سداد حصة يوم الثلاثاء + مذكرة"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submittingPayment ? 'جاري الحفظ...' : 'تأكيد وحفظ الدفعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Manual Charge */}
      {showChargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <Plus className="w-5 h-5" />
                </span>
                <h3 className="font-extrabold text-base text-slate-900">إضافة رسوم أو مذكرة للطالب</h3>
              </div>
              <button
                onClick={() => setShowChargeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCharge} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر الطالب <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={chargeForm.studentId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    const foundDebtor = debtors.find((d: any) => d.studentId === sId);
                    setChargeForm(prev => ({
                      ...prev,
                      studentId: sId,
                      groupId: foundDebtor?.groupId || prev.groupId
                    }));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- اختر الطالب --</option>
                  {debtors.map((d: any) => (
                    <option key={d.studentId} value={d.studentId}>
                      {d.studentName} ({d.groupName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان أو وصف البند <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مذكرة المراجعة النهائية، كتاب التدريبات"
                  value={chargeForm.title}
                  onChange={(e) => setChargeForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المبلغ المطلوب (ج.م) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="مثلاً: 50"
                  value={chargeForm.amountDue}
                  onChange={(e) => setChargeForm(prev => ({ ...prev, amountDue: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات</label>
                <input
                  type="text"
                  placeholder="ملاحظات اختيارية..."
                  value={chargeForm.notes}
                  onChange={(e) => setChargeForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChargeModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingCharge}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {submittingCharge ? 'جاري الإضافة...' : 'إضافة الرسوم لحساب الطالب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

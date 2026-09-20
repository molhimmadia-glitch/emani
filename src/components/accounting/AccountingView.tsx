// Emani Art Craft - Accounting, Expenses, Cash Drawer Shifts, & Bahrain NBR VAT Report

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileCheck2,
  Lock,
  Unlock,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Building2,
  X,
  Printer,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, PosShift, Expense } from '../../types';
import { translations, formatBHDLocalized } from '../../services/i18n';

interface AccountingViewProps {
  lang: Language;
  initialTab?: 'vat' | 'pl' | 'expenses' | 'shifts';
}

export const AccountingView: React.FC<AccountingViewProps> = ({ lang, initialTab = 'vat' }) => {
  const t = translations[lang];
  const settings = StorageService.getSettings();
  const sales = StorageService.getSales();
  const expenses = StorageService.getExpenses();
  const shifts = StorageService.getShifts();
  const activeShift = StorageService.getActiveShift();

  const [activeTab, setActiveTab] = useState<'vat' | 'pl' | 'expenses' | 'shifts'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // New Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState('Packaging & Gift Boxes');
  const [expAmount, setExpAmount] = useState<number>(35.0);
  const [expDescription, setExpDescription] = useState('Luxury gift boxes and embossed ribbon purchase');
  const [expPaymentMethod, setExpPaymentMethod] = useState<'cash' | 'card' | 'benefit_pay'>('benefit_pay');

  const activeShiftExpectedCash = activeShift
    ? (activeShift.expectedCash ?? (activeShift.openingCash + activeShift.totalSalesCash + activeShift.totalCashIn - activeShift.totalCashOut - activeShift.totalRefundsCash))
    : 0;

  // Close Shift Modal
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [actualCash, setActualCash] = useState<number>(activeShiftExpectedCash);

  // Financial Calculations
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.subtotal, 0);
  const totalVatCollected = sales.reduce((acc, s) => acc + s.vatTotal, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalVatExpenses = expenses.reduce((acc, e) => acc + (e.vatAmount ?? e.amount * 0.10), 0);

  // Cost of Goods Sold (estimated at 40% of sales for craft/pottery)
  const totalCOGS = totalSalesRevenue * 0.40;
  const grossProfit = totalSalesRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;

  // Net VAT Payable to NBR
  const netVatPayable = totalVatCollected - totalVatExpenses;

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0) return;

    const vatAmount = expAmount * 0.10;
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      expenseNumber: `EXP-${Date.now().toString().slice(-4)}`,
      category: expCategory as any,
      amount: expAmount,
      vatAmount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: expPaymentMethod,
      description: expDescription,
      employeeName: StorageService.getCurrentUser().nameEn,
    };

    StorageService.saveExpense(newExp);
    setShowExpenseModal(false);
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    StorageService.closeShift(activeShift.id, actualCash, 'Shift closed at day end');
    setShowCloseShiftModal(false);
    alert(lang === 'ar' ? 'تم إغلاق الوردية وطباعة التقرير بنجاح' : 'Shift closed successfully');
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525] flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#B8862B]" />
            {t.navAccounting}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'الإقرارات الضريبية لمملكة البحرين (NBR 10% VAT)، الأرباح والخسائر، الورديات وصندوق الكاش'
              : 'Bahrain NBR 10% VAT returns, P&L statements, and register drawer shifts'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E9DDCA] rounded-xl self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('vat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'vat' ? 'bg-[#B8862B] text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {lang === 'ar' ? 'تقرير ضريبة NBR' : 'NBR VAT Report'}
          </button>
          <button
            onClick={() => setActiveTab('pl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'pl' ? 'bg-[#B8862B] text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t.profitLoss}
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'expenses' ? 'bg-[#B8862B] text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t.operatingExpenses}
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'shifts' ? 'bg-[#B8862B] text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t.shiftManagement}
          </button>
        </div>
      </div>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Net Sales */}
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">
            {lang === 'ar' ? 'إجمالي المبيعات الصافية' : 'Net Sales Revenue'}
          </span>
          <p className="text-xl font-black text-neutral-900">
            {formatBHDLocalized(totalSalesRevenue, lang)}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {sales.length} {lang === 'ar' ? 'معاملة مكتملة' : 'invoices'}
          </span>
        </div>

        {/* VAT Collected */}
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">
            {lang === 'ar' ? 'ضريبة القيمة المضافة المحصلة (10%)' : 'Output VAT (10%)'}
          </span>
          <p className="text-xl font-black text-[#8D641D]">
            {formatBHDLocalized(totalVatCollected, lang)}
          </p>
          <span className="text-[10px] text-neutral-500">
            {lang === 'ar' ? 'مبيعات المعرض والمتجر' : 'Showroom & online'}
          </span>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">
            {lang === 'ar' ? 'المصاريف التشغيلية' : 'Operating Expenses'}
          </span>
          <p className="text-xl font-black text-red-600">
            {formatBHDLocalized(totalExpenses, lang)}
          </p>
          <span className="text-[10px] text-neutral-500">
            {expenses.length} {lang === 'ar' ? 'سند صرف' : 'expense vouchers'}
          </span>
        </div>

        {/* Net Profit */}
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">
            {lang === 'ar' ? 'صافي الربح التقديري' : 'Estimated Net Profit'}
          </span>
          <p className="text-xl font-black text-emerald-700">
            {formatBHDLocalized(netProfit, lang)}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">
            {totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100).toFixed(1) : 0}% Margin
          </span>
        </div>
      </div>

      {/* TAB 1: BAHRAIN NBR VAT 10% REPORT */}
      {activeTab === 'vat' && (
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E9DDCA] pb-4 gap-2">
            <div>
              <h2 className="text-lg font-black text-[#252525] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#B8862B]" />
                {lang === 'ar'
                  ? 'إقرار ضريبة القيمة المضافة - الجهاز الوطني للإيرادات (NBR البحرين)'
                  : 'Bahrain NBR Official 10% VAT Return Summary'}
              </h2>
              <p className="text-xs text-neutral-500">
                {lang === 'ar'
                  ? `الرقم الضريبي للمنشأة: ${settings.vatNumber} • سجل تجاري: ${settings.crNumber}`
                  : `VAT Registration: ${settings.vatNumber} • CR: ${settings.crNumber}`}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl text-xs font-bold text-neutral-800 hover:border-[#B8862B]"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'ar' ? 'طباعة الإقرار الضريبي' : 'Print VAT Return'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Sales / Output VAT */}
            <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] space-y-3">
              <h3 className="font-bold text-sm text-[#252525]">
                {lang === 'ar' ? '1. المبيعات الخاضعة للنسبة الأساسية (10%)' : '1. Standard Rated Sales (10%)'}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>{lang === 'ar' ? 'إجمالي قيمة المبيعات (قبل الضريبة):' : 'Net Sales (Excl. VAT):'}</span>
                  <span className="font-mono font-bold">{totalSalesRevenue.toFixed(3)} BHD</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{lang === 'ar' ? 'مبيعات التجزئة ونقطة البيع:' : 'POS Retail Sales:'}</span>
                  <span className="font-mono font-bold">{(totalSalesRevenue * 0.85).toFixed(3)} BHD</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{lang === 'ar' ? 'مبيعات طلبات المناسبات الخاصة:' : 'Custom Orders & Events:'}</span>
                  <span className="font-mono font-bold">{(totalSalesRevenue * 0.15).toFixed(3)} BHD</span>
                </div>
                <div className="pt-2 border-t border-[#E9DDCA] flex justify-between font-extrabold text-sm text-[#8D641D]">
                  <span>{lang === 'ar' ? 'إجمالي ضريبة المخرجات (Output Tax):' : 'Output VAT Collected:'}</span>
                  <span className="font-mono">{totalVatCollected.toFixed(3)} BHD</span>
                </div>
              </div>
            </div>

            {/* Box 2: Purchases / Input VAT */}
            <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] space-y-3">
              <h3 className="font-bold text-sm text-[#252525]">
                {lang === 'ar' ? '2. المشتريات والمصاريف الخاضعة للاسترداد (10%)' : '2. Recoverable Input VAT (10%)'}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>{lang === 'ar' ? 'قيمة المصاريف والمواد الخاضعة:' : 'Taxable Expenses & Supplies:'}</span>
                  <span className="font-mono font-bold">{totalExpenses.toFixed(3)} BHD</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{lang === 'ar' ? 'تغليف، مواد خام، ومستلزمات فنية:' : 'Packaging & Raw Crafts:'}</span>
                  <span className="font-mono font-bold">{(totalExpenses * 0.70).toFixed(3)} BHD</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{lang === 'ar' ? 'خدمات وتشغيل:' : 'Utilities & Operations:'}</span>
                  <span className="font-mono font-bold">{(totalExpenses * 0.30).toFixed(3)} BHD</span>
                </div>
                <div className="pt-2 border-t border-[#E9DDCA] flex justify-between font-extrabold text-sm text-neutral-800">
                  <span>{lang === 'ar' ? 'إجمالي ضريبة المدخلات (Input Tax):' : 'Input VAT Recoverable:'}</span>
                  <span className="font-mono">{totalVatExpenses.toFixed(3)} BHD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net VAT Settlement Banner */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-amber-900">
                {lang === 'ar'
                  ? 'صافي ضريبة القيمة المضافة المستحقة للسداد للجهاز الوطني للإيرادات (NBR):'
                  : 'Net VAT Due to National Bureau for Revenue (NBR):'}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {lang === 'ar'
                  ? 'الضريبة المحصلة ناقص الضريبة المدفوعة على المشتريات والمصروفات'
                  : 'Output Tax minus Input Tax for current tax period'}
              </p>
            </div>
            <div className="text-end">
              <span className="text-2xl font-black text-[#8D641D] font-mono">
                {formatBHDLocalized(netVatPayable, lang)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFIT & LOSS */}
      {activeTab === 'pl' && (
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-5 shadow-xs space-y-4 max-w-3xl mx-auto">
          <h2 className="text-base font-black text-[#252525] border-b border-[#E9DDCA] pb-3">
            {t.profitLoss}
          </h2>

          <div className="space-y-3 text-xs">
            {/* Revenue */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-neutral-800">
                <span>{lang === 'ar' ? 'إيرادات المبيعات الصافية' : 'Sales Revenue'}</span>
                <span className="font-mono text-emerald-700">+{totalSalesRevenue.toFixed(3)} BHD</span>
              </div>
              <div className="flex justify-between text-neutral-500 ps-4">
                <span>{lang === 'ar' ? 'تكلفة البضاعة المباعة (COGS)' : 'Cost of Goods Sold (COGS)'}</span>
                <span className="font-mono text-red-600">-{totalCOGS.toFixed(3)} BHD</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] flex justify-between font-black text-neutral-900">
              <span>{lang === 'ar' ? 'إجمالي الربح (Gross Profit)' : 'Gross Profit'}</span>
              <span className="font-mono">{grossProfit.toFixed(3)} BHD</span>
            </div>

            {/* Expenses */}
            <div className="space-y-1">
              <span className="font-bold text-neutral-800 block">
                {lang === 'ar' ? 'المصاريف التشغيلية (Expenses):' : 'Operating Expenses:'}
              </span>
              {expenses.map((e) => (
                <div key={e.id} className="flex justify-between text-neutral-500 ps-4">
                  <span>{e.category} - {e.description}</span>
                  <span className="font-mono text-red-600">-{e.amount.toFixed(3)} BHD</span>
                </div>
              ))}
            </div>

            {/* Net Profit */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between font-black text-sm text-emerald-900">
              <span>{lang === 'ar' ? 'صافي الربح النهائي (Net Profit)' : 'Net Profit'}</span>
              <span className="font-mono">{netProfit.toFixed(3)} BHD</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B8862B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#8D641D] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addExpense}</span>
            </button>
          </div>

          <div className="bg-white border border-[#E9DDCA] rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-[#E9DDCA] bg-[#FAF7F0] text-neutral-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4 text-start">{t.date}</th>
                  <th className="py-3 px-4 text-start">{t.category}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'البيان / الوصف' : 'Description'}</th>
                  <th className="py-3 px-4 text-start">{t.paymentMethod}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الضريبة' : 'VAT (10%)'}</th>
                  <th className="py-3 px-4 text-end">{t.amount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDCA]/40">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 text-neutral-600">{e.date}</td>
                    <td className="py-3 px-4 font-bold text-neutral-800">{e.category}</td>
                    <td className="py-3 px-4 text-neutral-600">{e.description}</td>
                    <td className="py-3 px-4 capitalize text-neutral-500">
                      {e.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500">
                      {(e.vatAmount ?? e.amount * 0.10).toFixed(3)} BHD
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm text-end text-neutral-900">
                      {formatBHDLocalized(e.amount, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CASH DRAWER SHIFTS */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          {/* Active Shift Card */}
          {activeShift ? (
            <div className="bg-white border-2 border-[#B8862B] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    {lang === 'ar' ? 'الوردية الحالية نشطة' : 'Active Open Shift'}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#252525]">
                  {activeShift.cashierName} • {lang === 'ar' ? 'نقطة بيع المعرض الرئيسي' : 'Main Showroom POS'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {lang === 'ar' ? 'بدء الوردية:' : 'Opened:'} {activeShift.openedAt}
                </p>
                <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-neutral-700">
                  <span>
                    {lang === 'ar' ? 'رصيد الافتتاح:' : 'Opening Float:'}{' '}
                    <b>{activeShift.openingCash.toFixed(3)} BHD</b>
                  </span>
                  <span>•</span>
                  <span>
                    {lang === 'ar' ? 'مبيعات الكاش المتوقعة:' : 'Cash in Drawer:'}{' '}
                    <b className="text-[#8D641D]">{activeShiftExpectedCash.toFixed(3)} BHD</b>
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActualCash(activeShiftExpectedCash);
                  setShowCloseShiftModal(true);
                }}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-xs"
              >
                {t.closeShift}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
              <span>{lang === 'ar' ? 'لا توجد وردية مفتوحة حالياً.' : 'No active shift open.'}</span>
              <button
                onClick={() => StorageService.openShift(50.0, 'Shift opened via Accounting')}
                className="px-3 py-1.5 bg-[#B8862B] text-white rounded-lg font-bold"
              >
                {t.openShift}
              </button>
            </div>
          )}

          {/* Past Shifts Ledger */}
          <div className="bg-white border border-[#E9DDCA] rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-[#E9DDCA] bg-[#FAF7F0] text-neutral-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الكاشير' : 'Cashier'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'التوقيت' : 'Timing'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الافتتاح' : 'Opening'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المتوقع' : 'Expected'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الفعلي' : 'Counted'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الفارق' : 'Diff'}</th>
                  <th className="py-3 px-4 text-end">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDCA]/40">
                {shifts.map((s) => {
                  const expected = s.expectedCash ?? (s.openingCash + s.totalSalesCash + s.totalCashIn - s.totalCashOut - s.totalRefundsCash);
                  const counted = s.closingCashEntered;
                  const diff = s.cashDifference;
                  return (
                    <tr key={s.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-neutral-800">{s.cashierName}</td>
                      <td className="py-3 px-4 text-neutral-500">{s.openedAt}</td>
                      <td className="py-3 px-4 font-mono">{s.openingCash.toFixed(3)} BHD</td>
                      <td className="py-3 px-4 font-mono font-bold">{expected.toFixed(3)} BHD</td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {counted !== undefined ? `${counted.toFixed(3)} BHD` : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {diff !== undefined ? (
                          <span
                            className={
                              diff === 0
                                ? 'text-emerald-600 font-bold'
                                : diff < 0
                                ? 'text-red-600 font-bold'
                                : 'text-amber-600 font-bold'
                            }
                          >
                            {diff > 0 ? `+${diff.toFixed(3)}` : diff.toFixed(3)} BHD
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'open'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Add Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">{t.addExpense}</h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-700">{t.category} *</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                >
                  <option value="Packaging & Gift Boxes">Packaging & Luxury Gift Boxes</option>
                  <option value="Raw Materials (Clay, Glass, Gold)">Raw Materials (Clay, Glass, Gold)</option>
                  <option value="Rent & Utilities">Rent & Electricity</option>
                  <option value="Salaries & Commissions">Salaries & Artisan Commissions</option>
                  <option value="Marketing & Photography">Marketing & Social Media</option>
                  <option value="Maintenance & Tools">Maintenance & Workshop Tools</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{t.amount} (BHD) *</label>
                <input
                  type="number"
                  step="0.100"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700">{t.paymentMethod}</label>
                <select
                  value={expPaymentMethod}
                  onChange={(e) => setExpPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                >
                  <option value="benefit_pay">BenefitPay</option>
                  <option value="card">Card (Debit / Credit)</option>
                  <option value="cash">Cash (From Drawer)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'البيان والتفاصيل' : 'Description'}</label>
                <input
                  type="text"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDCA]">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-[#E9DDCA] rounded-xl text-neutral-600 font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B8862B] text-white rounded-xl font-bold hover:bg-[#8D641D]"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Close Shift */}
      {showCloseShiftModal && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">{t.closeShift}</h3>
              <button onClick={() => setShowCloseShiftModal(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="space-y-3">
              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] space-y-1">
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'المبلغ المتوقع في الدرج:' : 'Expected Cash in Drawer:'}</span>
                  <span className="font-bold font-mono">{activeShiftExpectedCash.toFixed(3)} BHD</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'المبلغ الفعلي المعدود (BHD)' : 'Actual Counted Cash'} *</label>
                <input
                  type="number"
                  step="0.005"
                  required
                  value={actualCash}
                  onChange={(e) => setActualCash(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1 text-base font-black text-neutral-900"
                />
              </div>

              <div className="flex justify-between items-center text-xs font-bold pt-1">
                <span>{lang === 'ar' ? 'فارق الجرد:' : 'Cash Discrepancy:'}</span>
                <span className={actualCash - activeShiftExpectedCash === 0 ? 'text-emerald-700' : 'text-red-600'}>
                  {(actualCash - activeShiftExpectedCash).toFixed(3)} BHD
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDCA]">
                <button
                  type="button"
                  onClick={() => setShowCloseShiftModal(false)}
                  className="px-4 py-2 border border-[#E9DDCA] rounded-xl text-neutral-600 font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                >
                  {lang === 'ar' ? 'تأكيد إغلاق الوردية وطباعة التقرير' : 'Confirm Close & Print'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

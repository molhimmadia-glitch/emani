// Emani Art Craft - Management Dashboard

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  Eye,
  FileText,
  Printer,
  X,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, Sale } from '../../types';
import { translations, formatBHDLocalized } from '../../services/i18n';

interface DashboardViewProps {
  lang: Language;
  onNavigate: (tab: string, targetId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ lang, onNavigate }) => {
  const t = translations[lang];
  const [period, setPeriod] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');
  const [viewInvoiceModal, setViewInvoiceModal] = useState<Sale | null>(null);

  const sales = StorageService.getSales();
  const products = StorageService.getProducts();
  const expenses = StorageService.getExpenses();
  const customers = StorageService.getCustomers();
  const customOrders = StorageService.getCustomOrders();

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter sales according to period
  const filteredSales = sales.filter((s) => {
    if (period === 'today') return s.date === todayStr;
    if (period === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return s.date === y.toISOString().split('T')[0];
    }
    if (period === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return s.date >= d.toISOString().split('T')[0];
    }
    // month
    return s.date.startsWith(todayStr.substring(0, 7));
  });

  // Financial aggregates
  const totalGrossSales = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalCost = filteredSales.reduce((acc, s) => {
    const saleCost = s.items.reduce((cAcc, it) => cAcc + (it.costPrice || it.price * 0.45) * it.quantity, 0);
    return acc + saleCost;
  }, 0);
  const totalVat = filteredSales.reduce((acc, s) => acc + s.vatTotal, 0);
  const totalDiscounts = filteredSales.reduce((acc, s) => acc + s.discountTotal, 0);

  // Filter expenses according to period
  const filteredExpenses = expenses.filter((e) => {
    if (period === 'today') return e.date === todayStr;
    if (period === 'month') return e.date.startsWith(todayStr.substring(0, 7));
    return true;
  });
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  const netProfit = totalGrossSales - totalCost - totalExpenses;
  const transactionCount = filteredSales.length;
  const aov = transactionCount > 0 ? totalGrossSales / transactionCount : 0;

  // Breakdown by payment methods
  let cashTotal = 0;
  let cardTotal = 0;
  let benefitPayTotal = 0;

  filteredSales.forEach((s) => {
    s.payments.forEach((p) => {
      if (p.method === 'cash') cashTotal += p.amount;
      else if (p.method === 'card') cardTotal += p.amount;
      else if (p.method === 'benefit_pay') benefitPayTotal += p.amount;
    });
  });

  // Inventory valuation
  const totalStockQuantity = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalInventoryCost = products.reduce((acc, p) => acc + p.stockQuantity * p.costPrice, 0);
  const totalInventoryRetail = products.reduce((acc, p) => acc + p.stockQuantity * p.sellingPrice, 0);
  const lowStockItems = products.filter((p) => p.stockQuantity <= p.minStock);
  const outOfStockItems = products.filter((p) => p.stockQuantity === 0);

  // Top selling products computation
  const itemMap = new Map<string, { nameAr: string; nameEn: string; qty: number; total: number }>();
  sales.forEach((s) => {
    s.items.forEach((it) => {
      const ex = itemMap.get(it.productId) || {
        nameAr: it.nameAr,
        nameEn: it.nameEn,
        qty: 0,
        total: 0,
      };
      ex.qty += it.quantity;
      ex.total += it.price * it.quantity;
      itemMap.set(it.productId, ex);
    });
  });
  const topSellers = Array.from(itemMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Bar & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525]">
            {lang === 'ar' ? 'لوحة الإدارة والتحليلات المباشرة' : 'Executive Store Analytics & Operations'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'متابعة حية للمبيعات، المخزون، الأرباح، وطلبات المناسبات التراثية - سوق البراحة، ديار المحرق'
              : 'Real-time sales, inventory valuation, profit margins, and custom heritage orders in Bahrain'}
          </p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E9DDCA] rounded-xl shadow-xs self-start sm:self-auto">
          {[
            { id: 'today', label: t.filterToday },
            { id: 'yesterday', label: t.filterYesterday },
            { id: 'week', label: t.filterThisWeek },
            { id: 'month', label: t.filterThisMonth },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === p.id
                  ? 'bg-[#B8862B] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* METRICS ROW 1: Core Financials (Sales, Profit, AOV, Transactions) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sales Card */}
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {t.todaySales}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#B8862B]/10 text-[#B8862B] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#252525] mt-2">
            {formatBHDLocalized(totalGrossSales, lang)}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8% {lang === 'ar' ? 'مقارنة بالفترة السابقة' : 'vs last period'}</span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {t.netProfit}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-800 mt-2">
            {formatBHDLocalized(netProfit, lang)}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 mt-1">
            <span>
              {lang === 'ar' ? 'هامش الربح التقريبي:' : 'Est. Margin:'}{' '}
              {totalGrossSales > 0 ? ((netProfit / totalGrossSales) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Transactions & AOV */}
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {t.transactionsCount}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#8D641D]/10 text-[#8D641D] flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#252525] mt-2">
            {transactionCount}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 mt-1">
            <span>
              {t.avgOrderValue}: <b>{formatBHDLocalized(aov, lang)}</b>
            </span>
          </div>
        </div>

        {/* Inventory Value & Alerts */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs relative overflow-hidden cursor-pointer hover:border-[#B8862B] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {t.inventoryValue}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#252525] mt-2">
            {formatBHDLocalized(totalInventoryRetail, lang)}
          </p>
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-700 mt-1">
            <span className="flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" />
              {lowStockItems.length} {t.lowStockAlerts}
            </span>
          </div>
        </div>
      </div>

      {/* METRICS ROW 2: Payment Methods Breakdown (BenefitPay, Cash, Card) */}
      <div className="bg-white border border-[#E9DDCA] rounded-2xl p-4 sm:p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#252525] mb-3">
          {lang === 'ar' ? 'توزيع المبيعات حسب طرق الدفع' : 'Sales by Payment Method'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* BenefitPay */}
          <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">{t.benefitPay}</p>
                <p className="text-[11px] text-neutral-500">
                  {totalGrossSales > 0 ? ((benefitPayTotal / totalGrossSales) * 100).toFixed(0) : 0}%{' '}
                  {lang === 'ar' ? 'من الإجمالي' : 'of sales'}
                </p>
              </div>
            </div>
            <span className="font-extrabold text-sm text-red-900">
              {formatBHDLocalized(benefitPayTotal, lang)}
            </span>
          </div>

          {/* Cash */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">{t.cash}</p>
                <p className="text-[11px] text-neutral-500">
                  {totalGrossSales > 0 ? ((cashTotal / totalGrossSales) * 100).toFixed(0) : 0}%{' '}
                  {lang === 'ar' ? 'من الإجمالي' : 'of sales'}
                </p>
              </div>
            </div>
            <span className="font-extrabold text-sm text-emerald-900">
              {formatBHDLocalized(cashTotal, lang)}
            </span>
          </div>

          {/* Cards */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">{t.card}</p>
                <p className="text-[11px] text-neutral-500">
                  {totalGrossSales > 0 ? ((cardTotal / totalGrossSales) * 100).toFixed(0) : 0}%{' '}
                  {lang === 'ar' ? 'من الإجمالي' : 'of sales'}
                </p>
              </div>
            </div>
            <span className="font-extrabold text-sm text-blue-900">
              {formatBHDLocalized(cardTotal, lang)}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION: Top Sellers & Active Custom Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Products */}
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#252525] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8862B]" />
              {t.bestSellers}
            </h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-bold text-[#8D641D] hover:underline"
            >
              {lang === 'ar' ? 'عرض الكل' : 'View All'}
            </button>
          </div>

          <div className="space-y-2">
            {topSellers.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E9DDCA]/60 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#B8862B] text-white flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-neutral-800">
                    {lang === 'ar' ? item.nameAr : item.nameEn}
                  </span>
                </div>
                <div className="text-end">
                  <span className="font-bold text-[#8D641D]">
                    {formatBHDLocalized(item.total, lang)}
                  </span>
                  <span className="text-[10px] text-neutral-400 ms-2">
                    ({item.qty} {lang === 'ar' ? 'قطعة' : 'sold'})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Custom Orders & Wedding Giveaways */}
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#252525] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#B8862B]" />
              {lang === 'ar' ? 'أحدث طلبات المناسبات والهدايا' : 'Recent Custom & Wedding Orders'}
            </h3>
            <button
              onClick={() => onNavigate('custom-orders')}
              className="text-xs font-bold text-[#8D641D] hover:underline"
            >
              {lang === 'ar' ? 'عرض الكل' : 'View All'}
            </button>
          </div>

          <div className="space-y-2">
            {customOrders.slice(0, 4).map((ord) => (
              <div
                key={ord.id}
                onClick={() => onNavigate('custom-orders', ord.id)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E9DDCA]/60 text-xs hover:border-[#B8862B] cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-bold text-neutral-900">
                    #{ord.orderNumber} • {ord.customerName}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    {ord.eventType} • {ord.productName} ({ord.quantity} pcs)
                  </p>
                </div>
                <div className="text-end">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B8862B]/15 text-[#8D641D] capitalize">
                    {ord.status.replace('_', ' ')}
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Due: {ord.deadline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION: Recent Transactions Table with 1-Click View / Print */}
      <div className="bg-white border border-[#E9DDCA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#252525] flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#B8862B]" />
            {lang === 'ar' ? 'أحدث المبيعات والفواتير' : 'Recent Sales & Invoices'}
          </h3>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-[#8D641D] hover:underline"
          >
            {lang === 'ar' ? 'سجل الفواتير الكامل' : 'All Invoices'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-[#E9DDCA] text-neutral-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 text-start">{t.saleNumber}</th>
                <th className="py-2.5 px-3 text-start">{t.date}</th>
                <th className="py-2.5 px-3 text-start">{t.customerName}</th>
                <th className="py-2.5 px-3 text-start">{t.paymentMethod}</th>
                <th className="py-2.5 px-3 text-start">{t.grandTotal}</th>
                <th className="py-2.5 px-3 text-end">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DDCA]/40">
              {sales.slice(0, 6).map((s) => (
                <tr key={s.id} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#8D641D]">
                    #{s.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600">
                    {s.date} {s.time}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-neutral-800">
                    {s.customerName || t.walkInCustomer}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#E9DDCA]/40 text-neutral-800 font-semibold text-[10px]">
                      {s.payments.map((p) => p.method).join(', ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-neutral-900">
                    {formatBHDLocalized(s.grandTotal, lang)}
                  </td>
                  <td className="py-2.5 px-3 text-end">
                    <button
                      onClick={() => setViewInvoiceModal(s)}
                      className="p-1.5 rounded-lg text-[#8D641D] hover:bg-[#FAF7F0] hover:text-[#B8862B] transition-colors"
                      title={lang === 'ar' ? 'عرض الفاتورة' : 'View Invoice'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal */}
      {viewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">
                {lang === 'ar' ? 'تفاصيل الفاتورة الضريبية' : 'Tax Invoice Details'}
              </h3>
              <button
                onClick={() => setViewInvoiceModal(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF7F0] p-4 rounded-xl space-y-2 border border-[#E9DDCA]">
              <div className="flex justify-between">
                <span className="text-neutral-500">رقم الفاتورة:</span>
                <span className="font-bold font-mono">#{viewInvoiceModal.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">التاريخ والوقت:</span>
                <span>{viewInvoiceModal.date} {viewInvoiceModal.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">العميل:</span>
                <span className="font-bold">{viewInvoiceModal.customerName || 'عميل عام'}</span>
              </div>

              <div className="py-2 border-y border-[#E9DDCA] space-y-1">
                {viewInvoiceModal.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-neutral-800">
                    <span>{it.quantity} x {lang === 'ar' ? it.nameAr : it.nameEn}</span>
                    <span className="font-bold">{(it.price * it.quantity).toFixed(3)} BHD</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-extrabold text-sm text-[#8D641D]">
                <span>الإجمالي:</span>
                <span>{formatBHDLocalized(viewInvoiceModal.grandTotal, lang)}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-[#B8862B] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-[#8D641D] transition-colors"
            >
              <Printer className="w-4 h-4" />
              {t.printReceipt}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

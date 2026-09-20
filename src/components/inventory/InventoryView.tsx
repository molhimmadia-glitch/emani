// Emani Art Craft - Multi-Warehouse Inventory & Movement Ledger

import React, { useState } from 'react';
import {
  Warehouse,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  MoveRight,
  FileSpreadsheet,
  Plus,
  Search,
  X,
  History,
  CheckCircle2,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, InventoryMovementType, Product } from '../../types';
import { translations, formatBHDLocalized } from '../../services/i18n';

interface InventoryViewProps {
  lang: Language;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ lang }) => {
  const t = translations[lang];
  const warehouses = StorageService.getWarehouses();
  const products = StorageService.getProducts();
  const movements = StorageService.getMovements();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'movements' | 'transfers'>('overview');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modals
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form State for Stock Adjustment
  const [adjustType, setAdjustType] = useState<InventoryMovementType>('adjustment_add');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('Annual Inventory Count');
  const [adjustWarehouseId, setAdjustWarehouseId] = useState<string>('wh-1');
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  // Form State for Stock Transfer
  const [fromWhId, setFromWhId] = useState<string>('wh-2');
  const [toWhId, setToWhId] = useState<string>('wh-1');
  const [transferQty, setTransferQty] = useState<number>(5);

  const handleOpenAdjust = (prod: Product) => {
    setSelectedProduct(prod);
    setAdjustQty(1);
    setShowAdjustModal(true);
  };

  const handleOpenTransfer = (prod: Product) => {
    setSelectedProduct(prod);
    setTransferQty(Math.min(5, prod.stockQuantity));
    setShowTransferModal(true);
  };

  const handleExecuteAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustQty <= 0) return;

    StorageService.recordStockMovement({
      productId: selectedProduct.id,
      movementType: adjustType,
      quantity: adjustQty,
      warehouseId: adjustWarehouseId,
      reason: adjustReason,
      reference: `ADJ-${Date.now().toString().substring(7)}`,
      notes: adjustNotes,
    });

    setShowAdjustModal(false);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || transferQty <= 0 || fromWhId === toWhId) return;

    const fromWh = warehouses.find((w) => w.id === fromWhId);
    const toWh = warehouses.find((w) => w.id === toWhId);

    StorageService.createStockTransfer({
      fromWarehouseId: fromWhId,
      fromWarehouseName: fromWh ? fromWh.nameEn : '',
      toWarehouseId: toWhId,
      toWarehouseName: toWh ? toWh.nameEn : '',
      requestedBy: StorageService.getCurrentUser().nameEn,
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.nameEn,
          quantity: transferQty,
        },
      ],
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      notes: 'Direct transfer completed via ERP',
    });

    setShowTransferModal(false);
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.nameAr.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q)
    );
  });

  const transfers = StorageService.getStockTransfers();

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525]">
            {t.navInventory}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'إدارة المخزون متعدد المستودعات، التحويلات، وسجل حركات الجرد غير القابل للتعديل'
              : 'Multi-warehouse stock control, inter-store transfers, and audit movement ledger'}
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E9DDCA] rounded-xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'overview'
                ? 'bg-[#B8862B] text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {lang === 'ar' ? 'نظرة عامة على الأصناف' : 'Stock Overview'}
          </button>
          <button
            onClick={() => setActiveSubTab('movements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'movements'
                ? 'bg-[#B8862B] text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {lang === 'ar' ? 'سجل حركات المخزون' : 'Stock Movements'}
          </button>
          <button
            onClick={() => setActiveSubTab('transfers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'transfers'
                ? 'bg-[#B8862B] text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t.stockTransfer}
          </button>
        </div>
      </div>

      {/* Warehouse Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#8D641D] uppercase tracking-wider">
                {wh.isDefault ? (lang === 'ar' ? 'المعرض الرئيسي' : 'Primary Showroom') : (lang === 'ar' ? 'مستودع تخزين' : 'Warehouse')}
              </span>
              <h3 className="font-bold text-sm text-[#252525]">
                {lang === 'ar' ? wh.nameAr : wh.nameEn}
              </h3>
              <p className="text-[11px] text-neutral-400">{wh.address || (lang === 'ar' ? 'البحرين' : 'Bahrain')}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-[#E9DDCA] text-[#B8862B] flex items-center justify-center font-bold">
              <Warehouse className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* TAB 1: Stock Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E9DDCA] rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8862B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث في المخزون بالاسم أو الرمز...' : 'Search stock...'}
                className="w-full ps-9 pe-3 py-2 bg-[#FAF7F0]/60 border border-[#E9DDCA] rounded-xl text-xs text-[#252525] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="bg-white border border-[#E9DDCA] rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-[#E9DDCA] bg-[#FAF7F0] text-neutral-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4 text-start">{t.productName}</th>
                  <th className="py-3 px-4 text-start">{t.sku}</th>
                  <th className="py-3 px-4 text-start">{t.stockQty}</th>
                  <th className="py-3 px-4 text-start">{t.minStock}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'حالة التوفر' : 'Status'}</th>
                  <th className="py-3 px-4 text-end">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDCA]/40">
                {filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.images[0] || 'https://placehold.co/60x60'}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-[#E9DDCA]"
                          />
                          <span className="font-bold text-neutral-800">
                            {lang === 'ar' ? p.nameAr : p.nameEn}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-500">{p.sku}</td>
                      <td className="py-3 px-4 font-extrabold text-[#252525] text-sm">
                        {p.stockQuantity} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {p.minStock} {p.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stockQuantity === 0
                              ? 'bg-red-100 text-red-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stockQuantity === 0
                            ? lang === 'ar'
                              ? 'نفذ المخزون'
                              : 'Out of Stock'
                            : isLow
                            ? lang === 'ar'
                              ? 'منخفض'
                              : 'Low Stock'
                            : lang === 'ar'
                            ? 'متوفر'
                            : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAdjust(p)}
                            className="px-2 py-1 bg-[#FAF7F0] border border-[#E9DDCA] rounded-lg text-neutral-700 hover:border-[#B8862B] font-semibold text-[11px]"
                          >
                            {t.stockAdjustment}
                          </button>
                          <button
                            onClick={() => handleOpenTransfer(p)}
                            className="px-2 py-1 bg-[#FAF7F0] border border-[#E9DDCA] rounded-lg text-neutral-700 hover:border-[#B8862B] font-semibold text-[11px]"
                          >
                            {t.stockTransfer}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Immutable Stock Movements Ledger */}
      {activeSubTab === 'movements' && (
        <div className="bg-white border border-[#E9DDCA] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E9DDCA] bg-[#FAF7F0] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#252525] flex items-center gap-2">
              <History className="w-4 h-4 text-[#B8862B]" />
              {lang === 'ar' ? 'سجل حركات المخزون' : 'Stock Movements'}
            </h3>
            <span className="text-xs text-neutral-400 font-medium">
              {movements.length} {lang === 'ar' ? 'حركة مسجلة' : 'records logged'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-[#E9DDCA] text-neutral-500 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 text-start">{t.date}</th>
                  <th className="py-3 px-4 text-start">{t.productName}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'نوع الحركة' : 'Movement Type'}</th>
                  <th className="py-3 px-4 text-start">{t.quantity}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'قبل / بعد' : 'Prev / New'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المستودع' : 'Warehouse'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'السبب / المرجع' : 'Reason / Ref'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDCA]/40">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 text-neutral-600">
                      {m.date} {m.time}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-800">{m.productName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF7F0] border border-[#E9DDCA] text-[#8D641D] capitalize">
                        {m.movementType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-neutral-900">{m.quantity}</td>
                    <td className="py-3 px-4 text-neutral-500 font-mono">
                      {m.previousQuantity} → {m.newQuantity}
                    </td>
                    <td className="py-3 px-4 text-neutral-700">{m.warehouseName}</td>
                    <td className="py-3 px-4 text-neutral-600">{m.userName}</td>
                    <td className="py-3 px-4 text-neutral-500 max-w-[200px] truncate">
                      {m.reason} ({m.reference})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Stock Transfers */}
      {activeSubTab === 'transfers' && (
        <div className="bg-white border border-[#E9DDCA] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E9DDCA] bg-[#FAF7F0]">
            <h3 className="font-bold text-sm text-[#252525] flex items-center gap-2">
              <MoveRight className="w-4 h-4 text-[#B8862B]" />
              {t.stockTransfer}
            </h3>
          </div>
          <div className="p-4">
            {transfers.length === 0 ? (
              <p className="text-center text-neutral-400 py-6 text-xs">
                {lang === 'ar' ? 'لا توجد طلبات تحويل مخزون سابقة' : 'No transfers recorded yet'}
              </p>
            ) : (
              <div className="space-y-2">
                {transfers.map((tr) => (
                  <div
                    key={tr.id}
                    className="p-3 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-neutral-800">
                        #{tr.transferNumber} • {tr.date}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {tr.fromWarehouseName} ➔ {tr.toWarehouseName}
                      </p>
                      <p className="text-[10px] text-neutral-600 mt-1">
                        {tr.items.map((it) => `${it.productName} (${it.quantity})`).join(', ')}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 capitalize">
                      {tr.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Stock Adjustment */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">
                {t.stockAdjustment} - {selectedProduct.nameEn}
              </h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjust} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'نوع التعديل' : 'Type'} *</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                >
                  <option value="adjustment_add">{lang === 'ar' ? 'إضافة مخزون (+)' : 'Add Stock (+)'}</option>
                  <option value="adjustment_sub">{lang === 'ar' ? 'خصم مخزون (-)' : 'Subtract Stock (-)'}</option>
                  <option value="damaged">{lang === 'ar' ? 'بضاعة تالفة (Damaged)' : 'Damaged Stock'}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{t.quantity} *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'المستودع' : 'Warehouse'} *</label>
                <select
                  value={adjustWarehouseId}
                  onChange={(e) => setAdjustWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {lang === 'ar' ? w.nameAr : w.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'سبب التعديل (إلزامي)' : 'Reason (Mandatory)'} *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Broken in display, audit discrepancy"
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDCA]">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
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

      {/* MODAL: Stock Transfer */}
      {showTransferModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">
                {t.stockTransfer} - {selectedProduct.nameEn}
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'من مستودع' : 'From Warehouse'}</label>
                  <select
                    value={fromWhId}
                    onChange={(e) => setFromWhId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {lang === 'ar' ? w.nameAr : w.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'إلى مستودع' : 'To Warehouse'}</label>
                  <select
                    value={toWhId}
                    onChange={(e) => setToWhId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {lang === 'ar' ? w.nameAr : w.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{t.quantity} *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stockQuantity}
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDCA]">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border border-[#E9DDCA] rounded-xl text-neutral-600 font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B8862B] text-white rounded-xl font-bold hover:bg-[#8D641D]"
                >
                  {lang === 'ar' ? 'تنفيذ التحويل الفوري' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Emani Art Craft - Purchasing, Supplier Management & Warehouse Receiving

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  CheckCircle,
  Clock,
  Building2,
  Phone,
  FileText,
  X,
  Search,
  PackageCheck,
  Calendar,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, PurchaseOrder, Supplier } from '../../types';
import { translations, formatBHDLocalized } from '../../services/i18n';

interface PurchasingViewProps {
  lang: Language;
}

export const PurchasingView: React.FC<PurchasingViewProps> = ({ lang }) => {
  const t = translations[lang];
  const purchaseOrders = StorageService.getPurchaseOrders();
  const suppliers = StorageService.getSuppliers();
  const products = StorageService.getProducts();
  const warehouses = StorageService.getWarehouses();

  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');

  // Modals
  const [showPOModal, setShowPOModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // New PO State
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || '');
  const [poWarehouseId, setPoWarehouseId] = useState(warehouses[0]?.id || 'wh-1');
  const [poExpectedDate, setPoExpectedDate] = useState('');
  const [poItems, setPoItems] = useState<
    { productId: string; quantity: number; unitCost: number; total: number }[]
  >([
    {
      productId: products[0]?.id || 'prod-1',
      quantity: 50,
      unitCost: products[0]?.costPrice || 5.0,
      total: (products[0]?.costPrice || 5.0) * 50,
    },
  ]);

  // New Supplier State
  const [newSupName, setNewSupName] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupCategory, setNewSupCategory] = useState('Raw Crafts & Pottery');

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === poSupplierId) || suppliers[0];
    if (!sup) return;

    const subtotal = poItems.reduce((acc, it) => acc + it.total, 0);
    const vatTotal = subtotal * 0.1;
    const grandTotal = subtotal + vatTotal;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${(purchaseOrders.length + 1).toString().padStart(4, '0')}`,
      supplierId: sup.id,
      supplierName: sup.name,
      date: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: poExpectedDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      status: 'ordered',
      paymentStatus: 'unpaid',
      items: poItems.map((it) => {
        const prod = products.find((p) => p.id === it.productId);
        return {
          productId: it.productId,
          productName: prod ? (lang === 'ar' ? prod.nameAr : prod.nameEn) : 'Artisan Material',
          quantity: it.quantity,
          receivedQuantity: 0,
          unitCost: it.unitCost,
          total: it.total,
        };
      }),
      subtotal,
      vatTotal,
      grandTotal,
    };

    StorageService.savePurchaseOrder(newPO);
    setShowPOModal(false);
  };

  const handleReceiveGoods = (po: PurchaseOrder) => {
    if (
      confirm(
        lang === 'ar'
          ? 'هل تود استلام بضاعة أمر الشراء وزيادة كميات المخزون فورياً في المستودع؟'
          : 'Receive goods and automatically increase warehouse stock levels?'
      )
    ) {
      const itemsToReceive = po.items.map((it) => ({
        productId: it.productId,
        quantity: Math.max(0, it.quantity - it.receivedQuantity),
      }));

      StorageService.receivePurchaseOrderGoods(po.id, itemsToReceive);
      alert(lang === 'ar' ? 'تم استلام البضاعة وتحديث المخزون بنجاح!' : 'Stock received and inventory updated!');
    }
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName) return;

    const sup: Supplier = {
      id: `sup-${Date.now()}`,
      name: newSupName,
      contactPerson: newSupContact,
      phone: newSupPhone,
      whatsapp: newSupPhone,
      email: '',
      address: 'Kingdom of Bahrain',
      productsSupplied: [newSupCategory],
      paymentTerms: 'Net 30 Days',
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };

    StorageService.saveSupplier(sup);
    setShowSupplierModal(false);
    setNewSupName('');
    setNewSupContact('');
    setNewSupPhone('');
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525] flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#B8862B]" />
            {t.suppliersTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'أوامر شراء المواد الخام، الحرفيين الموردين، وإدخال الشحنات في المستودعات'
              : 'Purchase orders, artisan material suppliers, and automated warehouse receiving'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Subtab switcher */}
          <div className="p-1 bg-white border border-[#E9DDCA] rounded-xl flex">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'orders' ? 'bg-[#B8862B] text-white' : 'text-neutral-600'
              }`}
            >
              {lang === 'ar' ? 'أوامر الشراء' : 'Purchase Orders'}
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'suppliers' ? 'bg-[#B8862B] text-white' : 'text-neutral-600'
              }`}
            >
              {lang === 'ar' ? 'الموردون' : 'Suppliers'}
            </button>
          </div>

          <button
            onClick={() => (activeTab === 'orders' ? setShowPOModal(true) : setShowSupplierModal(true))}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B8862B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#8D641D] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === 'orders'
                ? t.newPurchaseOrder
                : lang === 'ar'
                ? 'إضافة مورد'
                : 'Add Supplier'}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: Purchase Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E9DDCA] rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-[#E9DDCA] bg-[#FAF7F0] text-neutral-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'رقم الأمر' : 'PO #'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المورد' : 'Supplier'}</th>
                  <th className="py-3 px-4 text-start">{t.date}</th>
                  <th className="py-3 px-4 text-start">{t.status}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'حالة السداد' : 'Payment'}</th>
                  <th className="py-3 px-4 text-start">{t.total}</th>
                  <th className="py-3 px-4 text-end">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDCA]/40">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-400">
                      {lang === 'ar' ? 'لا توجد أوامر شراء مسجلة حالياً' : 'No purchase orders recorded yet'}
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#8D641D]">
                        #{po.poNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-800">{po.supplierName}</td>
                      <td className="py-3 px-4 text-neutral-500">
                        {po.date} <br />
                        <span className="text-[10px] text-neutral-400">
                          Exp: {po.expectedDeliveryDate || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            po.status === 'received'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            po.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {po.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sm text-[#252525]">
                        {formatBHDLocalized(po.grandTotal, lang)}
                      </td>
                      <td className="py-3 px-4 text-end">
                        {po.status !== 'received' && (
                          <button
                            onClick={() => handleReceiveGoods(po)}
                            className="px-3 py-1.5 bg-[#B8862B] text-white rounded-lg font-bold text-[11px] hover:bg-[#8D641D] transition-colors"
                          >
                            {t.receiveGoods}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs space-y-2 hover:border-[#B8862B] transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#8D641D] uppercase">
                    {s.productsSupplied?.join(', ') || 'Artisan Materials'}
                  </span>
                  <h3 className="font-bold text-sm text-[#252525] mt-0.5">{s.name}</h3>
                  <p className="text-xs text-neutral-500">{s.contactPerson}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-[#E9DDCA] text-[#B8862B] flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E9DDCA]/60 flex items-center justify-between text-xs">
                <span className="text-neutral-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {s.phone}
                </span>
                <span className="font-mono text-neutral-700">
                  {lang === 'ar' ? 'الرصيد: ' : 'Bal: '}
                  {formatBHDLocalized(s.outstandingBalance || 0, lang)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Create Purchase Order */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">{t.newPurchaseOrder}</h3>
              <button onClick={() => setShowPOModal(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'المورد' : 'Supplier'} *</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'مستودع الاستلام' : 'Destination Warehouse'} *</label>
                <select
                  value={poWarehouseId}
                  onChange={(e) => setPoWarehouseId(e.target.value)}
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
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'تاريخ التوريد المتوقع' : 'Expected Delivery Date'}</label>
                <input
                  type="date"
                  value={poExpectedDate}
                  onChange={(e) => setPoExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              {/* Item selection */}
              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] space-y-2">
                <label className="font-bold text-neutral-800">{lang === 'ar' ? 'الصنف المطلوب' : 'Product'}</label>
                <select
                  value={poItems[0]?.productId}
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    const cost = prod ? prod.costPrice : 5;
                    setPoItems([
                      {
                        productId: e.target.value,
                        quantity: poItems[0]?.quantity || 50,
                        unitCost: cost,
                        total: (poItems[0]?.quantity || 50) * cost,
                      },
                    ]);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E9DDCA] rounded-lg"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {lang === 'ar' ? p.nameAr : p.nameEn} (Cost: {p.costPrice.toFixed(3)} BHD)
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-600">{t.quantity}</label>
                    <input
                      type="number"
                      min="1"
                      value={poItems[0]?.quantity}
                      onChange={(e) => {
                        const q = parseInt(e.target.value) || 1;
                        setPoItems([
                          {
                            ...poItems[0],
                            quantity: q,
                            total: q * poItems[0].unitCost,
                          },
                        ]);
                      }}
                      className="w-full px-2 py-1 bg-white border border-[#E9DDCA] rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-600">{t.total} (BHD)</label>
                    <div className="px-2 py-1 bg-white border border-[#E9DDCA] rounded-lg font-bold text-[#8D641D]">
                      {poItems[0]?.total.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDCA]">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
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

      {/* MODAL: Create Supplier */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">
                {lang === 'ar' ? 'إضافة مورد جديد' : 'Add Supplier'}
              </h3>
              <button onClick={() => setShowSupplierModal(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'اسم المورد / الشركة' : 'Supplier Name'} *</label>
                <input
                  type="text"
                  required
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'الشخص المسؤول' : 'Contact Person'}</label>
                <input
                  type="text"
                  value={newSupContact}
                  onChange={(e) => setNewSupContact(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'رقم الهاتف' : 'Phone'}</label>
                <input
                  type="text"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'فئة المواد الموردة' : 'Category'}</label>
                <input
                  type="text"
                  value={newSupCategory}
                  onChange={(e) => setNewSupCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDCA]">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
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
    </div>
  );
};

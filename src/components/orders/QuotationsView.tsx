// Emani Art Craft - Quotations & Sales Orders with 1-Click Conversion

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ArrowRightCircle,
  Printer,
  Share2,
  Trash2,
  X,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, Quotation } from '../../types';
import { translations, formatBHDLocalized } from '../../services/i18n';
import { generateQuotationWhatsAppUrl } from '../../services/whatsapp';
import { EmaniLogo } from '../common/EmaniLogo';

interface QuotationsViewProps {
  lang: Language;
}

type QuotationItemType = Quotation['items'][0];

export const QuotationsView: React.FC<QuotationsViewProps> = ({ lang }) => {
  const t = translations[lang];
  const settings = StorageService.getSettings();
  const quotations = StorageService.getQuotations();
  const customers = StorageService.getCustomers();
  const products = StorageService.getProducts();

  const [showModal, setShowModal] = useState(false);
  const [printableQuotation, setPrintableQuotation] = useState<Quotation | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]
  );
  const [items, setItems] = useState<QuotationItemType[]>([
    {
      productId: products[0]?.id || 'p-1',
      description: 'Luxury Customized Tea Istikana Set (6 pcs)',
      quantity: 20,
      unitPrice: 12.500,
      discount: 0,
      vatRate: 0.10,
      total: 250.000,
    },
  ]);
  const [notes, setNotes] = useState('Includes royal bespoke gift packaging with gold foil typography.');

  const subtotal = items.reduce((acc, it) => acc + it.total, 0);
  const vatTotal = subtotal * 0.10;
  const grandTotal = subtotal + vatTotal;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: 'Artisan Gift Item',
        quantity: 1,
        unitPrice: 10.0,
        discount: 0,
        vatRate: 0.10,
        total: 10.0,
      },
    ]);
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    const count = quotations.length + 1;
    const quotationNumber = `QT-${new Date().getFullYear()}-${count.toString().padStart(5, '0')}`;

    const newQuotation: Quotation = {
      id: `qt-${Date.now()}`,
      quotationNumber,
      customerId: 'cust-walk-in',
      customerName,
      customerPhone,
      date: new Date().toISOString().split('T')[0],
      validUntil,
      items,
      subtotal,
      vatTotal,
      grandTotal,
      status: 'draft',
      notes,
      terms: '50% deposit required upon confirmation. Delivery within 10 days in Bahrain.',
    };

    StorageService.saveQuotation(newQuotation);
    setShowModal(false);
  };

  const handleConvertToOrder = (qtId: string) => {
    if (
      confirm(
        lang === 'ar'
          ? 'هل ترغب في تحويل عرض السعر إلى طلب مناسبات وتجهيز رسمي بنقرة واحدة؟'
          : 'Convert this quotation into an active Custom Order in 1 click?'
      )
    ) {
      const order = StorageService.convertQuotationToOrder(qtId);
      alert(
        lang === 'ar'
          ? `تم إنشاء الطلب رقم #${order.orderNumber} بنجاح!`
          : `Custom Order #${order.orderNumber} created successfully!`
      );
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#B8862B]" />
            {t.navQuotations}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'إنشاء عروض أسعار رسمية للشركات والجهات الحكومية والأعراس مع إمكانية التحويل المباشر لطلب بيع'
              : 'Create official corporate & wedding quotations with 1-click order conversion'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#B8862B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#8D641D] transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.createQuotation}</span>
        </button>
      </div>

      {/* Quotations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotations.map((qt) => (
          <div
            key={qt.id}
            className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#B8862B] transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#8D641D]">
                  #{qt.quotationNumber}
                </span>
                <h3 className="font-bold text-sm text-[#252525] mt-0.5">{qt.customerName}</h3>
                <p className="text-[11px] text-neutral-400">
                  {qt.date} • {lang === 'ar' ? 'صالح حتى' : 'Valid until'}: {qt.validUntil}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                  qt.status === 'converted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {qt.status}
              </span>
            </div>

            {/* Items Summary */}
            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA]/60 space-y-1 text-xs">
              {qt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-neutral-700">
                  <span className="truncate max-w-[180px]">
                    {it.quantity}x {it.description}
                  </span>
                  <span className="font-semibold">{it.total.toFixed(3)} BHD</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#E9DDCA]/60 flex justify-between font-extrabold text-sm text-[#8D641D]">
                <span>{lang === 'ar' ? 'الإجمالي شامل الضريبة:' : 'Grand Total:'}</span>
                <span>{formatBHDLocalized(qt.grandTotal, lang)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-[#E9DDCA]/60">
              {/* WhatsApp Share */}
              <a
                href={generateQuotationWhatsAppUrl(qt, settings, lang)}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                title="Send Quotation via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
              </a>

              {/* Print Quotation */}
              <button
                onClick={() => setPrintableQuotation(qt)}
                className="p-2 bg-neutral-800 text-white rounded-lg hover:bg-black transition-colors"
                title="Print Official Quotation"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              {/* 1-Click Convert */}
              {qt.status !== 'converted' ? (
                <button
                  onClick={() => handleConvertToOrder(qt.id)}
                  className="flex-1 py-1.5 px-2 bg-[#B8862B] text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-[#8D641D] transition-colors"
                >
                  <ArrowRightCircle className="w-3.5 h-3.5" />
                  <span>{t.convertToOrder}</span>
                </button>
              ) : (
                <span className="flex-1 text-center text-[10px] font-bold text-emerald-700 bg-emerald-50 py-1.5 rounded-lg">
                  {lang === 'ar' ? `تم التحويل: ${qt.convertedRefNumber}` : `Converted: ${qt.convertedRefNumber}`}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Create Quotation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">{t.createQuotation}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'العميل / الجهة' : 'Client / Company'} *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ministry of Tourism / Mrs. Sarah"
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'رقم الهاتف' : 'Phone'}</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 39448821"
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'تاريخ الصلاحية' : 'Valid Until'}</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2 border-t border-[#E9DDCA]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-800">{lang === 'ar' ? 'بنود العرض' : 'Quotation Items'}</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[11px] font-bold text-[#8D641D] hover:underline"
                  >
                    + {lang === 'ar' ? 'إضافة بند' : 'Add Item'}
                  </button>
                </div>

                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-1.5 bg-[#FAF7F0] p-2 rounded-xl border border-[#E9DDCA]">
                    <input
                      placeholder="Description"
                      value={it.description}
                      onChange={(e) => {
                        it.description = e.target.value;
                        setItems([...items]);
                      }}
                      className="col-span-6 px-2 py-1 bg-white border border-[#E9DDCA] rounded text-xs"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) => {
                        it.quantity = parseInt(e.target.value) || 1;
                        it.total = it.quantity * it.unitPrice;
                        setItems([...items]);
                      }}
                      className="col-span-2 px-2 py-1 bg-white border border-[#E9DDCA] rounded text-xs text-center"
                    />
                    <input
                      type="number"
                      step="0.100"
                      placeholder="Price"
                      value={it.unitPrice}
                      onChange={(e) => {
                        it.unitPrice = parseFloat(e.target.value) || 0;
                        it.total = it.quantity * it.unitPrice;
                        setItems([...items]);
                      }}
                      className="col-span-3 px-2 py-1 bg-white border border-[#E9DDCA] rounded text-xs text-end"
                    />
                    <button
                      type="button"
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      className="col-span-1 text-red-500 hover:text-red-700 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 font-bold text-sm text-[#8D641D]">
                <span>{lang === 'ar' ? 'الإجمالي التقديري شامل الضريبة:' : 'Total (incl. 10% VAT):'}</span>
                <span>{formatBHDLocalized(grandTotal, lang)}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDCA]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

      {/* MODAL 2: Printable Quotation Sheet */}
      {printableQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2 no-print">
              <span className="font-bold text-neutral-800">
                {lang === 'ar' ? 'معاينة عرض السعر للطباعة' : 'Printable Quotation Preview'}
              </span>
              <button
                onClick={() => setPrintableQuotation(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="printable-quotation-doc" className="p-6 bg-[#FAF7F0]/30 rounded-xl border border-[#E9DDCA] space-y-4 leading-relaxed">
              <div className="flex justify-between items-start border-b border-[#E9DDCA] pb-4">
                <EmaniLogo size="lg" />
                <div className="text-end">
                  <h2 className="text-lg font-black text-[#8D641D]">
                    {lang === 'ar' ? 'عرض سعر رسمي' : 'OFFICIAL QUOTATION'}
                  </h2>
                  <p className="font-mono font-bold text-neutral-700">#{printableQuotation.quotationNumber}</p>
                  <p className="text-neutral-500">التاريخ: {printableQuotation.date}</p>
                  <p className="text-neutral-500">صالح حتى: {printableQuotation.validUntil}</p>
                </div>
              </div>

              <div className="flex justify-between text-xs py-2">
                <div>
                  <p className="text-neutral-400 font-bold">المقدم إلى (Client):</p>
                  <p className="font-bold text-sm text-neutral-800">{printableQuotation.customerName}</p>
                  <p className="text-neutral-500">{printableQuotation.customerPhone}</p>
                </div>
                <div className="text-end">
                  <p className="text-neutral-400 font-bold">الجهة المصدرة (From):</p>
                  <p className="font-bold text-sm text-[#252525]">{settings.companyNameAr}</p>
                  <p className="text-neutral-500">س.ت: {settings.crNumber} • الرقم الضريبي: {settings.vatNumber}</p>
                </div>
              </div>

              <table className="w-full text-xs text-start border border-[#E9DDCA] rounded-lg overflow-hidden">
                <thead className="bg-[#FAF7F0] border-b border-[#E9DDCA] font-bold text-neutral-700">
                  <tr>
                    <th className="p-2.5 text-start">الوصف / البيان</th>
                    <th className="p-2.5 text-center">الكمية</th>
                    <th className="p-2.5 text-end">سعر الوحدة</th>
                    <th className="p-2.5 text-end">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDCA]">
                  {printableQuotation.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium">{it.description}</td>
                      <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                      <td className="p-2.5 text-end font-mono">{it.unitPrice.toFixed(3)} BHD</td>
                      <td className="p-2.5 text-end font-mono font-bold">{it.total.toFixed(3)} BHD</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>المجموع الفرعي:</span>
                    <span>{printableQuotation.subtotal.toFixed(3)} BHD</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>ضريبة القيمة المضافة (10%):</span>
                    <span>{printableQuotation.vatTotal.toFixed(3)} BHD</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-[#8D641D] pt-1 border-t border-[#E9DDCA]">
                    <span>الإجمالي النهائي:</span>
                    <span>{printableQuotation.grandTotal.toFixed(3)} BHD</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E9DDCA] text-[10px] text-neutral-500">
                <p><b>الشروط والأحكام:</b> {printableQuotation.terms}</p>
                <p className="mt-1">ملاحظات: {printableQuotation.notes}</p>
              </div>
            </div>

            <div className="flex gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#B8862B] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-[#8D641D] transition-colors"
              >
                <Printer className="w-4 h-4" />
                {t.printReceipt}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

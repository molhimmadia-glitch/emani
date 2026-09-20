import React from 'react';
import { MapPin, Phone, Instagram, Printer, Share2, X } from 'lucide-react';
import { Sale, CompanySettings, Customer } from '../../types';

interface EmaniHeritageInvoiceProps {
  sale: Sale;
  settings: CompanySettings;
  customer?: Customer | null;
  lang?: 'ar' | 'en';
  onClose?: () => void;
  onPrint?: () => void;
  onShareWhatsApp?: () => void;
  showActions?: boolean;
  formatToggle?: React.ReactNode;
}

export const EmaniHeritageInvoice: React.FC<EmaniHeritageInvoiceProps> = ({
  sale,
  settings,
  customer,
  lang = 'ar',
  onClose,
  onPrint,
  onShareWhatsApp,
  showActions = true,
  formatToggle,
}) => {
  const customerName =
    sale.customerName ||
    customer?.name ||
    (lang === 'ar' ? 'عميل نقدي / ضيف إيماني' : 'Valued Guest');
  const customerPhone = customer?.phone || sale.customerPhone || settings.phone || '+973 36836849';
  const customerAddress = customer?.address || (lang === 'ar' ? 'المنامة، البحرين' : 'Manama, Bahrain');
  const customerId = customer?.code || customer?.id || 'C-000458';

  const paymentMethodLabel = (() => {
    if (!sale.payments || sale.payments.length === 0) return 'BenefitPay';
    const method = sale.payments[0].method;
    if (method === 'benefit_pay') return 'BenefitPay (بنفت بي)';
    if (method === 'card') return 'Credit Card (بطاقة مصرفية)';
    if (method === 'cash') return 'Cash (نقداً)';
    if (method === 'bank_transfer') return 'Bank Transfer (تحويل بنكي)';
    return method;
  })();

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleWhatsApp = () => {
    if (onShareWhatsApp) {
      onShareWhatsApp();
    } else {
      const cleanPhone = (customerPhone || settings.whatsapp || '97336836849').replace(/[^\d]/g, '');
      const text = encodeURIComponent(
        `مرحباً بك من إيماني آرت كرافت (Emani Art Craft) - البحرين 🇧🇭\nفاتورتكم الضريبية رقم #${sale.invoiceNumber} بقيمة ${sale.grandTotal.toFixed(3)} د.ب جاهزة.\nشكراً لاختياركم منتجاتنا التراثية!`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Clean, Non-Intrusive Action Bar (No noisy alerts or blinking dots) */}
      {showActions && (
        <div className="no-print w-full max-w-[850px] mb-3 flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-[#E9DDCA] shadow-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xs text-[#5C3D1E] tracking-wide">
              {lang === 'ar' ? 'فاتورة إيماني الرسمية' : 'Official Emani Invoice'}
            </span>
            {formatToggle && <div className="flex items-center">{formatToggle}</div>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#8B5E28] hover:bg-[#70491C] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'طباعة / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                title={lang === 'ar' ? 'إغلاق' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- REFINED HERITAGE INVOICE CONTAINER --- */}
      <div
        id="emani-heritage-invoice"
        dir="ltr"
        className="invoice-sheet relative w-full max-w-[850px] bg-[#FAF7F2] text-[#2A231A] shadow-xl rounded-sm overflow-hidden font-sans border border-[#DFC8A5] p-6 sm:p-8 md:p-9"
        style={{
          boxSizing: 'border-box',
          backgroundColor: '#FAF7F2',
          color: '#2A231A',
        }}
      >
        {/* Delicate Double Outer Frame Borders */}
        <div className="pointer-events-none absolute inset-2.5 sm:inset-3 border border-[#DFC8A5]"></div>
        <div className="pointer-events-none absolute inset-3 sm:inset-3.5 border border-[#EFE3CF]"></div>

        {/* Traditional Subtle Corner Filigrees */}
        <div className="pointer-events-none absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#8B5E28]"></div>
        <div className="pointer-events-none absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#8B5E28]"></div>
        <div className="pointer-events-none absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#8B5E28]"></div>
        <div className="pointer-events-none absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#8B5E28]"></div>

        {/* Top Hairline Ornamental Divider */}
        <div className="w-full flex items-center justify-center gap-3 mb-4 opacity-75">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8B5E28]/60 to-[#8B5E28]"></div>
          <div className="flex items-center gap-2 text-[#8B5E28] text-xs">
            <span>✧</span>
            <span className="text-sm">✦</span>
            <span>✧</span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#8B5E28]/60 to-[#8B5E28]"></div>
        </div>

        {/* ================= HEADER ================= */}
        <div className="relative z-10 flex flex-row items-center justify-between pb-4 border-b border-[#DFC8A5]/70 gap-4">
          {/* Left Header: Official Logo Emblem & Calligraphic Brand */}
          <div className="flex items-center gap-3.5">
            <img
              src="/emani-logo.svg"
              alt="Emani Art Craft Official Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xs shrink-0 bg-white/40 p-1 rounded-sm border border-[#DFC8A5]/50"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col items-start">
              <div
                className="text-2xl sm:text-3xl font-black text-[#8B5E28] tracking-tight select-none leading-none"
                style={{ fontFamily: "'Amiri', 'Cairo', serif" }}
              >
                إيماني آرت كرافت
              </div>
              <div
                className="text-sm sm:text-base font-bold tracking-[0.2em] text-[#8B5E28] uppercase font-serif mt-1"
                style={{ fontFamily: "'Outfit', serif" }}
              >
                EMANI ART CRAFT
              </div>
              <div className="flex items-center gap-2 mt-1 text-[#8B5E28] text-[10px] sm:text-[11px] italic tracking-wider">
                <span className="w-5 h-[1px] bg-[#8B5E28]"></span>
                <span className="font-serif">Handmade with Passion</span>
                <span className="w-5 h-[1px] bg-[#8B5E28]"></span>
              </div>
            </div>
          </div>

          {/* Right Header: Slogan & Story */}
          <div className="flex flex-col items-end text-right">
            <div
              className="text-xl sm:text-2xl font-bold text-[#8B5E28] select-none"
              style={{ fontFamily: "'Amiri', 'Cairo', serif" }}
            >
              حِـرَف بحريني ... تحكي قصة
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[#8B5E28]">
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase font-serif">
                HANDMADE CREATIONS THAT TELL A STORY
              </span>
              <span className="text-[#8B5E28] text-sm select-none">♡</span>
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
              CR: {settings.crNumber || '123456-1'}
            </div>
          </div>
        </div>

        {/* ================= METADATA DUAL CARDS ================= */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Card 1: Customer Details | بيانات العميل */}
          <div className="bg-[#FAF7F2] p-3.5 rounded-sm border border-[#DFC8A5]/90 flex flex-col justify-between text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-[#DFC8A5]/60 pb-1.5 text-[#8B5E28]">
              <span className="font-bold tracking-wide text-xs uppercase">Customer Details</span>
              <span className="font-bold text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>
                بيانات العميل
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-[#2A231A]">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-neutral-500 font-medium">Name / الاسم</span>
                <span className="font-bold text-neutral-900 text-right">{customerName}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-t border-[#DFC8A5]/30">
                <span className="text-neutral-500 font-medium">Phone / الهاتف</span>
                <span className="font-bold text-neutral-900 text-right font-mono dir-ltr">{customerPhone}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-t border-[#DFC8A5]/30">
                <span className="text-neutral-500 font-medium">Address / العنوان</span>
                <span className="font-semibold text-neutral-800 text-right">{customerAddress}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-t border-[#DFC8A5]/30">
                <span className="text-neutral-500 font-medium">Customer ID / كود العميل</span>
                <span className="font-bold font-mono text-[#8B5E28] text-right">{customerId}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Sales Invoice | فاتورة مبيعات */}
          <div className="bg-[#FAF7F2] p-3.5 rounded-sm border border-[#DFC8A5]/90 flex flex-col justify-between text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-[#DFC8A5]/60 pb-1.5 text-[#8B5E28]">
              <span className="font-bold tracking-wide text-xs uppercase">Sales Invoice</span>
              <span className="font-bold text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>
                فاتورة مبيعات ضريبية
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-[#2A231A]">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-neutral-500 font-medium">Invoice No. / رقم الفاتورة</span>
                <span className="font-bold text-neutral-900 font-mono text-right">
                  {sale.invoiceNumber || 'INV-2026-000125'}
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-t border-[#DFC8A5]/30">
                <span className="text-neutral-500 font-medium">Date / التاريخ</span>
                <span className="font-semibold text-neutral-900 text-right">
                  {sale.date} {sale.time ? `• ${sale.time}` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-t border-[#DFC8A5]/30">
                <span className="text-neutral-500 font-medium">Cashier / أمين الصندوق</span>
                <span className="font-semibold text-neutral-900 text-right">
                  {sale.cashierName ? sale.cashierName.split(' ')[0] : 'Ahmed'}
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-t border-[#DFC8A5]/30">
                <span className="text-neutral-500 font-medium">Payment / طريقة الدفع</span>
                <span className="font-bold text-emerald-800 text-right">
                  {paymentMethodLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ITEMS TABLE ================= */}
        <div className="relative z-10 mt-4 overflow-hidden border border-[#DFC8A5] rounded-none bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#EFE2CE] text-[#2A231A] font-bold border-b border-[#DFC8A5] text-[11px]">
                <th className="py-2 px-2.5 text-center w-10 border-r border-[#DFC8A5]/60">#</th>
                <th className="py-2 px-3 border-r border-[#DFC8A5]/60">Item / الصنف</th>
                <th className="py-2 px-2.5 text-center w-24 border-r border-[#DFC8A5]/60">SKU</th>
                <th className="py-2 px-2 text-center w-14 border-r border-[#DFC8A5]/60">Qty</th>
                <th className="py-2 px-2.5 text-center w-24 border-r border-[#DFC8A5]/60">Price (BHD)</th>
                <th className="py-2 px-2 text-center w-18 border-r border-[#DFC8A5]/60">Disc.</th>
                <th className="py-2 px-3 text-right w-24">Total (BHD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFC8A5]/40 text-neutral-800 text-[11px]">
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((it, idx) => {
                  const itemDiscount = it.discount || 0;
                  const itemTotal = it.price * it.quantity - itemDiscount;
                  const itemImg =
                    it.image ||
                    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=120&auto=format&fit=crop&q=80';

                  return (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-[#FAF7F2]/60' : 'bg-white'}>
                      <td className="py-2.5 px-2.5 text-center font-semibold text-neutral-500 border-r border-[#DFC8A5]/40">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-[#DFC8A5]/40">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={itemImg}
                            alt={it.nameEn || it.nameAr}
                            className="w-9 h-9 object-cover rounded-sm border border-[#DFC8A5]/70 shrink-0 bg-[#FAF7F2]"
                          />
                          <div className="leading-tight">
                            <div className="font-bold text-neutral-900">{it.nameEn || it.nameAr}</div>
                            <div
                              className="text-[10px] text-neutral-600 font-medium"
                              style={{ fontFamily: "'Cairo', sans-serif" }}
                            >
                              {it.nameAr || it.nameEn}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono text-[10px] text-neutral-600 border-r border-[#DFC8A5]/40">
                        {it.sku || `ITM-${100 + idx}`}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-neutral-900 border-r border-[#DFC8A5]/40">
                        {it.quantity}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono border-r border-[#DFC8A5]/40">
                        {it.price.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-neutral-500 border-r border-[#DFC8A5]/40">
                        {itemDiscount > 0 ? itemDiscount.toFixed(3) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                        {itemTotal.toFixed(3)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-neutral-400">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= SUMMARY & APPRECIATION ================= */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Elegant Appreciation Note (Clean, No warnings or alert notices) */}
          <div className="bg-[#FAF7F2] p-3.5 rounded-sm border border-[#DFC8A5]/90 flex flex-col justify-center text-center space-y-1.5">
            <p className="text-xs font-serif font-semibold text-neutral-800 tracking-wide">
              Thank you for choosing Emani Art Craft
            </p>
            <p
              className="text-sm font-bold text-[#8B5E28] flex items-center justify-center gap-1"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <span>شكراً لاختياركم إيماني آرت كرافت</span>
              <span className="text-base select-none">♡</span>
            </p>
            <p className="text-[10px] text-neutral-500 font-serif italic">
              Authentic Bahraini Craftsmanship & Cultural Heritage
            </p>
          </div>

          {/* Totals Table */}
          <div className="flex flex-col justify-between border border-[#DFC8A5] rounded-none bg-white text-xs">
            <div className="p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-neutral-700">
                <span className="font-medium text-[11px]">Subtotal / المجموع الفرعي</span>
                <span className="font-mono font-bold">{sale.subtotal.toFixed(3)} BHD</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700 border-t border-[#DFC8A5]/30 pt-1">
                <span className="font-medium text-[11px]">Discount / الخصم</span>
                <span className="font-mono font-bold">
                  {(sale.discountTotal || 0) > 0 ? `-${sale.discountTotal.toFixed(3)} BHD` : '0.000 BHD'}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-700 border-t border-[#DFC8A5]/30 pt-1">
                <span className="font-medium text-[11px]">VAT (10%) / الضريبة المضافة</span>
                <span className="font-mono font-bold">{sale.vatTotal.toFixed(3)} BHD</span>
              </div>
            </div>

            {/* Grand Total Solid Bronze Bar */}
            <div className="bg-[#6B441B] text-white px-3.5 py-2.5 flex items-center justify-between font-bold text-xs">
              <div>
                <span className="tracking-wide uppercase text-[11px]">Grand Total</span>
                <span className="mx-1.5 opacity-60">|</span>
                <span style={{ fontFamily: "'Cairo', sans-serif" }}>المجموع الكلي</span>
              </div>
              <span className="text-sm sm:text-base font-extrabold font-mono tracking-wider">
                {sale.grandTotal.toFixed(3)} BHD
              </span>
            </div>
          </div>
        </div>

        {/* ================= BAHRAIN HERITAGE ARCHITECTURAL SKYLINE ================= */}
        <div className="relative z-10 mt-5 pt-2 border-t border-[#DFC8A5]/60 overflow-hidden select-none opacity-75">
          <BahrainHeritageSkyline />
        </div>

        {/* ================= FOOTER CONTACT STRIP ================= */}
        <div className="relative z-10 pt-3 border-t border-[#DFC8A5]/80 flex flex-wrap items-center justify-between text-[10px] text-neutral-700 gap-2">
          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#8B5E28] shrink-0" />
            <span className="font-semibold text-neutral-900" style={{ fontFamily: "'Cairo', sans-serif" }}>
              سوق البراحة - بوابة 12 • محل 1051
            </span>
            <span className="text-neutral-400">|</span>
            <span className="text-neutral-500 font-serif">Souq Al Baraha, Gate 12</span>
          </div>

          {/* WhatsApp / Phone */}
          <div className="flex items-center gap-1 font-bold font-mono text-neutral-900">
            <Phone className="w-3 h-3 text-[#8B5E28]" />
            <span>+973 36836849</span>
          </div>

          {/* Instagram */}
          <div className="flex items-center gap-1 font-semibold text-neutral-900">
            <Instagram className="w-3 h-3 text-[#8B5E28]" />
            <span>@emani.art.craft</span>
          </div>

          {/* Tax Number */}
          <div className="text-neutral-500 font-mono text-[9px]">
            VAT: {settings.vatNumber || '200012345600002'}
          </div>
        </div>

        {/* Bottom Refined Golden Divider */}
        <div className="relative z-10 w-full flex items-center justify-center gap-2 mt-2 pt-1 border-t border-[#DFC8A5]/50 opacity-60 text-[#8B5E28] text-[9px]">
          <span>✧</span>
          <div className="h-[0.5px] flex-1 bg-[#8B5E28]/40"></div>
          <span className="font-serif italic text-[8px] uppercase tracking-widest text-[#8B5E28]">
            Emani Art Craft • Souq Al Baraha • Bahrain
          </span>
          <div className="h-[0.5px] flex-1 bg-[#8B5E28]/40"></div>
          <span>✧</span>
        </div>
      </div>
    </div>
  );
};

// --- High-Fidelity Bahrain Heritage Skyline Vector Artwork ---
const BahrainHeritageSkyline: React.FC = () => (
  <svg
    viewBox="0 0 900 135"
    className="w-full h-auto text-[#8B5E28]"
    fill="currentColor"
    preserveAspectRatio="xMidYMid meet"
  >
    {/* Base Sea Line */}
    <path d="M0 125 Q225 127 450 125 T900 125" stroke="#CBB28A" strokeWidth="1" fill="none" />

    {/* === LEFT: Palms & Historic Fort === */}
    <g opacity="0.9">
      {/* Palm 1 */}
      <path d="M25 125 Q30 90 40 65" stroke="#7A5020" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M40 65 Q20 55 5 65" stroke="#7A5020" strokeWidth="1.2" fill="none" />
      <path d="M40 65 Q35 48 25 40" stroke="#7A5020" strokeWidth="1.2" fill="none" />
      <path d="M40 65 Q55 48 70 52" stroke="#7A5020" strokeWidth="1.2" fill="none" />
      <path d="M40 65 Q65 60 80 70" stroke="#7A5020" strokeWidth="1.2" fill="none" />

      {/* Palm 2 */}
      <path d="M55 125 Q70 100 80 80" stroke="#7A5020" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M80 80 Q62 70 50 80" stroke="#7A5020" strokeWidth="1.2" fill="none" />
      <path d="M80 80 Q95 65 110 70" stroke="#7A5020" strokeWidth="1.2" fill="none" />
    </g>

    {/* Qal'at Al-Bahrain Citadel */}
    <g opacity="0.95">
      <path
        d="M95 125 L95 85 L110 85 L110 80 L125 80 L125 85 L140 85 L140 80 L155 80 L155 85 L215 85 L215 125 Z"
        fill="#EAD7BC"
        stroke="#8B5E28"
        strokeWidth="1.2"
      />
      <path
        d="M130 80 L130 50 L125 50 L125 42 L132 42 L132 45 L138 45 L138 42 L144 42 L144 45 L150 45 L150 42 L157 42 L157 45 L163 45 L163 42 L170 42 L170 50 L165 50 L165 80 Z"
        fill="#F0E1CA"
        stroke="#8B5E28"
        strokeWidth="1.2"
      />
      {/* Flagpole & Bahrain Flag */}
      <line x1="147" y1="42" x2="147" y2="20" stroke="#7A5020" strokeWidth="1.2" />
      <path d="M147 20 L172 20 L172 32 L147 32 Z" fill="#D32F2F" />
      <path d="M147 20 L155 20 L152 22.4 L155 24.8 L152 27.2 L155 29.6 L152 32 L147 32 Z" fill="#FFFFFF" />

      {/* Archway Door */}
      <path d="M140 125 L140 105 C140 100, 155 100, 155 105 L155 125 Z" fill="#7A5020" />
    </g>

    {/* === MIDDLE: Traditional Bahraini Dhow Sailing Boat === */}
    <g opacity="0.95">
      <path
        d="M390 125 C410 125, 485 126, 510 118 C495 127, 430 131, 390 125 Z"
        fill="#6D431B"
        stroke="#4A2B0E"
        strokeWidth="1.2"
      />
      <line x1="440" y1="125" x2="475" y2="45" stroke="#5A3615" strokeWidth="2" />
      <line x1="420" y1="120" x2="505" y2="47" stroke="#6D431B" strokeWidth="1.5" />
      <path d="M425 118 L500 50 Q465 80 440 123 Z" fill="#F4EADB" stroke="#8B5E28" strokeWidth="1" />
    </g>

    {/* === MODERN MANAMA: World Trade Center Twin Towers === */}
    <g opacity="0.65">
      <rect x="555" y="55" width="18" height="70" fill="#E5D3BC" stroke="#CBB28A" strokeWidth="0.8" />
      <polygon points="555,55 564,42 573,55" fill="#E5D3BC" stroke="#CBB28A" strokeWidth="0.8" />

      {/* Mosque Minaret & Dome */}
      <rect x="590" y="50" width="7" height="75" fill="#EADCC7" stroke="#8B5E28" strokeWidth="0.8" />
      <polygon points="590,50 593.5,35 597,50" fill="#8B5E28" />
      <path d="M602 125 L602 100 C602 87, 624 87, 624 100 L624 125 Z" fill="#EFE3CF" stroke="#8B5E28" strokeWidth="0.8" />

      {/* World Trade Center Sail 1 */}
      <path d="M660 125 L660 65 Q660 30 680 12 L684 125 Z" fill="#EAD7BE" stroke="#7A5020" strokeWidth="1.2" />
      {/* World Trade Center Sail 2 */}
      <path d="M708 125 L708 65 Q708 30 688 12 L684 125 Z" fill="#EAD7BE" stroke="#7A5020" strokeWidth="1.2" />

      {/* Wind Turbines */}
      <line x1="668" y1="40" x2="700" y2="40" stroke="#7A5020" strokeWidth="1.2" />
      <circle cx="684" cy="40" r="2.5" fill="none" stroke="#7A5020" strokeWidth="1" />
      <line x1="664" y1="62" x2="704" y2="62" stroke="#7A5020" strokeWidth="1.2" />
      <circle cx="684" cy="62" r="3" fill="none" stroke="#7A5020" strokeWidth="1" />
      <line x1="662" y1="85" x2="706" y2="85" stroke="#7A5020" strokeWidth="1.2" />
      <circle cx="684" cy="85" r="3.5" fill="none" stroke="#7A5020" strokeWidth="1" />

      {/* Harbour Towers */}
      <rect x="725" y="50" width="24" height="75" fill="#EFE3CF" stroke="#8B5E28" strokeWidth="0.8" />
      <rect x="752" y="38" width="20" height="87" fill="#E6D3B8" stroke="#8B5E28" strokeWidth="0.8" />
    </g>

    {/* === RIGHT: Historic Muharraq Windtower (Badgir) & Bab Al Bahrain === */}
    <g opacity="0.95">
      <rect x="785" y="60" width="22" height="65" fill="#F0E1CA" stroke="#8B5E28" strokeWidth="1.2" />
      <line x1="790" y1="65" x2="790" y2="90" stroke="#7A5020" strokeWidth="1.2" />
      <line x1="796" y1="65" x2="796" y2="90" stroke="#7A5020" strokeWidth="1.2" />
      <line x1="802" y1="65" x2="802" y2="90" stroke="#7A5020" strokeWidth="1.2" />

      {/* Bab Al Bahrain Main Arch */}
      <path d="M815 125 L815 55 C815 42, 875 42, 875 55 L875 125 Z" fill="#EAD7BC" stroke="#8B5E28" strokeWidth="1.2" />
      <path d="M830 125 L830 80 C830 60, 860 60, 860 80 L860 125 Z" fill="#6D431B" stroke="#8B5E28" strokeWidth="1.2" />
      <circle cx="845" cy="52" r="3.5" fill="#8B5E28" />

      {/* Wall extension */}
      <rect x="875" y="70" width="25" height="55" fill="#F0E1CA" stroke="#8B5E28" strokeWidth="1" />
    </g>
  </svg>
);

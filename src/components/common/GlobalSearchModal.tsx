// Emani Art Craft - Global Instant Search Modal

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Package,
  Users,
  Receipt,
  Palette,
  FileText,
  Truck,
  ArrowRight,
  Barcode,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language } from '../../types';
import { translations, formatBHDLocalized } from '../../services/i18n';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigate: (tab: string, targetId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigate,
}) => {
  const t = translations[lang];
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const products = StorageService.getProducts();
  const customers = StorageService.getCustomers();
  const sales = StorageService.getSales();
  const customOrders = StorageService.getCustomOrders();
  const quotations = StorageService.getQuotations();
  const suppliers = StorageService.getSuppliers();

  const matchedProducts = q
    ? products
        .filter(
          (p) =>
            p.nameAr.toLowerCase().includes(q) ||
            p.nameEn.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.barcode.includes(q) ||
            p.internalCode.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  const matchedCustomers = q
    ? customers
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.whatsapp.includes(q) ||
            (c.email && c.email.toLowerCase().includes(q))
        )
        .slice(0, 4)
    : [];

  const matchedSales = q
    ? sales
        .filter(
          (s) =>
            s.invoiceNumber.toLowerCase().includes(q) ||
            (s.customerName && s.customerName.toLowerCase().includes(q)) ||
            (s.customerPhone && s.customerPhone.includes(q))
        )
        .slice(0, 4)
    : [];

  const matchedCustomOrders = q
    ? customOrders
        .filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.productName.toLowerCase().includes(q) ||
            (o.arabicCalligraphyName && o.arabicCalligraphyName.includes(q))
        )
        .slice(0, 4)
    : [];

  const totalResults =
    matchedProducts.length +
    matchedCustomers.length +
    matchedSales.length +
    matchedCustomOrders.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E9DDCA] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E9DDCA] bg-[#FAF7F0]/60">
          <Search className="w-5 h-5 text-[#B8862B] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'ابحث باسم المنتج، الباركود، رقم الفاتورة، أو هاتف العميل...'
                : 'Search products, barcode, invoice #, or customer phone...'
            }
            className="flex-1 bg-transparent border-none text-sm text-[#252525] placeholder-neutral-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd
            onClick={onClose}
            className="cursor-pointer px-2 py-0.5 text-[11px] font-mono text-neutral-400 bg-neutral-100 border border-neutral-200 rounded hover:bg-neutral-200"
          >
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
          {!q && (
            <div className="text-center py-10 text-neutral-400">
              <Barcode className="w-8 h-8 mx-auto mb-2 text-[#B8862B]/50" />
              <p className="font-medium text-sm text-neutral-600">
                {lang === 'ar' ? 'البحث السريع في النظام' : 'Quick System Search'}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {lang === 'ar'
                  ? 'اكتب اسم المنتج أو امسح الباركود، أو اكتب رقم الفاتورة أو اسم العميل'
                  : 'Type a product name, scan barcode, or search invoice # or customer phone'}
              </p>
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="text-center py-8 text-neutral-400">
              <p className="text-sm">
                {lang === 'ar'
                  ? `لم يتم العثور على نتائج مطابقة لـ "${query}"`
                  : `No results found matching "${query}"`}
              </p>
            </div>
          )}

          {/* Matched Products */}
          {matchedProducts.length > 0 && (
            <div>
              <p className="px-2 text-[11px] font-bold text-[#8D641D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                {t.navProducts} ({matchedProducts.length})
              </p>
              <div className="space-y-1">
                {matchedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onNavigate('products', p.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF7F0] border border-transparent hover:border-[#E9DDCA] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={p.images[0] || 'https://placehold.co/80x80'}
                        alt={p.nameEn}
                        className="w-9 h-9 rounded-lg object-cover border border-[#E9DDCA]"
                      />
                      <div className="truncate text-start">
                        <p className="font-semibold text-neutral-800 truncate">
                          {lang === 'ar' ? p.nameAr : p.nameEn}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          SKU: {p.sku} • Barcode: {p.barcode} • Stock: {p.stockQuantity} {p.unit}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#B8862B] text-xs shrink-0">
                      {formatBHDLocalized(p.sellingPrice, lang)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Custom Orders */}
          {matchedCustomOrders.length > 0 && (
            <div>
              <p className="px-2 text-[11px] font-bold text-[#8D641D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                {t.navCustomOrders} ({matchedCustomOrders.length})
              </p>
              <div className="space-y-1">
                {matchedCustomOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      onNavigate('custom-orders', o.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF7F0] border border-transparent hover:border-[#E9DDCA] cursor-pointer transition-all"
                  >
                    <div className="truncate text-start">
                      <p className="font-semibold text-neutral-800">
                        #{o.orderNumber} • {o.customerName}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {o.productName} ({o.quantity} pcs) • Due: {o.deadline}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B8862B]/10 text-[#8D641D] capitalize">
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Customers */}
          {matchedCustomers.length > 0 && (
            <div>
              <p className="px-2 text-[11px] font-bold text-[#8D641D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {t.navCRM} ({matchedCustomers.length})
              </p>
              <div className="space-y-1">
                {matchedCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onNavigate('crm', c.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF7F0] border border-transparent hover:border-[#E9DDCA] cursor-pointer transition-all"
                  >
                    <div className="text-start">
                      <p className="font-semibold text-neutral-800">{c.name}</p>
                      <p className="text-[11px] text-neutral-400">
                        {c.phone} • {c.tags.join(', ')}
                      </p>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {c.loyaltyPoints} {lang === 'ar' ? 'نقطة' : 'pts'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Invoices */}
          {matchedSales.length > 0 && (
            <div>
              <p className="px-2 text-[11px] font-bold text-[#8D641D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'فواتير المبيعات' : 'Sales Invoices'} ({matchedSales.length})
              </p>
              <div className="space-y-1">
                {matchedSales.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onNavigate('dashboard');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF7F0] border border-transparent hover:border-[#E9DDCA] cursor-pointer transition-all"
                  >
                    <div className="text-start">
                      <p className="font-semibold text-neutral-800">
                        #{s.invoiceNumber} • {s.customerName || 'Walk-in'}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {s.date} {s.time} • {s.items.length} items
                      </p>
                    </div>
                    <span className="font-bold text-neutral-900">
                      {formatBHDLocalized(s.grandTotal, lang)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

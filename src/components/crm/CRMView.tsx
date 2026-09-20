// Emani Art Craft - Customer Relationship Management & Loyalty Engine

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Star,
  Phone,
  MessageCircle,
  ShoppingBag,
  CreditCard,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Gift,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, Customer } from '../../types';
import { translations, formatBHDLocalized } from '../../services/i18n';

interface CRMViewProps {
  lang: Language;
}

export const CRMView: React.FC<CRMViewProps> = ({ lang }) => {
  const t = translations[lang];
  const customers = StorageService.getCustomers();
  const sales = StorageService.getSales();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewHistoryCustomer, setViewHistoryCustomer] = useState<Customer | null>(null);

  // Form State
  const [formState, setFormState] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: 'Manama, Bahrain',
    tags: ['Regular'],
    notes: '',
  });

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormState({
      name: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: 'Riffa, Bahrain',
      tags: ['Regular'],
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormState({ ...c });
    setShowModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.phone) return;

    const count = customers.length + 1;
    const newCust: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      code: editingCustomer?.code || `CUST-${count.toString().padStart(3, '0')}`,
      name: formState.name!,
      phone: formState.phone!,
      whatsapp: formState.whatsapp || formState.phone!,
      email: formState.email,
      address: formState.address,
      tags: formState.tags || ['Regular'],
      totalPurchases: editingCustomer?.totalPurchases || 0,
      numberOfOrders: editingCustomer?.numberOfOrders || 0,
      balance: editingCustomer?.balance || 0,
      loyaltyPoints: editingCustomer?.loyaltyPoints || 0,
      notes: formState.notes,
      createdAt: editingCustomer?.createdAt || new Date().toISOString().split('T')[0],
    };

    StorageService.saveCustomer(newCust);
    setShowModal(false);
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.code.toLowerCase().includes(q);
    const matchTag = selectedTag === 'all' || c.tags.includes(selectedTag as any);
    return matchSearch && matchTag;
  });

  const customerSales = viewHistoryCustomer
    ? sales.filter((s) => s.customerId === viewHistoryCustomer.id)
    : [];

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#B8862B]" />
            {t.navCRM}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'إدارة قاعدة بيانات العملاء، برامج ولاء إيماني آرت كرافت، وسجل المشتريات والتواصل عبر واتساب'
              : 'Customer relationships, loyalty points, purchase histories, and WhatsApp outreach'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#B8862B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#8D641D] transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newCustomer}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E9DDCA] rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8862B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث بالاسم، رقم الهاتف، أو الرمز...' : 'Search by name or phone...'}
            className="w-full ps-9 pe-3 py-2 bg-[#FAF7F0]/60 border border-[#E9DDCA] rounded-xl text-xs text-[#252525] focus:outline-hidden"
          />
        </div>

        {/* Tags filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'VIP', 'Wedding Customer', 'Corporate Customer', 'Regular', 'Wholesale'].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? 'bg-[#B8862B] text-white'
                    : 'bg-[#FAF7F0] border border-[#E9DDCA] text-neutral-600 hover:bg-[#E9DDCA]/40'
                }`}
              >
                {tag === 'all' ? (lang === 'ar' ? 'كل التصنيفات' : 'All Tags') : tag}
              </button>
            )
          )}
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#B8862B] transition-all space-y-3"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-neutral-400 font-bold">{c.code}</span>
                  {c.tags.includes('VIP') && (
                    <span className="px-1.5 py-0.2 bg-[#B8862B] text-white font-bold rounded text-[9px]">
                      VIP
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-[#252525] mt-0.5">{c.name}</h3>
                <p className="text-xs text-neutral-500">{c.phone}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA]/60 text-center text-xs">
              <div>
                <p className="text-[10px] text-neutral-400">{lang === 'ar' ? 'المشتريات' : 'Spent'}</p>
                <p className="font-bold text-neutral-900 mt-0.5">
                  {formatBHDLocalized(c.totalPurchases, lang)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400">{lang === 'ar' ? 'الطلبات' : 'Orders'}</p>
                <p className="font-bold text-neutral-900 mt-0.5">{c.numberOfOrders}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400">{t.loyaltyPoints}</p>
                <p className="font-bold text-[#8D641D] mt-0.5 flex items-center justify-center gap-0.5">
                  <Star className="w-3 h-3 fill-[#8D641D]" />
                  {c.loyaltyPoints}
                </p>
              </div>
            </div>

            {/* Tags Pills */}
            <div className="flex flex-wrap gap-1">
              {c.tags.map((tg, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#FAF7F0] border border-[#E9DDCA] text-neutral-600 rounded-md text-[10px] font-medium"
                >
                  {tg}
                </span>
              ))}
            </div>

            {/* Actions: WhatsApp & History */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#E9DDCA]/60">
              <a
                href={`https://wa.me/973${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                  lang === 'ar'
                    ? `مرحباً بك ${c.name} في إيماني آرت كرافت! يسعدنا تواصلك دائماً.`
                    : `Hello ${c.name}, thank you for choosing Emani Art Craft Bahrain!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-2 bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>واتساب</span>
              </a>

              <button
                onClick={() => setViewHistoryCustomer(c)}
                className="px-3 py-1.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg text-[11px] font-bold transition-colors"
              >
                {lang === 'ar' ? 'سجل الفواتير' : 'Invoices'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Create / Edit Customer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">
                {editingCustomer ? (lang === 'ar' ? 'تعديل العميل' : 'Edit Customer') : t.newCustomer}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'اسم العميل' : 'Name'} *</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'رقم الهاتف' : 'Phone'} *</label>
                  <input
                    type="text"
                    required
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'رقم الواتساب' : 'WhatsApp'}</label>
                  <input
                    type="text"
                    value={formState.whatsapp}
                    onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'العنوان / المنطقة' : 'Address'}</label>
                <input
                  type="text"
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
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

      {/* MODAL 2: Customer Purchase History */}
      {viewHistoryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">
                {lang === 'ar' ? 'سجل مشتريات' : 'Purchase History'} - {viewHistoryCustomer.name}
              </h3>
              <button
                onClick={() => setViewHistoryCustomer(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {customerSales.length === 0 ? (
                <p className="text-center py-6 text-neutral-400">
                  {lang === 'ar' ? 'لا توجد فواتير سابقة مسجلة' : 'No recorded transactions'}
                </p>
              ) : (
                customerSales.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="font-mono font-bold text-[#8D641D]">#{s.invoiceNumber}</p>
                      <p className="text-[10px] text-neutral-500">
                        {s.date} {s.time} • {s.items.length} items
                      </p>
                    </div>
                    <span className="font-black text-sm text-neutral-900">
                      {formatBHDLocalized(s.grandTotal, lang)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

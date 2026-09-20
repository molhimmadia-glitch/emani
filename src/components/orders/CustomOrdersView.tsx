// Emani Art Craft - Custom Orders & Wedding Giveaways Management

import React, { useState } from 'react';
import {
  Palette,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Share2,
  FileText,
  DollarSign,
  AlertCircle,
  Eye,
  X,
  Sparkles,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, CustomOrder, CustomOrderStatus } from '../../types';
import { translations, formatBHDLocalized } from '../../services/i18n';
import {
  generateCustomOrderApprovalWhatsAppUrl,
  generateCustomOrderReadyWhatsAppUrl,
} from '../../services/whatsapp';

interface CustomOrdersViewProps {
  lang: Language;
}

export const CustomOrdersView: React.FC<CustomOrdersViewProps> = ({ lang }) => {
  const t = translations[lang];
  const settings = StorageService.getSettings();
  const customOrders = StorageService.getCustomOrders();
  const customers = StorageService.getCustomers();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);

  // Form state
  const [formState, setFormState] = useState<Partial<CustomOrder>>({
    customerName: '',
    customerPhone: '',
    eventType: 'Wedding',
    deadline: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    productName: 'Custom Mirrored Acrylic Box with 24k Gold Lettering',
    arabicCalligraphyName: '',
    quantity: 50,
    unitPrice: 2.200,
    totalPrice: 110.000,
    depositPaid: 50.000,
    remainingBalance: 60.000,
    customizationDescription: 'Royal Burgundy velvet ribbon and Bahrain pearl embellishment',
    packagingDetails: 'Luxury White Box with Gold Foil Logo',
  });

  const handleOpenCreate = () => {
    setSelectedOrder(null);
    setFormState({
      customerName: '',
      customerPhone: '',
      eventType: 'Wedding',
      deadline: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      productName: 'Custom Mirrored Acrylic Box with 24k Gold Lettering',
      arabicCalligraphyName: 'أحمد & مريم',
      quantity: 50,
      unitPrice: 2.200,
      totalPrice: 110.000,
      depositPaid: 50.000,
      remainingBalance: 60.000,
      customizationDescription: 'Luxury Burgundy velvet ribbon with Bahrain natural pearl embellishment',
      packagingDetails: 'Luxury White Box with Gold Foil Logo',
    });
    setShowModal(true);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.customerName || !formState.customerPhone) return;

    const count = customOrders.length + 1;
    const orderNumber = `CO-${new Date().getFullYear()}-${count.toString().padStart(5, '0')}`;
    const qty = Number(formState.quantity) || 1;
    const unitP = Number(formState.unitPrice) || 0;
    const totalP = qty * unitP;
    const dep = Number(formState.depositPaid) || 0;
    const rem = Math.max(0, totalP - dep);

    const newOrder: CustomOrder = {
      id: `co-${Date.now()}`,
      orderNumber,
      customerId: 'cust-walk-in',
      customerName: formState.customerName!,
      customerPhone: formState.customerPhone!,
      customerWhatsapp: formState.customerPhone!,
      eventType: formState.eventType || 'Wedding',
      deadline: formState.deadline || new Date().toISOString().split('T')[0],
      productName: formState.productName || 'Custom Craft',
      arabicCalligraphyName: formState.arabicCalligraphyName,
      customizationDescription: formState.customizationDescription || '',
      quantity: qty,
      unitPrice: unitP,
      totalPrice: totalP,
      depositPaid: dep,
      remainingBalance: rem,
      packagingDetails: formState.packagingDetails,
      status: 'new_request',
      statusHistory: [
        {
          status: 'new_request',
          timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          updatedBy: StorageService.getCurrentUser().nameEn,
          notes: 'Order received',
        },
      ],
      createdAt: new Date().toISOString().split('T')[0],
    };

    StorageService.saveCustomOrder(newOrder);
    setShowModal(false);
  };

  const handleStatusChange = (order: CustomOrder, newStatus: CustomOrderStatus) => {
    const note = prompt(
      lang === 'ar' ? 'ملاحظة على تغيير الحالة (اختياري):' : 'Status change note (optional):'
    );
    StorageService.updateCustomOrderStatus(order.id, newStatus, note || undefined);
  };

  const filtered = customOrders.filter((o) => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q) ||
      (o.arabicCalligraphyName && o.arabicCalligraphyName.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525] flex items-center gap-2">
            <Palette className="w-6 h-6 text-[#B8862B]" />
            {t.navCustomOrders}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'متابعة وتجهيز توزيعات الأعراس الفاخرة، هدايا الشركات، والطلبات الخاصة المخصصة بالأسماء والخط العربي'
              : 'Custom orders, wedding giveaways, corporate gifting, and Arabic calligraphy engravings'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#B8862B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#8D641D] transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newCustomOrder}</span>
        </button>
      </div>

      {/* Pipeline Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { id: 'all', label: lang === 'ar' ? 'الكل' : 'All', count: customOrders.length },
          {
            id: 'new_request',
            label: lang === 'ar' ? 'طلب جديد' : 'New',
            count: customOrders.filter((o) => o.status === 'new_request').length,
          },
          {
            id: 'customer_approval',
            label: lang === 'ar' ? 'بانتظار الموافقة' : 'Approval',
            count: customOrders.filter((o) => o.status === 'customer_approval').length,
          },
          {
            id: 'in_production',
            label: lang === 'ar' ? 'قيد التنفيذ' : 'In Production',
            count: customOrders.filter((o) => o.status === 'in_production').length,
          },
          {
            id: 'ready',
            label: lang === 'ar' ? 'جاهز للتسليم' : 'Ready',
            count: customOrders.filter((o) => o.status === 'ready').length,
          },
          {
            id: 'delivered',
            label: lang === 'ar' ? 'تم التسليم' : 'Delivered',
            count: customOrders.filter((o) => o.status === 'delivered').length,
          },
          {
            id: 'cancelled',
            label: lang === 'ar' ? 'ملغي' : 'Cancelled',
            count: customOrders.filter((o) => o.status === 'cancelled').length,
          },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setFilterStatus(s.id)}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              filterStatus === s.id
                ? 'bg-[#B8862B] text-white border-[#B8862B] font-bold shadow-xs'
                : 'bg-white border-[#E9DDCA] text-neutral-600 hover:bg-[#FAF7F0]'
            }`}
          >
            <p className="text-base font-black">{s.count}</p>
            <p className="text-[10px] truncate">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ord) => (
          <div
            key={ord.id}
            className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#B8862B] transition-all space-y-3"
          >
            {/* Top Bar */}
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#8D641D]">
                  #{ord.orderNumber}
                </span>
                <h3 className="font-bold text-sm text-[#252525] mt-0.5">{ord.customerName}</h3>
                <p className="text-[11px] text-neutral-500">{ord.customerPhone}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F0] border border-[#E9DDCA] text-[#8D641D] capitalize">
                {ord.status.replace('_', ' ')}
              </span>
            </div>

            {/* Event & Product Details */}
            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA]/60 space-y-1 text-xs">
              <div className="flex justify-between font-semibold text-neutral-700">
                <span>{lang === 'ar' ? 'المناسبة:' : 'Event:'}</span>
                <span className="text-[#B8862B]">{ord.eventType}</span>
              </div>
              <div className="flex justify-between font-semibold text-neutral-700">
                <span>{lang === 'ar' ? 'المنتج:' : 'Product:'}</span>
                <span className="truncate max-w-[150px]">{ord.productName}</span>
              </div>
              {ord.arabicCalligraphyName && (
                <div className="flex justify-between font-bold text-[#8D641D]">
                  <span>{lang === 'ar' ? 'الأسماء المحفورة:' : 'Engraving:'}</span>
                  <span>"{ord.arabicCalligraphyName}"</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600 pt-1 border-t border-[#E9DDCA]/60">
                <span>{lang === 'ar' ? 'الكمية المطلوبة:' : 'Quantity:'}</span>
                <span className="font-bold">{ord.quantity} pcs</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>{lang === 'ar' ? 'موعد التسليم:' : 'Deadline:'}</span>
                <span className="font-bold text-red-600">{ord.deadline}</span>
              </div>
            </div>

            {/* Financials & Balance */}
            <div className="flex justify-between text-xs font-semibold pt-1 border-t border-[#E9DDCA]/60">
              <div>
                <p className="text-neutral-400 text-[10px]">{lang === 'ar' ? 'الإجمالي' : 'Total'}</p>
                <p className="font-bold text-neutral-800">
                  {formatBHDLocalized(ord.totalPrice, lang)}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-[10px]">{lang === 'ar' ? 'الدفعة المقدمة' : 'Deposit'}</p>
                <p className="font-bold text-emerald-700">
                  {formatBHDLocalized(ord.depositPaid, lang)}
                </p>
              </div>
              <div className="text-end">
                <p className="text-neutral-400 text-[10px]">{lang === 'ar' ? 'المتبقي' : 'Remaining'}</p>
                <p className="font-bold text-amber-700">
                  {formatBHDLocalized(ord.remainingBalance, lang)}
                </p>
              </div>
            </div>

            {/* Actions: WhatsApp & Status Update */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-[#E9DDCA]/60">
              {/* WhatsApp Action: Send Design Approval */}
              <a
                href={generateCustomOrderApprovalWhatsAppUrl(ord, settings, lang)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-2 bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-700 transition-colors"
                title="Send Approval Link"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'اعتماد التصميم' : 'Approval'}</span>
              </a>

              {/* WhatsApp Action: Send Ready for Pickup Alert */}
              <a
                href={generateCustomOrderReadyWhatsAppUrl(ord, settings, lang)}
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-2.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                title="Send Pickup WhatsApp Alert"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'جاهز' : 'Ready'}</span>
              </a>

              {/* Status Selector */}
              <select
                value={ord.status}
                onChange={(e) => handleStatusChange(ord, e.target.value as CustomOrderStatus)}
                className="py-1.5 px-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-lg text-[11px] font-semibold text-neutral-800"
              >
                <option value="new_request">New</option>
                <option value="design_pending">Design Pending</option>
                <option value="customer_approval">Approval</option>
                <option value="approved">Approved</option>
                <option value="in_production">In Production</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Create Custom Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">{t.newCustomOrder}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'اسم العميل' : 'Customer Name'} *</label>
                  <input
                    type="text"
                    required
                    value={formState.customerName}
                    onChange={(e) => setFormState({ ...formState, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'رقم الواتساب' : 'WhatsApp'} *</label>
                  <input
                    type="text"
                    required
                    value={formState.customerPhone}
                    onChange={(e) => setFormState({ ...formState, customerPhone: e.target.value })}
                    placeholder="e.g. 39448821"
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'نوع المناسبة' : 'Event Type'}</label>
                  <select
                    value={formState.eventType}
                    onChange={(e) => setFormState({ ...formState, eventType: e.target.value as CustomOrder['eventType'] })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  >
                    <option value="Wedding">{lang === 'ar' ? 'زواج / أعراس' : 'Wedding'}</option>
                    <option value="Engagement">{lang === 'ar' ? 'خطوبة' : 'Engagement'}</option>
                    <option value="Corporate Event">{lang === 'ar' ? 'فعالية شركات' : 'Corporate Event'}</option>
                    <option value="National Day">{lang === 'ar' ? 'العيد الوطني' : 'National Day'}</option>
                    <option value="Ramadan">{lang === 'ar' ? 'رمضان وقرقاعون' : 'Ramadan'}</option>
                    <option value="Eid">{lang === 'ar' ? 'عيد الفطر' : 'Eid'}</option>
                    <option value="Graduation">{lang === 'ar' ? 'تخرج' : 'Graduation'}</option>
                    <option value="Birthday">{lang === 'ar' ? 'عيد ميلاد' : 'Birthday'}</option>
                    <option value="Other">{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'موعد التسليم' : 'Deadline'} *</label>
                  <input
                    type="date"
                    required
                    value={formState.deadline}
                    onChange={(e) => setFormState({ ...formState, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'وصف المنتج المطلوب' : 'Product Required'}</label>
                <input
                  type="text"
                  value={formState.productName}
                  onChange={(e) => setFormState({ ...formState, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'الأسماء أو العبارة للخط العربي' : 'Calligraphy Names'}</label>
                <input
                  type="text"
                  placeholder="e.g. أحمد & مريم 2026"
                  value={formState.arabicCalligraphyName}
                  onChange={(e) => setFormState({ ...formState, arabicCalligraphyName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-neutral-700">{t.quantity}</label>
                  <input
                    type="number"
                    min="1"
                    value={formState.quantity}
                    onChange={(e) => setFormState({ ...formState, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{t.unitPrice} (BHD)</label>
                  <input
                    type="number"
                    step="0.100"
                    value={formState.unitPrice}
                    onChange={(e) => setFormState({ ...formState, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'الدفعة المقدمة' : 'Deposit'} (BHD)</label>
                  <input
                    type="number"
                    step="0.100"
                    value={formState.depositPaid}
                    onChange={(e) => setFormState({ ...formState, depositPaid: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{lang === 'ar' ? 'تفاصيل التغليف' : 'Packaging'}</label>
                <input
                  type="text"
                  value={formState.packagingDetails}
                  onChange={(e) => setFormState({ ...formState, packagingDetails: e.target.value })}
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
    </div>
  );
};

// Emani Art Craft - WhatsApp Integration & Notifications

import { Sale, CustomOrder, Quotation, CompanySettings } from '../types';

export function sanitizePhone(phone: string): string {
  // Bahrain phone numbers often start with 973 or 3xxxxxxx / 6xxxxxxx
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 8) {
    // Standard Bahrain 8 digits
    cleaned = '973' + cleaned;
  }
  return cleaned;
}

export function generateReceiptWhatsAppUrl(
  sale: Sale,
  settings: CompanySettings,
  lang: 'ar' | 'en' = 'ar'
): string {
  const phone = sale.customerPhone ? sanitizePhone(sale.customerPhone) : '';
  const dateStr = sale.date;
  const itemsText = sale.items
    .map(
      (item) =>
        `• ${lang === 'ar' ? item.nameAr : item.nameEn} x${item.quantity} = ${item.price.toFixed(3)} BHD`
    )
    .join('\n');

  const text =
    lang === 'ar'
      ? `مرحباً بك من *${settings.companyNameAr}* ✨\n\nشكراً لزيارتك لنا وتسوقك من منتجاتنا الحرفية واليدوية!\n\n📋 *إيصال إلكتروني*: #${sale.invoiceNumber}\n📅 *التاريخ*: ${dateStr} - ${sale.time}\n👤 *العميل*: ${sale.customerName || 'عميل كريم'}\n\n*المنتجات*:\n${itemsText}\n\n💰 *المجموع الفرعي*: ${sale.subtotal.toFixed(3)} BHD\n🧾 *ضريبة القيمة المضافة (10%)*: ${sale.vatTotal.toFixed(3)} BHD\n💎 *الإجمالي الكلي*: *${sale.grandTotal.toFixed(3)} BHD*\nطريقة الدفع: ${sale.payments.map((p) => p.method).join(', ')}\n\nنسعد دائماً بخدمتكم في إيماني آرت كرافت 🇧🇭\nإنستغرام: ${settings.instagram}\nهاتف: ${settings.phone}`
      : `Hello from *${settings.companyNameEn}* ✨\n\nThank you for shopping our handcrafted treasures!\n\n📋 *Digital Receipt*: #${sale.invoiceNumber}\n📅 *Date*: ${dateStr} - ${sale.time}\n👤 *Customer*: ${sale.customerName || 'Valued Customer'}\n\n*Items*:\n${itemsText}\n\n💰 *Subtotal*: ${sale.subtotal.toFixed(3)} BHD\n🧾 *VAT (10%)*: ${sale.vatTotal.toFixed(3)} BHD\n💎 *Grand Total*: *${sale.grandTotal.toFixed(3)} BHD*\nPayment: ${sale.payments.map((p) => p.method).join(', ')}\n\nWe look forward to welcoming you again!\nInstagram: ${settings.instagram}\nPhone: ${settings.phone}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function generateCustomOrderApprovalWhatsAppUrl(
  order: CustomOrder,
  settings: CompanySettings,
  lang: 'ar' | 'en' = 'ar'
): string {
  const phone = sanitizePhone(order.customerWhatsapp || order.customerPhone);
  const text =
    lang === 'ar'
      ? `مرحباً ${order.customerName} العزيز/ة 🌸\nتحية طيبة من *${settings.companyNameAr}*.\n\nيسعدنا إبلاغك بأن مسودة التصميم لطلبك الخاص رقم *#${order.orderNumber}* (${order.productName} - كمية: ${order.quantity}) أصبحت جاهزة للاعتماد والمراجعة.\n\nتفاصيل الطلب:\n• المناسبة: ${order.eventType}\n• موعد التسليم: ${order.deadline}\n• المتبقي: ${order.remainingBalance.toFixed(3)} BHD\n\nيرجى مراجعة التصميم المرفق وموافاتنا بموافقتكم أو أي تعديل لبدء مرحلة التنفيذ اليدوي في الورشة.\n\nمع فائق التقدير والاحترام!`
      : `Dear ${order.customerName} 🌸\nGreetings from *${settings.companyNameEn}*.\n\nWe are pleased to inform you that the initial design draft for your custom order *#${order.orderNumber}* (${order.productName} - Qty: ${order.quantity}) is ready for your review and approval.\n\nOrder Details:\n• Event: ${order.eventType}\n• Delivery Deadline: ${order.deadline}\n• Remaining Balance: ${order.remainingBalance.toFixed(3)} BHD\n\nPlease let us know your feedback or confirmation to commence artisan production.\n\nWarm regards!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function generateOrderReadyWhatsAppUrl(
  order: CustomOrder,
  settings: CompanySettings,
  lang: 'ar' | 'en' = 'ar'
): string {
  const phone = sanitizePhone(order.customerWhatsapp || order.customerPhone);
  const text =
    lang === 'ar'
      ? `أهلاً بك ${order.customerName} 🌟\nيسعدنا إبلاغكم في *${settings.companyNameAr}* بأن طلبكم الخاص رقم *#${order.orderNumber}* قد اكتمل تجهيزه وتغليفه الفاخر بحرفية تامة وهو *جاهز الآن للاستلام* من فرعنا!\n\nتفاصيل الطلب:\n• المنتج: ${order.productName} (الكمية: ${order.quantity})\n• الرصيد المتبقي عند الاستلام: *${order.remainingBalance.toFixed(3)} BHD*\n• الموقع: ${settings.addressAr}\n\nساعات العمل: السبت - الخميس (9:00 ص - 10:00 م)\nنحن بانتظار تشريفكم!`
      : `Hello ${order.customerName} 🌟\nWe are delighted to inform you at *${settings.companyNameEn}* that your custom order *#${order.orderNumber}* has been handcrafted, packaged, and is *now ready for collection* at our showroom!\n\nOrder Summary:\n• Item: ${order.productName} (Qty: ${order.quantity})\n• Balance due on collection: *${order.remainingBalance.toFixed(3)} BHD*\n• Location: ${settings.addressEn}\n\nWe look forward to seeing you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export const generateCustomOrderReadyWhatsAppUrl = generateOrderReadyWhatsAppUrl;

export function generateQuotationWhatsAppUrl(
  quotation: Quotation,
  settings: CompanySettings,
  lang: 'ar' | 'en' = 'ar'
): string {
  const phone = sanitizePhone(quotation.customerPhone);
  const text =
    lang === 'ar'
      ? `مرحباً ${quotation.customerName} 🌷\nنرسل إليكم عرض السعر الرسمي رقم *#${quotation.quotationNumber}* من *${settings.companyNameAr}*.\n\nإجمالي عرض السعر: *${quotation.grandTotal.toFixed(3)} BHD* (شامل الضريبة 10%)\nصالح حتى: ${quotation.validUntil}\n\nالشروط والملاحظات:\n${quotation.terms || 'تسليم فوري أو حسب الاتفاق'}\n\nيسعدنا تواصلكم لتأكيد الطلب وبدء التجهيز.`
      : `Dear ${quotation.customerName} 🌷\nPlease find your official quotation *#${quotation.quotationNumber}* from *${settings.companyNameEn}*.\n\nTotal Quotation Value: *${quotation.grandTotal.toFixed(3)} BHD* (Incl. 10% VAT)\nValid Until: ${quotation.validUntil}\n\nTerms:\n${quotation.terms || 'Immediate delivery or upon custom production schedule'}\n\nFeel free to reach out to confirm your order!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

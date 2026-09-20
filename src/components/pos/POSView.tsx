// Emani Art Craft - High-Speed Touchscreen POS View

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Printer,
  Smartphone,
  Share2,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Layers,
  Sparkles,
  UserCheck,
  UserPlus,
  RefreshCw,
  Percent,
  Tag,
  Receipt,
  RotateCcw,
  ShoppingCart,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StorageService } from '../../services/storage';
import {
  Language,
  Product,
  ProductVariant,
  CartItem,
  SalePayment,
  PaymentMethod,
  Customer,
  Sale,
} from '../../types';
import { translations, formatBHDLocalized } from '../../services/i18n';
import { generateReceiptWhatsAppUrl } from '../../services/whatsapp';
import { EmaniHeritageInvoice } from '../common/EmaniHeritageInvoice';

interface POSViewProps {
  lang: Language;
}

export const POSView: React.FC<POSViewProps> = ({ lang }) => {
  const t = translations[lang];
  const settings = StorageService.getSettings();
  const products = StorageService.getProducts();
  const categories = StorageService.getCategories();
  const customers = StorageService.getCustomers();
  const activeShift = StorageService.getActiveShift();

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptFormat, setReceiptFormat] = useState<'heritage' | 'thermal'>('heritage');
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [showHeldSalesModal, setShowHeldSalesModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

  // Completed sale for receipt
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('benefit_pay');
  const [tenderedCash, setTenderedCash] = useState<string>('');
  const [benefitPayRef, setBenefitPayRef] = useState<string>('');
  const [cardAuthCode, setCardAuthCode] = useState<string>('');
  const [splitPayments, setSplitPayments] = useState<{ method: PaymentMethod; amount: number }[]>([]);

  // Barcode input ref for hardware scanners
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate totals
  const subtotalBeforeDiscount = cart.reduce((acc, it) => acc + (it.price * it.quantity - it.discount), 0);
  const cartDiscountAmount = (subtotalBeforeDiscount * overallDiscountPercent) / 100;
  const netTotalAfterDiscount = Math.max(0, subtotalBeforeDiscount - cartDiscountAmount);
  // Bahrain VAT calculation (VAT rate is 10%, selling prices are gross VAT inclusive)
  const vatRate = settings.vatRate || 0.10;
  const grandTotal = netTotalAfterDiscount;
  const subtotalNet = grandTotal / (1 + vatRate);
  const vatTotal = grandTotal - subtotalNet;

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Quick Barcode Scanning Handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const term = searchQuery.trim().toLowerCase();
    // 1. Check exact barcode match on product or variant
    let matchedProd: Product | undefined;
    let matchedVar: ProductVariant | undefined;

    for (const p of products) {
      if (p.barcode.toLowerCase() === term || p.sku.toLowerCase() === term) {
        matchedProd = p;
        break;
      }
      if (p.variants) {
        const v = p.variants.find(
          (vr) => vr.barcode.toLowerCase() === term || vr.sku.toLowerCase() === term
        );
        if (v) {
          matchedProd = p;
          matchedVar = v;
          break;
        }
      }
    }

    if (matchedProd) {
      if (matchedVar) {
        addToCartWithVariant(matchedProd, matchedVar);
      } else if (matchedProd.variants && matchedProd.variants.length > 0) {
        setVariantProduct(matchedProd);
      } else {
        addToCart(matchedProd);
      }
      setSearchQuery('');
    }
  };

  const addToCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setVariantProduct(product);
      return;
    }

    setIsCartOpen(true);
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === product.id && !item.variantId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          productId: product.id,
          nameEn: product.nameEn,
          nameAr: product.nameAr,
          sku: product.sku,
          price: product.sellingPrice,
          costPrice: product.costPrice,
          quantity: 1,
          vatRate: product.vatRate,
          discount: 0,
          image: product.images[0],
        };
        return [...prev, newItem];
      }
    });
  };

  const addToCartWithVariant = (product: Product, variant: ProductVariant) => {
    setIsCartOpen(true);
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.productId === product.id && item.variantId === variant.id
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          productId: product.id,
          variantId: variant.id,
          nameEn: `${product.nameEn} (${variant.nameEn})`,
          nameAr: `${product.nameAr} (${variant.nameAr})`,
          sku: variant.sku,
          price: variant.sellingPrice,
          costPrice: variant.costPrice,
          quantity: 1,
          vatRate: product.vatRate,
          discount: 0,
          image: variant.image || product.images[0],
        };
        return [...prev, newItem];
      }
    });
    setVariantProduct(null);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Hold & Resume
  const handleHoldSale = () => {
    if (cart.length === 0) return;
    const note = prompt(
      lang === 'ar' ? 'أدخل ملاحظة لتعليق الفاتورة (اختياري):' : 'Enter a note for held sale:'
    );
    StorageService.holdSale(cart, note || 'Held Order', selectedCustomerId);
    setCart([]);
    setSelectedCustomerId(undefined);
    setIsCartOpen(false);
  };

  const handleResumeSale = (held: { cart: CartItem[]; customerId?: string; id: string }) => {
    setCart(held.cart);
    setSelectedCustomerId(held.customerId);
    StorageService.deleteHeldSale(held.id);
    setShowHeldSalesModal(false);
    setIsCartOpen(true);
  };

  // Checkout process
  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setTenderedCash(grandTotal.toFixed(3));
    setBenefitPayRef(`BP-${Math.floor(10000000 + Math.random() * 90000000)}`);
    setShowPaymentModal(true);
  };

  const handleCompletePayment = () => {
    let payments: SalePayment[] = [];
    let changeGiven = 0;

    if (paymentMethod === 'cash') {
      const tendered = parseFloat(tenderedCash) || grandTotal;
      changeGiven = Math.max(0, tendered - grandTotal);
      payments.push({
        method: 'cash',
        amount: grandTotal,
      });
    } else if (paymentMethod === 'benefit_pay') {
      payments.push({
        method: 'benefit_pay',
        amount: grandTotal,
        reference: benefitPayRef,
      });
    } else if (paymentMethod === 'card') {
      payments.push({
        method: 'card',
        amount: grandTotal,
        reference: cardAuthCode || 'VISA/MC-AUTH',
      });
    } else if (paymentMethod === 'split') {
      payments = splitPayments;
    } else {
      payments.push({
        method: paymentMethod,
        amount: grandTotal,
      });
    }

    const sale = StorageService.completeSale({
      cart,
      payments,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      discountTotal: cartDiscountAmount,
      subtotal: subtotalNet,
      vatTotal,
      grandTotal,
      changeGiven,
    });

    setCompletedSale(sale);
    setShowPaymentModal(false);
    setShowReceiptModal(true);
    setCart([]);
    setSelectedCustomerId(undefined);
    setOverallDiscountPercent(0);
    setIsCartOpen(false);

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#B8862B', '#D4AF37', '#8D641D', '#FAF7F0'],
      });
    } catch (e) {}
  };

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    const matchesCategory = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.nameAr.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q);
    return matchesCategory && matchesSearch;
  });

  const heldSales = StorageService.getHeldSales();

  return (
    <div className="relative h-[calc(100vh-65px)] flex flex-col overflow-hidden bg-[#FAF7F0]">
      {/* MAIN AREA: Search, Category Pills, Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 lg:p-4 gap-3">
        {/* Top Control: Barcode Scanner, Search, Held Orders, and Cart Button */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleBarcodeSubmit} className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8862B]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'ar'
                  ? 'امسح الباركود أو ابحث باسم المنتج أو الرمز... [اضغط Enter]'
                  : 'Scan barcode or search product name / SKU... [Press Enter]'
              }
              className="w-full ps-9 pe-20 py-2.5 bg-white border border-[#E9DDCA] rounded-xl text-xs sm:text-sm text-[#252525] focus:outline-hidden focus:border-[#B8862B] shadow-xs"
            />
            <button
              type="submit"
              className="absolute end-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#FAF7F0] border border-[#E9DDCA] text-[#8D641D] rounded-lg text-xs font-bold hover:bg-[#B8862B] hover:text-white transition-colors"
            >
              {lang === 'ar' ? 'إدخال' : 'Enter'}
            </button>
          </form>

          {/* Held Orders Button */}
          <button
            onClick={() => setShowHeldSalesModal(true)}
            className="relative px-3 py-2.5 bg-white border border-[#E9DDCA] text-neutral-700 rounded-xl text-xs font-semibold hover:border-[#B8862B] transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
            title={t.heldSales}
          >
            <PauseCircle className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">{t.heldSales}</span>
            {heldSales.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {heldSales.length}
              </span>
            )}
          </button>

          {/* Cart Header Button */}
          <button
            id="pos-header-cart-toggle-btn"
            onClick={() => setIsCartOpen(!isCartOpen)}
            className={`relative px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 shadow-xs border ${
              cart.length > 0
                ? 'bg-[#B8862B] text-white border-[#9C7023] shadow-md hover:bg-[#8D641D]'
                : 'bg-white border-[#E9DDCA] text-neutral-700 hover:border-[#B8862B] hover:bg-[#FAF7F0]'
            }`}
            title={lang === 'ar' ? 'فتح سلة المشتريات' : 'Open shopping cart'}
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[17px] h-[17px] px-1 bg-rose-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">{lang === 'ar' ? 'السلة' : 'Cart'}</span>
            {cart.length > 0 && (
              <span className="font-extrabold text-[11px] sm:text-xs">
                {formatBHDLocalized(grandTotal, lang)}
              </span>
            )}
          </button>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategoryId === 'all'
                ? 'bg-[#B8862B] text-white shadow-xs'
                : 'bg-white border border-[#E9DDCA] text-neutral-600 hover:bg-[#FAF7F0]'
            }`}
          >
            {t.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategoryId === cat.id
                  ? 'bg-[#B8862B] text-white shadow-xs'
                  : 'bg-white border border-[#E9DDCA] text-neutral-600 hover:bg-[#FAF7F0]'
              }`}
            >
              {lang === 'ar' ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Product Touch Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
            {filteredProducts.map((product) => {
              const hasVariants = product.variants && product.variants.length > 0;
              const isLowStock = product.stockQuantity <= product.minStock;
              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group relative bg-white border border-[#E9DDCA] hover:border-[#B8862B] rounded-2xl p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-md active:scale-98 select-none"
                >
                  {/* Badges */}
                  <div className="absolute top-2 start-2 flex flex-col gap-1 z-10">
                    {product.customizable && (
                      <span className="px-1.5 py-0.5 bg-[#B8862B] text-white text-[9px] font-bold rounded-md shadow-xs">
                        {lang === 'ar' ? 'تخصيص' : 'Custom'}
                      </span>
                    )}
                    {hasVariants && (
                      <span className="px-1.5 py-0.5 bg-neutral-800 text-white text-[9px] font-bold rounded-md shadow-xs">
                        {product.variants.length} {lang === 'ar' ? 'خيارات' : 'Variants'}
                      </span>
                    )}
                  </div>

                  {/* Stock pill */}
                  <div className="absolute top-2 end-2 z-10">
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                        isLowStock
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {product.stockQuantity} {product.unit}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#FAF7F0] border border-[#E9DDCA]/60">
                    <img
                      src={product.images[0] || 'https://placehold.co/200x200'}
                      alt={product.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Title and Price */}
                  <div className="space-y-1 text-start">
                    <p className="text-xs font-bold text-[#252525] line-clamp-2 leading-tight">
                      {lang === 'ar' ? product.nameAr : product.nameEn}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {product.sku}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs sm:text-sm font-extrabold text-[#B8862B]">
                        {formatBHDLocalized(product.sellingPrice, lang)}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-[#FAF7F0] group-hover:bg-[#B8862B] group-hover:text-white flex items-center justify-center text-neutral-600 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FLOATING CART LAUNCHER ON THE RIGHT EDGE */}
      {!isCartOpen && (
        <button
          id="pos-floating-cart-icon"
          onClick={() => setIsCartOpen(true)}
          className={`fixed right-3 sm:right-5 top-28 sm:top-24 z-30 flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 rounded-2xl shadow-xl border transition-all duration-300 group hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-right-4 cursor-pointer ${
            cart.length > 0
              ? 'bg-gradient-to-r from-[#B8862B] to-[#8D641D] text-white border-[#D4AF37]/60 shadow-[#B8862B]/30 ring-2 ring-[#B8862B]/30'
              : 'bg-white text-neutral-700 border-[#E9DDCA] hover:border-[#B8862B] shadow-lg'
          }`}
          title={lang === 'ar' ? 'انقر لفتح سلة المشتريات' : 'Click to open cart'}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
            {cart.length > 0 && (
              <span className="absolute -top-2.5 -right-2.5 min-w-[20px] h-[20px] px-1 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                {cart.reduce((sum, it) => sum + it.quantity, 0)}
              </span>
            )}
          </div>
          <div className="hidden sm:flex flex-col text-start leading-tight">
            <span className="text-xs font-bold">{lang === 'ar' ? 'سلة المشتريات' : 'Cart'}</span>
            <span
              className={`text-[10px] font-extrabold ${
                cart.length > 0 ? 'text-amber-100' : 'text-neutral-400'
              }`}
            >
              {cart.length > 0 ? formatBHDLocalized(grandTotal, lang) : lang === 'ar' ? 'فارغة' : 'Empty'}
            </span>
          </div>
        </button>
      )}

      {/* BACKDROP OVERLAY */}
      {isCartOpen && (
        <div
          id="pos-cart-backdrop"
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* POP-OUT CART DRAWER FROM THE RIGHT */}
      <div
        id="pos-cart-drawer"
        className={`fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[440px] md:w-[480px] bg-white border-s border-[#E9DDCA] shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cart Drawer Header */}
        <div className="p-3.5 border-b border-[#E9DDCA] bg-[#FAF7F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B8862B] to-[#8D641D] text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#252525]">
                  {lang === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
                </h3>
                <span className="px-2 py-0.5 bg-[#B8862B]/15 text-[#8D641D] text-[10px] font-extrabold rounded-full">
                  {cart.reduce((s, it) => s + it.quantity, 0)} {lang === 'ar' ? 'عنصر' : 'items'}
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                {lang === 'ar' ? 'نقطة البيع السريعة' : 'Express Checkout'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title={t.clearCart}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="pos-cart-close-btn"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-neutral-500 hover:text-[#252525] rounded-lg hover:bg-[#E9DDCA]/60 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'إغلاق السلة' : 'Close Cart'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Header Bar */}
        <div className="p-3 border-b border-[#E9DDCA] bg-[#FAF7F0]/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 truncate">
            <UserCheck className="w-4 h-4 text-[#B8862B] shrink-0" />
            <select
              value={selectedCustomerId || ''}
              onChange={(e) => setSelectedCustomerId(e.target.value || undefined)}
              className="bg-transparent text-xs font-semibold text-[#252525] focus:outline-hidden truncate w-full cursor-pointer"
            >
              <option value="">{t.walkInCustomer}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - {c.loyaltyPoints} pts
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowQuickCustomerModal(true)}
            className="p-1.5 rounded-lg text-[#8D641D] hover:bg-[#E9DDCA]/60 text-xs font-bold shrink-0 cursor-pointer"
            title={t.quickAddCustomer}
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 p-6">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF7F0] border border-[#E9DDCA] flex items-center justify-center mb-3">
                <ShoppingCart className="w-8 h-8 text-[#B8862B]/50" />
              </div>
              <p className="text-sm font-bold text-neutral-700">{t.emptyCart}</p>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-[220px]">
                {lang === 'ar'
                  ? 'انقر على المنتجات من القائمة أو امسح الباركود لإضافتها للسلة'
                  : 'Tap products or scan barcodes to add to cart'}
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="p-2.5 rounded-xl border border-[#E9DDCA] bg-[#FAF7F0]/40 flex items-center justify-between gap-2 hover:bg-[#FAF7F0] transition-colors"
              >
                {/* Details */}
                <div className="flex-1 truncate text-start">
                  <p className="text-xs font-bold text-[#252525] truncate">
                    {lang === 'ar' ? item.nameAr : item.nameEn}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono">{item.sku}</p>
                  <p className="text-xs font-semibold text-[#B8862B] mt-0.5">
                    {formatBHDLocalized(item.price, lang)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 shrink-0 bg-white border border-[#E9DDCA] rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-600 hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs text-[#252525]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-600 hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-end shrink-0 w-16">
                  <p className="text-xs font-bold text-[#252525]">
                    {formatBHDLocalized(item.price * item.quantity, lang)}
                  </p>
                  <button
                    onClick={() => removeItem(item.cartItemId)}
                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors cursor-pointer"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5 ms-auto" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Totals & Action Buttons */}
        <div className="p-3.5 border-t border-[#E9DDCA] bg-[#FAF7F0]/80 space-y-2.5">
          {/* Subtotal, Discount, VAT */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>{t.subtotal}</span>
              <span>{formatBHDLocalized(subtotalBeforeDiscount, lang)}</span>
            </div>

            {/* Quick Discount Selector */}
            <div className="flex items-center justify-between text-neutral-600">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3 text-[#B8862B]" />
                {t.itemDiscount}
              </span>
              <div className="flex items-center gap-1">
                {[0, 5, 10, 15].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setOverallDiscountPercent(pct)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      overallDiscountPercent === pct
                        ? 'bg-[#B8862B] text-white'
                        : 'bg-white border border-[#E9DDCA] text-neutral-600'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-neutral-500 text-[11px]">
              <span>{t.taxVat} (10%)</span>
              <span>{formatBHDLocalized(vatTotal, lang)}</span>
            </div>

            <div className="flex justify-between text-sm sm:text-base font-extrabold text-[#252525] pt-1.5 border-t border-[#E9DDCA]">
              <span>{t.grandTotal}</span>
              <span className="text-[#8D641D]">{formatBHDLocalized(grandTotal, lang)}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleHoldSale}
              disabled={cart.length === 0}
              className="py-2.5 px-3 bg-white border border-[#E9DDCA] text-neutral-700 font-semibold rounded-xl text-xs hover:border-[#B8862B] hover:text-[#B8862B] disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PauseCircle className="w-4 h-4 text-amber-600" />
              {t.holdSale}
            </button>

            <button
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              className="py-2.5 px-3 bg-white border border-red-200 text-red-600 font-semibold rounded-xl text-xs hover:bg-red-50 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {t.clearCart}
            </button>
          </div>

          {/* Primary Checkout Button */}
          <button
            onClick={handleOpenPayment}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-[#B8862B] to-[#8D641D] text-white font-extrabold rounded-xl text-sm shadow-md hover:brightness-105 active:scale-99 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {t.checkout} • {formatBHDLocalized(grandTotal, lang)}
            </span>
          </button>
        </div>
      </div>

      {/* --- MODAL 1: Product Variant Selector --- */}
      {variantProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#252525]">
                  {lang === 'ar' ? variantProduct.nameAr : variantProduct.nameEn}
                </h3>
                <p className="text-xs text-[#B8862B] font-semibold">
                  {lang === 'ar' ? 'اختر الخيار / النقشة المطلوبة' : 'Select desired variant / pattern'}
                </p>
              </div>
              <button
                onClick={() => setVariantProduct(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {variantProduct.variants.map((v) => (
                <div
                  key={v.id}
                  onClick={() => addToCartWithVariant(variantProduct, v)}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E9DDCA] hover:border-[#B8862B] hover:bg-[#FAF7F0] cursor-pointer transition-all"
                >
                  <div className="text-start">
                    <p className="font-bold text-xs text-neutral-900">
                      {lang === 'ar' ? v.nameAr : v.nameEn}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      SKU: {v.sku} • Stock: {v.stockQuantity}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-[#B8862B]">
                    {formatBHDLocalized(v.sellingPrice, lang)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Checkout & Payment Modal --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#252525]">{t.checkout}</h3>
                <p className="text-xs text-[#8D641D] font-bold">
                  {lang === 'ar' ? 'المبلغ المطلوب سداده:' : 'Amount Due:'}{' '}
                  {formatBHDLocalized(grandTotal, lang)}
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Selector Pills */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                { id: 'benefit_pay', label: t.benefitPay, icon: QrCode, highlight: true },
                { id: 'cash', label: t.cash, icon: Banknote },
                { id: 'card', label: t.card, icon: CreditCard },
                { id: 'bank_transfer', label: t.bankTransfer, icon: Smartphone },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      isSelected
                        ? 'border-[#B8862B] bg-[#FAF7F0] text-[#8D641D] font-bold shadow-xs'
                        : 'border-[#E9DDCA] text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] leading-tight">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Payment Specific Fields */}
            {paymentMethod === 'benefit_pay' && (
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E9DDCA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#8D641D] flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    BenefitPay (البحرين)
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    IBAN: BH92NBOB000012345678
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={benefitPayRef}
                    onChange={(e) => setBenefitPayRef(e.target.value)}
                    placeholder="رقم مرجع بنفت باي (BenefitPay Reference)"
                    className="flex-1 px-3 py-2 bg-white border border-[#E9DDCA] rounded-lg text-xs"
                  />
                  <button
                    onClick={() =>
                      setBenefitPayRef(`BP-${Math.floor(10000000 + Math.random() * 90000000)}`)
                    }
                    className="px-2.5 py-2 bg-white border border-[#E9DDCA] rounded-lg text-[10px] font-bold text-[#8D641D]"
                  >
                    {lang === 'ar' ? 'توليد مرجع' : 'Generate'}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500">
                  {lang === 'ar'
                    ? 'يمكن للعميل مسح QR Code الخاص بالمتجر أو التحويل على رقم الهاتف 39448821'
                    : 'Customer can scan the store BenefitPay QR or transfer to phone +973 39448821'}
                </p>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E9DDCA] space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-neutral-800">{t.tenderedAmount}:</label>
                  <input
                    type="number"
                    step="0.100"
                    value={tenderedCash}
                    onChange={(e) => setTenderedCash(e.target.value)}
                    className="w-32 px-3 py-1.5 bg-white border border-[#E9DDCA] rounded-lg text-end font-bold text-sm"
                  />
                </div>

                {/* Quick denomination pills (Bahraini Dinars: 5, 10, 20, 50 BHD) */}
                <div className="flex gap-2 justify-end">
                  {[5, 10, 20, 50].map((denom) => (
                    <button
                      key={denom}
                      onClick={() => setTenderedCash(denom.toFixed(3))}
                      className="px-2.5 py-1 bg-white border border-[#E9DDCA] rounded-md font-bold text-neutral-700 hover:border-[#B8862B]"
                    >
                      {denom} {t.bhd}
                    </button>
                  ))}
                </div>

                {/* Change Calculation */}
                {parseFloat(tenderedCash) >= grandTotal && (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <span className="font-bold">{t.changeDue}:</span>
                    <span className="font-extrabold text-sm">
                      {formatBHDLocalized(parseFloat(tenderedCash) - grandTotal, lang)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E9DDCA] space-y-2">
                <label className="font-bold text-neutral-800">
                  {lang === 'ar' ? 'رمز الموافقة من جهاز نقاط البيع:' : 'POS Card Approval Code:'}
                </label>
                <input
                  type="text"
                  value={cardAuthCode}
                  onChange={(e) => setCardAuthCode(e.target.value)}
                  placeholder="e.g. AUTH-98214"
                  className="w-full px-3 py-2 bg-white border border-[#E9DDCA] rounded-lg"
                />
              </div>
            )}

            {/* Confirm Payment Button */}
            <button
              onClick={handleCompletePayment}
              className="w-full py-3 bg-[#B8862B] text-white rounded-xl font-bold text-sm hover:bg-[#8D641D] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t.completeSale}
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Printable Emani Heritage Invoice & WhatsApp Share --- */}
      {showReceiptModal && completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div
            className={`w-full ${
              receiptFormat === 'heritage' ? 'max-w-4xl' : 'max-w-sm'
            } my-auto transition-all duration-200`}
          >
            {/* View Choice 1: Official Emani Heritage Invoice */}
            {receiptFormat === 'heritage' ? (
              <EmaniHeritageInvoice
                sale={completedSale}
                settings={settings}
                customer={customers.find((c) => c.id === completedSale.customerId)}
                lang={lang}
                onClose={() => setShowReceiptModal(false)}
                showActions={true}
                formatToggle={
                  <div className="inline-flex rounded-xl bg-[#FAF7F0] p-0.5 border border-[#E9DDCA]">
                    <button
                      onClick={() => setReceiptFormat('heritage')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#8B5E28] text-white shadow-xs cursor-pointer"
                    >
                      {lang === 'ar' ? 'فاتورة A4' : 'A4 Invoice'}
                    </button>
                    <button
                      onClick={() => setReceiptFormat('thermal')}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-neutral-600 hover:text-neutral-900 cursor-pointer"
                    >
                      {lang === 'ar' ? 'حراري 80mm' : 'Thermal'}
                    </button>
                  </div>
                }
              />
            ) : (
              /* View Choice 2: Compact 80mm Thermal Receipt */
              <div className="bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl flex flex-col space-y-4">
                {/* Clean Top Bar for Thermal Receipt */}
                <div className="flex items-center justify-between pb-2 border-b border-[#E9DDCA]">
                  <div className="inline-flex rounded-xl bg-[#FAF7F0] p-0.5 border border-[#E9DDCA]">
                    <button
                      onClick={() => setReceiptFormat('heritage')}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-neutral-600 hover:text-neutral-900 cursor-pointer"
                    >
                      {lang === 'ar' ? 'فاتورة A4' : 'A4 Invoice'}
                    </button>
                    <button
                      onClick={() => setReceiptFormat('thermal')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#8B5E28] text-white shadow-xs cursor-pointer"
                    >
                      {lang === 'ar' ? 'حراري 80mm' : 'Thermal'}
                    </button>
                  </div>

                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div
                  id="printable-receipt"
                  className="bg-[#FAF7F0]/40 p-4 rounded-xl border border-dashed border-[#E9DDCA] font-mono text-[11px] text-neutral-800 space-y-3 leading-relaxed"
                >
                  {/* Receipt Header */}
                  <div className="text-center space-y-1 pb-2 border-b border-dashed border-neutral-300 flex flex-col items-center">
                    <img
                      src="/emani-logo.svg"
                      alt="Emani Art Craft"
                      className="w-12 h-12 object-contain mb-1"
                      referrerPolicy="no-referrer"
                    />
                    <p className="font-bold text-xs uppercase tracking-wider">{settings.companyNameAr}</p>
                    <p className="text-[10px] text-neutral-600 font-serif">{settings.companyNameEn}</p>
                    <p className="text-[9px] text-neutral-500">{settings.addressAr}</p>
                    <p className="text-[9px] text-neutral-500">
                      ست: {settings.crNumber} • الرقم الضريبي: {settings.vatNumber}
                    </p>
                    <p className="text-[9px] font-bold text-[#8D641D]">فاتورة ضريبية مبسطة / Tax Invoice</p>
                  </div>

                  {/* Invoice Meta */}
                  <div className="flex justify-between text-[10px] pb-1 border-b border-dashed border-neutral-200">
                    <div>
                      <p>رقم الفاتورة: #{completedSale.invoiceNumber}</p>
                      <p>التاريخ: {completedSale.date} {completedSale.time}</p>
                    </div>
                    <div className="text-end">
                      <p>الكاشير: {completedSale.cashierName.split(' ')[0]}</p>
                      <p>العميل: {completedSale.customerName || 'عميل عام'}</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="space-y-1.5 py-1">
                    {completedSale.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div className="max-w-[180px]">
                          <p className="font-bold">{lang === 'ar' ? it.nameAr : it.nameEn}</p>
                          <p className="text-[9px] text-neutral-500">
                            {it.quantity} x {it.price.toFixed(3)} BHD
                          </p>
                        </div>
                        <span className="font-bold">
                          {(it.price * it.quantity).toFixed(3)} BHD
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="pt-2 border-t border-dashed border-neutral-300 space-y-1">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي (غير شامل):</span>
                      <span>{completedSale.subtotal.toFixed(3)} BHD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ضريبة القيمة المضافة (10%):</span>
                      <span>{completedSale.vatTotal.toFixed(3)} BHD</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-neutral-300">
                      <span>الإجمالي شامل الضريبة:</span>
                      <span>{completedSale.grandTotal.toFixed(3)} BHD</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-600">
                      <span>طريقة الدفع:</span>
                      <span>{completedSale.payments.map((p) => p.method).join(', ')}</span>
                    </div>
                    {completedSale.changeGiven > 0 && (
                      <div className="flex justify-between text-[10px] text-neutral-600">
                        <span>المبلغ المتبقي للعميل:</span>
                        <span>{completedSale.changeGiven.toFixed(3)} BHD</span>
                      </div>
                    )}
                  </div>

                  {/* Receipt Footer */}
                  <div className="text-center text-[9px] text-neutral-500 pt-2 border-t border-dashed border-neutral-300">
                    <p>{settings.receiptFooterAr}</p>
                    <p className="mt-1">إنستغرام: {settings.instagram} • هاتف: {settings.phone}</p>
                  </div>
                </div>

                <div className="flex gap-2 no-print">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-black transition-colors shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    {t.printReceipt}
                  </button>
                  <a
                    href={generateReceiptWhatsAppUrl(completedSale, settings, lang)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors text-center shadow-xs"
                  >
                    <Share2 className="w-4 h-4" />
                    {t.digitalReceipt}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 4: Quick Customer Creation Modal --- */}
      {showQuickCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">{t.quickAddCustomer}</h3>
              <button
                onClick={() => setShowQuickCustomerModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem('custName') as HTMLInputElement).value;
                const phone = (form.elements.namedItem('custPhone') as HTMLInputElement).value;
                if (!name || !phone) return;

                const count = StorageService.getCustomers().length + 1;
                const newCustomer: Customer = {
                  id: `cust-${Date.now()}`,
                  code: `CUST-${count.toString().padStart(3, '0')}`,
                  name,
                  phone,
                  whatsapp: phone,
                  tags: ['Regular'],
                  totalPurchases: 0,
                  numberOfOrders: 0,
                  balance: 0,
                  loyaltyPoints: 0,
                  createdAt: new Date().toISOString().split('T')[0],
                };
                StorageService.saveCustomer(newCustomer);
                setSelectedCustomerId(newCustomer.id);
                setShowQuickCustomerModal(false);
              }}
              className="space-y-2.5"
            >
              <div>
                <label className="font-bold text-neutral-700">
                  {lang === 'ar' ? 'اسم العميل' : 'Customer Name'} *
                </label>
                <input
                  name="custName"
                  required
                  placeholder="e.g. Maryam Al-Nuaimi"
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-neutral-700">
                  {lang === 'ar' ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'} *
                </label>
                <input
                  name="custPhone"
                  required
                  placeholder="e.g. 39912345"
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-lg mt-1"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#B8862B] text-white rounded-xl font-bold hover:bg-[#8D641D] mt-2 transition-colors"
              >
                {t.save}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: Held Orders Modal --- */}
      {showHeldSalesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">{t.heldSales}</h3>
              <button
                onClick={() => setShowHeldSalesModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {heldSales.length === 0 ? (
                <p className="text-center py-6 text-neutral-400">
                  {lang === 'ar' ? 'لا توجد فواتير معلقة' : 'No held orders parked'}
                </p>
              ) : (
                heldSales.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl border border-[#E9DDCA] bg-[#FAF7F0] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-neutral-800">{h.note}</p>
                      <p className="text-[10px] text-neutral-500">
                        {h.timestamp} • {h.cart.length} items
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleResumeSale(h)}
                        className="px-2.5 py-1.5 bg-[#B8862B] text-white font-bold rounded-lg hover:bg-[#8D641D] transition-colors"
                      >
                        {t.resumeSale}
                      </button>
                      <button
                        onClick={() => StorageService.deleteHeldSale(h.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

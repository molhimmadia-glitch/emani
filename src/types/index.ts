// Emani Art Craft - Core Types

export type Language = 'ar' | 'en';

export type NavRoute =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'categories'
  | 'collections'
  | 'inventory'
  | 'custom-orders'
  | 'quotations'
  | 'crm'
  | 'purchasing'
  | 'purchases'
  | 'expenses'
  | 'accounting'
  | 'shifts'
  | 'users'
  | 'settings';

export type UserRole =
  | 'super_admin'
  | 'owner'
  | 'manager'
  | 'cashier'
  | 'sales_employee'
  | 'inventory_employee'
  | 'accountant'
  | 'designer'
  | 'production_employee';

export interface UserPermission {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'pos' | 'products' | 'inventory' | 'orders' | 'accounting' | 'reports' | 'users' | 'settings';
}

export interface User {
  id: string;
  username: string;
  nameEn: string;
  nameAr: string;
  role: UserRole;
  email: string;
  phone: string;
  pin: string; // 4-digit PIN for quick cashier login
  active: boolean;
  avatar?: string;
  customPermissions?: string[]; // overrides or additions
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  icon?: string;
  parentId?: string;
  displayOrder: number;
}

export interface Collection {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
  active: boolean;
  bannerImage?: string;
}

export interface ProductVariant {
  id: string;
  nameEn: string;
  nameAr: string;
  sku: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  stockQuantity: number;
  image?: string;
  attributes: {
    color?: string;
    design?: string;
    size?: string;
    material?: string;
  };
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  internalCode: string;
  nameEn: string;
  nameAr: string;
  categoryId: string;
  subcategoryId?: string;
  collectionIds: string[];
  descriptionEn: string;
  descriptionAr: string;
  images: string[];
  supplierId?: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  specialPrice?: number;
  vatRate: number; // e.g., 0.10 for 10%
  stockQuantity: number; // total stock across warehouses
  minStock: number;
  reorderLevel: number;
  storageLocation: {
    warehouseId: string;
    shelf?: string;
    aisle?: string;
  };
  unit: 'piece' | 'set' | 'box' | 'pair' | 'custom';
  size?: string;
  color?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  customizable: boolean;
  handmade: boolean;
  active: boolean;
  featured: boolean;
  notes?: string;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  address: string;
  responsibleEmployee: string;
  shelves: string[];
  isDefault: boolean;
}

export type InventoryMovementType =
  | 'stock_in'
  | 'stock_out'
  | 'adjustment_add'
  | 'adjustment_sub'
  | 'transfer_in'
  | 'transfer_out'
  | 'damaged'
  | 'lost'
  | 'sale'
  | 'sale_return'
  | 'purchase_received';

export interface InventoryMovement {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  movementType: InventoryMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  warehouseId: string;
  warehouseName: string;
  userId: string;
  userName: string;
  date: string;
  time: string;
  reference: string;
  reason: string;
  notes?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  items: {
    productId: string;
    variantId?: string;
    productName: string;
    quantity: number;
  }[];
  requestedBy: string;
  approvedBy?: string;
  date: string;
  notes?: string;
}

export type CustomerTag = 'VIP' | 'Regular' | 'Wholesale' | 'Wedding Customer' | 'Corporate Customer' | 'Online Customer';

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  nationality?: string;
  birthday?: string;
  address?: string;
  tags: CustomerTag[];
  notes?: string;
  totalPurchases: number;
  numberOfOrders: number;
  lastPurchaseDate?: string;
  balance: number; // positive = customer owes store, negative = store credit
  loyaltyPoints: number;
  createdAt: string;
}

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'benefit_pay'
  | 'bank_transfer'
  | 'split'
  | 'store_credit'
  | 'other';

export interface CartItem {
  cartItemId: string;
  productId: string;
  variantId?: string;
  nameEn: string;
  nameAr: string;
  sku: string;
  price: number;
  costPrice: number;
  quantity: number;
  vatRate: number;
  discount: number; // per item discount amount in BHD
  customizationNote?: string;
  image?: string;
}

export interface SalePayment {
  method: PaymentMethod;
  amount: number;
  reference?: string; // BenefitPay ref or card auth code
}

export interface Sale {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-00001
  date: string;
  time: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  vatTotal: number;
  grandTotal: number;
  payments: SalePayment[];
  changeGiven: number;
  status: 'completed' | 'returned' | 'partially_returned' | 'cancelled';
  notes?: string;
  shiftId?: string;
  isHeld?: boolean;
}

export interface SaleReturn {
  id: string;
  returnNumber: string; // RET-2026-00001
  originalInvoiceNumber: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  customerId?: string;
  customerName?: string;
  refundMethod: PaymentMethod | 'store_credit';
  items: {
    productId: string;
    variantId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    itemCondition: 'return_to_stock' | 'damaged' | 'not_resellable';
  }[];
  refundTotal: number;
  reason: string;
  warehouseId: string;
}

export interface PosShift {
  id: string;
  shiftNumber: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  closingCashEntered?: number;
  expectedCash?: number;
  cashDifference?: number;
  totalSalesCash: number;
  totalSalesCard: number;
  totalSalesBenefitPay: number;
  totalSalesOther: number;
  totalCashIn: number;
  totalCashOut: number;
  totalRefundsCash: number;
  transactionsCount: number;
  status: 'open' | 'closed';
  notes?: string;
}

export type CustomOrderStatus =
  | 'new_request'
  | 'design_pending'
  | 'customer_approval'
  | 'approved'
  | 'in_production'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface CustomOrder {
  id: string;
  orderNumber: string; // CO-2026-00001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  eventType: 'Wedding' | 'Engagement' | 'Birthday' | 'Graduation' | 'Corporate Event' | 'National Day' | 'Ramadan' | 'Eid' | 'Other';
  eventDate?: string;
  deadline: string;
  productId?: string;
  productName: string;
  quantity: number;
  customizationDescription: string;
  arabicCalligraphyName?: string;
  englishName?: string;
  requestedColors?: string;
  packagingDetails?: string;
  artworkImages?: string[];
  unitPrice: number;
  totalPrice: number;
  depositPaid: number;
  remainingBalance: number;
  assignedEmployee?: string;
  status: CustomOrderStatus;
  statusHistory: {
    status: CustomOrderStatus;
    timestamp: string;
    updatedBy: string;
    notes?: string;
  }[];
  createdAt: string;
  notes?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string; // QT-2026-00001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  validUntil: string;
  items: {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    vatRate: number;
    total: number;
  }[];
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
  terms: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'converted';
  convertedTo?: 'sales_order' | 'invoice' | 'custom_order';
  convertedRefNumber?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  crNumber?: string;
  productsSupplied: string[];
  paymentTerms: string;
  outstandingBalance: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // PO-2026-00001
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDeliveryDate?: string;
  items: {
    productId: string;
    variantId?: string;
    productName: string;
    quantity: number;
    receivedQuantity: number;
    unitCost: number;
    total: number;
  }[];
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
  status: 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
}

export interface Expense {
  id: string;
  expenseNumber: string; // EXP-2026-00001
  date: string;
  category:
    | 'Rent'
    | 'Electricity'
    | 'Internet'
    | 'Salaries'
    | 'Packaging'
    | 'Transportation'
    | 'Marketing'
    | 'Advertising'
    | 'Maintenance'
    | 'Supplies'
    | 'Purchases'
    | 'Other';
  description: string;
  amount: number;
  vatAmount?: number;
  paymentMethod: PaymentMethod;
  employeeName: string;
  receiptAttachment?: string;
  notes?: string;
}

export interface Promotion {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  type: 'percentage' | 'fixed' | 'category' | 'product' | 'bundle' | 'buy_x_get_y';
  discountValue: number; // e.g. 15 for 15%, or 2.500 BHD
  minPurchaseAmount?: number;
  startDate: string;
  endDate: string;
  eligibleCategoryIds?: string[];
  eligibleProductIds?: string[];
  bundleDetails?: {
    bundleQuantity: number;
    bundlePrice: number; // e.g. 6 Istikanas for special price
  };
  maxUsage?: number;
  currentUsage: number;
  active: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  referenceId?: string;
  oldValue?: string;
  newValue?: string;
  details: string;
}

export interface CompanySettings {
  companyNameEn: string;
  companyNameAr: string;
  country: string;
  currency: string;
  currencyAr: string;
  secondaryCurrency?: string;
  exchangeRateSecondary?: number; // e.g., 1 BHD = 9.95 SAR
  crNumber: string;
  vatNumber: string;
  vatRate: number; // 0.10 for 10%
  addressEn: string;
  addressAr: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  email: string;
  receiptHeaderEn: string;
  receiptHeaderAr: string;
  receiptFooterEn: string;
  receiptFooterAr: string;
  invoiceFooterEn: string;
  invoiceFooterAr: string;
  logoUrl: string;
  loyaltyPointsPerBhd: number;
  bhdPerRedeemedPoint: number;
  minPointsRedeem: number;
}

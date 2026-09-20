// Emani Art Craft - Core State & Transactional Storage Engine

import {
  Product,
  Category,
  Collection,
  Warehouse,
  Customer,
  Supplier,
  User,
  UserRole,
  CompanySettings,
  Sale,
  CartItem,
  SalePayment,
  SaleReturn,
  PosShift,
  CustomOrder,
  CustomOrderStatus,
  Quotation,
  Expense,
  Promotion,
  AuditLog,
  InventoryMovement,
  InventoryMovementType,
  StockTransfer,
  PurchaseOrder,
} from '../types';

import {
  initialCompanySettings,
  initialUsers,
  initialCategories,
  initialCollections,
  initialWarehouses,
  initialSuppliers,
  initialCustomers,
  initialProducts,
  initialSales,
  initialCustomOrders,
  initialQuotations,
  initialExpenses,
  initialPromotions,
  initialShifts,
  initialAuditLogs,
  initialInventoryMovements,
} from '../data/seedData';

const STORAGE_KEYS = {
  SETTINGS: 'emani_settings_v1',
  USERS: 'emani_users_v1',
  CURRENT_USER: 'emani_current_user_v1',
  IS_LOGGED_IN: 'emani_is_logged_in_v1',
  CATEGORIES: 'emani_categories_v1',
  COLLECTIONS: 'emani_collections_v1',
  WAREHOUSES: 'emani_warehouses_v1',
  SUPPLIERS: 'emani_suppliers_v1',
  CUSTOMERS: 'emani_customers_v1',
  PRODUCTS: 'emani_products_v1',
  SALES: 'emani_sales_v1',
  HELD_SALES: 'emani_held_sales_v1',
  SHIFTS: 'emani_shifts_v1',
  CUSTOM_ORDERS: 'emani_custom_orders_v1',
  QUOTATIONS: 'emani_quotations_v1',
  EXPENSES: 'emani_expenses_v1',
  PROMOTIONS: 'emani_promotions_v1',
  AUDIT_LOGS: 'emani_audit_logs_v1',
  MOVEMENTS: 'emani_movements_v1',
  TRANSFERS: 'emani_transfers_v1',
  PURCHASE_ORDERS: 'emani_purchase_orders_v1',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
}

export const ALL_SYSTEM_PAGES = [
  // العمليات ونقطة البيع
  { id: 'dashboard', nameAr: 'لوحة المعلومات والإحصائيات', nameEn: 'Executive Dashboard', sectionAr: 'العمليات ونقطة البيع', sectionEn: 'Operations & Sales' },
  { id: 'pos', nameAr: 'نقطة البيع والكاشير', nameEn: 'POS & Cashier', sectionAr: 'العمليات ونقطة البيع', sectionEn: 'Operations & Sales' },
  { id: 'products', nameAr: 'كتالوج المنتجات والقطع', nameEn: 'Art & Products', sectionAr: 'العمليات ونقطة البيع', sectionEn: 'Operations & Sales' },
  { id: 'categories', nameAr: 'الأقسام والتصنيفات', nameEn: 'Categories', sectionAr: 'العمليات ونقطة البيع', sectionEn: 'Operations & Sales' },
  { id: 'collections', nameAr: 'المجموعات التراثية', nameEn: 'Heritage Collections', sectionAr: 'العمليات ونقطة البيع', sectionEn: 'Operations & Sales' },
  { id: 'inventory', nameAr: 'المستودع والمخزون', nameEn: 'Warehouse & Stock', sectionAr: 'العمليات ونقطة البيع', sectionEn: 'Operations & Sales' },

  // الطلبات الخاصة والعملاء
  { id: 'custom-orders', nameAr: 'الطلبات الخاصة وتفصيل النحاس', nameEn: 'Custom Orders & Artisan Workshop', sectionAr: 'الطلبات الخاصة والعملاء', sectionEn: 'Custom Orders & CRM' },
  { id: 'quotations', nameAr: 'عروض الأسعار الرسمية', nameEn: 'Official Quotations', sectionAr: 'الطلبات الخاصة والعملاء', sectionEn: 'Custom Orders & CRM' },
  { id: 'crm', nameAr: 'إدارة العملاء ونادي النخبة', nameEn: 'CRM & Customers', sectionAr: 'الطلبات الخاصة والعملاء', sectionEn: 'Custom Orders & CRM' },

  // المشتريات والمالية
  { id: 'purchases', nameAr: 'المشتريات وفواتير الموردين', nameEn: 'Purchases & Suppliers', sectionAr: 'المشتريات والمالية', sectionEn: 'Purchasing & Financials' },
  { id: 'expenses', nameAr: 'سندات الصرف والمصروفات', nameEn: 'Expense Vouchers', sectionAr: 'المشتريات والمالية', sectionEn: 'Purchasing & Financials' },
  { id: 'accounting', nameAr: 'المحاسبة والمالية والضريبة', nameEn: 'Accounting & Ledger', sectionAr: 'المشتريات والمالية', sectionEn: 'Purchasing & Financials' },
  { id: 'shifts', nameAr: 'الورديات وصندوق الكاشير', nameEn: 'Register Shifts & Cash Drawer', sectionAr: 'المشتريات والمالية', sectionEn: 'Purchasing & Financials' },
  { id: 'promotions', nameAr: 'العروض الترويجية والخصومات', nameEn: 'Promotions & Discounts', sectionAr: 'المشتريات والمالية', sectionEn: 'Purchasing & Financials' },

  // الإدارة والتقارير
  { id: 'reports', nameAr: 'التقارير التحليلية والمالية', nameEn: 'Analytics & Reports', sectionAr: 'الإدارة والتقارير', sectionEn: 'Administration & Reports' },
  { id: 'users', nameAr: 'إدارة المستخدمين والصلاحيات', nameEn: 'Staff & Permissions Management', sectionAr: 'الإدارة والتقارير', sectionEn: 'Administration & Reports' },
  { id: 'audit', nameAr: 'سجل العمليات والرقابة', nameEn: 'Audit Trail', sectionAr: 'الإدارة والتقارير', sectionEn: 'Administration & Reports' },
  { id: 'settings', nameAr: 'إعدادات المعرض والنظام', nameEn: 'System Settings', sectionAr: 'الإدارة والتقارير', sectionEn: 'Administration & Reports' },
];

export const DEFAULT_ROLE_PAGES: Record<UserRole, string[]> = {
  super_admin: [
    'dashboard',
    'pos',
    'products',
    'categories',
    'collections',
    'inventory',
    'custom-orders',
    'quotations',
    'crm',
    'purchases',
    'expenses',
    'accounting',
    'shifts',
    'promotions',
    'reports',
    'users',
    'audit',
    'settings',
  ],
  owner: [
    'dashboard',
    'pos',
    'products',
    'categories',
    'collections',
    'inventory',
    'custom-orders',
    'quotations',
    'crm',
    'purchases',
    'expenses',
    'accounting',
    'shifts',
    'promotions',
    'reports',
    'users',
    'audit',
    'settings',
  ],
  manager: [
    'dashboard',
    'pos',
    'products',
    'categories',
    'collections',
    'inventory',
    'custom-orders',
    'quotations',
    'crm',
    'purchases',
    'expenses',
    'shifts',
    'promotions',
    'reports',
    'users',
  ],
  cashier: ['pos', 'custom-orders', 'quotations', 'crm', 'shifts'],
  accountant: ['dashboard', 'accounting', 'expenses', 'purchases', 'shifts', 'reports'],
  designer: ['custom-orders', 'collections', 'products', 'inventory'],
  production_employee: ['custom-orders', 'collections', 'products', 'inventory'],
  sales_employee: ['pos', 'products', 'collections', 'custom-orders', 'quotations', 'crm'],
  inventory_employee: ['inventory', 'products', 'categories', 'purchases', 'collections'],
};

export class StorageService {
  // Listeners for reactive updates
  private static listeners: Set<() => void> = new Set();

  public static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  // --- Reset to Default Seed Data ---
  public static resetToSeedData(): void {
    save(STORAGE_KEYS.SETTINGS, initialCompanySettings);
    save(STORAGE_KEYS.USERS, initialUsers);
    save(STORAGE_KEYS.CURRENT_USER, initialUsers[0]);
    save(STORAGE_KEYS.CATEGORIES, initialCategories);
    save(STORAGE_KEYS.COLLECTIONS, initialCollections);
    save(STORAGE_KEYS.WAREHOUSES, initialWarehouses);
    save(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
    save(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    save(STORAGE_KEYS.PRODUCTS, initialProducts);
    save(STORAGE_KEYS.SALES, initialSales);
    save(STORAGE_KEYS.HELD_SALES, []);
    save(STORAGE_KEYS.SHIFTS, initialShifts);
    save(STORAGE_KEYS.CUSTOM_ORDERS, initialCustomOrders);
    save(STORAGE_KEYS.QUOTATIONS, initialQuotations);
    save(STORAGE_KEYS.EXPENSES, initialExpenses);
    save(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    save(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    save(STORAGE_KEYS.MOVEMENTS, initialInventoryMovements);
    save(STORAGE_KEYS.TRANSFERS, []);
    save(STORAGE_KEYS.PURCHASE_ORDERS, []);
    this.notify();
  }

  // --- Settings ---
  public static getSettings(): CompanySettings {
    const settings = load<CompanySettings>(STORAGE_KEYS.SETTINGS, initialCompanySettings);
    // Ensure accurate branch address if previous version had different location
    if (settings.addressAr && !settings.addressAr.includes('ديار المحرق')) {
      settings.addressAr = initialCompanySettings.addressAr;
      settings.addressEn = initialCompanySettings.addressEn;
      save(STORAGE_KEYS.SETTINGS, settings);
    }
    if (!settings.logoUrl) {
      settings.logoUrl = '/emani-logo.svg';
      save(STORAGE_KEYS.SETTINGS, settings);
    }
    return settings;
  }

  public static updateSettings(settings: CompanySettings): void {
    save(STORAGE_KEYS.SETTINGS, settings);
    this.logAudit('SETTINGS_UPDATE', 'settings', 'Settings updated');
    this.notify();
  }

  // --- Auth Session & Users ---
  public static isLoggedIn(): boolean {
    return load<boolean>(STORAGE_KEYS.IS_LOGGED_IN, false);
  }

  public static login(user: User): void {
    save(STORAGE_KEYS.IS_LOGGED_IN, true);
    save(STORAGE_KEYS.CURRENT_USER, user);
    this.logAudit('USER_LOGIN', 'users', `User ${user.nameEn} (${user.role}) logged in`);
    this.notify();
  }

  public static logout(): void {
    save(STORAGE_KEYS.IS_LOGGED_IN, false);
    this.logAudit('USER_LOGOUT', 'users', 'Active user session logged out');
    this.notify();
  }

  public static getCurrentUser(): User {
    return load<User>(STORAGE_KEYS.CURRENT_USER, initialUsers[0]);
  }

  public static setCurrentUser(user: User): void {
    save(STORAGE_KEYS.CURRENT_USER, user);
    this.logAudit('USER_LOGIN', 'users', `Switched active session to ${user.nameEn} (${user.role})`);
    this.notify();
  }

  public static getUsers(): User[] {
    const users = load<User[]>(STORAGE_KEYS.USERS, initialUsers);
    // Ensure all existing users have can_login and allowedPages properly populated
    let modified = false;
    users.forEach((u) => {
      if (!u.customPermissions) {
        u.customPermissions = u.active !== false ? ['can_login', 'can_access_pos'] : ['can_access_pos'];
        modified = true;
      } else if (u.active !== false && !u.customPermissions.includes('can_login') && (u.role === 'super_admin' || u.role === 'owner' || u.role === 'manager')) {
        u.customPermissions.push('can_login');
        modified = true;
      }

      // Populate allowedPages if missing or empty
      if (!u.allowedPages || u.allowedPages.length === 0) {
        u.allowedPages = DEFAULT_ROLE_PAGES[u.role] || ['pos'];
        modified = true;
      }
    });
    if (modified) {
      save(STORAGE_KEYS.USERS, users);
    }
    return users;
  }

  public static getAllowedPages(user?: User | null): string[] {
    if (!user) return ['pos'];
    if (user.role === 'super_admin' || user.role === 'owner') {
      return DEFAULT_ROLE_PAGES.super_admin;
    }
    if (Array.isArray(user.allowedPages) && user.allowedPages.length > 0) {
      return user.allowedPages;
    }
    return DEFAULT_ROLE_PAGES[user.role] || ['pos'];
  }

  public static isPageAllowed(user: User | null | undefined, pageId: string): boolean {
    if (!user) return false;
    // Normalize aliases
    let normalized = pageId;
    if (pageId === 'purchasing') normalized = 'purchases';
    if (pageId === 'custom_orders') normalized = 'custom-orders';

    const allowed = this.getAllowedPages(user);
    return allowed.includes(normalized);
  }

  public static getDefaultRouteForUser(user: User | null | undefined): string {
    if (!user) return 'pos';
    const pages = this.getAllowedPages(user);
    if (pages.length === 0) return 'pos';

    if (user.role === 'cashier' || user.role === 'sales_employee') {
      return pages.includes('pos') ? 'pos' : pages[0];
    }
    if (user.role === 'accountant') {
      return pages.includes('accounting') ? 'accounting' : pages[0];
    }
    if (user.role === 'designer' || user.role === 'production_employee') {
      return pages.includes('custom-orders') ? 'custom-orders' : pages[0];
    }
    if (user.role === 'inventory_employee') {
      return pages.includes('inventory') ? 'inventory' : pages[0];
    }
    // For manager or admin: prefer dashboard if available, else first page
    return pages.includes('dashboard') ? 'dashboard' : pages[0];
  }

  public static canUserLogin(user: User): boolean {
    if (!user) return false;
    if (user.active === false) return false;
    if (user.role === 'super_admin' || user.role === 'owner') return true;
    if (Array.isArray(user.customPermissions)) {
      return user.customPermissions.includes('can_login');
    }
    return true;
  }

  public static toggleUserLoginPermission(userId: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    const currentUser = this.getCurrentUser();
    if (user.id === currentUser.id && user.active && this.canUserLogin(user)) {
      return {
        success: false,
        error: 'لا يمكن تعطيل صلاحية الدخول للحساب النشط حالياً الذي تستخدمه',
      };
    }

    const currentCanLogin = this.canUserLogin(user);
    const newCanLogin = !currentCanLogin;
    user.active = newCanLogin;

    const perms = new Set(user.customPermissions || ['can_access_pos']);
    if (newCanLogin) {
      perms.add('can_login');
    } else {
      perms.delete('can_login');
    }
    user.customPermissions = Array.from(perms);

    this.saveUser(user);
    this.logAudit(
      'USER_PERMISSION_CHANGED',
      'users',
      `Login permission for ${user.nameEn} (${user.username}) set to ${newCanLogin ? 'ENABLED' : 'DISABLED'}`
    );
    return { success: true, user };
  }

  public static saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    save(STORAGE_KEYS.USERS, users);
    this.logAudit('USER_SAVED', 'users', `User account ${user.username} saved`);
    this.notify();
  }

  public static deleteUser(id: string): boolean {
    const currentUser = this.getCurrentUser();
    if (currentUser.id === id) {
      return false;
    }
    const user = this.getUsers().find((u) => u.id === id);
    const list = this.getUsers().filter((u) => u.id !== id);
    save(STORAGE_KEYS.USERS, list);
    this.logAudit('USER_DELETED', 'users', `Deleted user account ${user?.nameEn || user?.username || id}`, id);
    this.notify();
    return true;
  }

  // --- Categories & Collections ---
  public static getCategories(): Category[] {
    return load<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  }

  public static saveCategory(cat: Category): void {
    const list = this.getCategories();
    const idx = list.findIndex((c) => c.id === cat.id);
    if (idx >= 0) list[idx] = cat;
    else list.push(cat);
    save(STORAGE_KEYS.CATEGORIES, list);
    this.notify();
  }

  public static deleteCategory(id: string): void {
    const list = this.getCategories().filter((c) => c.id !== id);
    save(STORAGE_KEYS.CATEGORIES, list);
    this.notify();
  }

  public static getCollections(): Collection[] {
    return load<Collection[]>(STORAGE_KEYS.COLLECTIONS, initialCollections);
  }

  public static saveCollection(col: Collection): void {
    const list = this.getCollections();
    const idx = list.findIndex((c) => c.id === col.id);
    if (idx >= 0) list[idx] = col;
    else list.push(col);
    save(STORAGE_KEYS.COLLECTIONS, list);
    this.notify();
  }

  // --- Warehouses ---
  public static getWarehouses(): Warehouse[] {
    const warehouses = load<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, initialWarehouses);
    const storeWh = warehouses.find((w) => w.id === 'wh-1' || w.isDefault);
    if (storeWh && !storeWh.nameAr.includes('البراحة')) {
      storeWh.nameEn = 'Souq Al Baraha Showroom';
      storeWh.nameAr = 'معرض سوق البراحة - ديار المحرق';
      storeWh.address = 'Souq Al Baraha, Gate 12 - Shop 1051, Diyar Al Muharraq, Bahrain';
      save(STORAGE_KEYS.WAREHOUSES, warehouses);
    }
    return warehouses;
  }

  public static saveWarehouse(wh: Warehouse): void {
    const list = this.getWarehouses();
    const idx = list.findIndex((w) => w.id === wh.id);
    if (idx >= 0) list[idx] = wh;
    else list.push(wh);
    save(STORAGE_KEYS.WAREHOUSES, list);
    this.notify();
  }

  // --- Products & Variants ---
  public static getProducts(): Product[] {
    const prods = load<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    let changed = false;
    for (const initP of initialProducts) {
      const exists = prods.some((p) => p.id === initP.id);
      if (!exists) {
        prods.push(initP);
        changed = true;
      }
    }
    if (changed) {
      save(STORAGE_KEYS.PRODUCTS, prods);
    }
    return prods;
  }

  public static saveProduct(prod: Product): void {
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === prod.id);
    const isNew = idx < 0;
    if (idx >= 0) {
      list[idx] = { ...prod, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...prod, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    save(STORAGE_KEYS.PRODUCTS, list);
    this.logAudit(
      isNew ? 'PRODUCT_CREATED' : 'PRODUCT_UPDATED',
      'products',
      `${prod.nameEn} (${prod.sku})`,
      prod.id
    );
    this.notify();
  }

  public static deleteProduct(id: string): void {
    const prod = this.getProducts().find((p) => p.id === id);
    const list = this.getProducts().filter((p) => p.id !== id);
    save(STORAGE_KEYS.PRODUCTS, list);
    this.logAudit('PRODUCT_DELETED', 'products', `Deleted product ${prod?.nameEn || id}`, id);
    this.notify();
  }

  // --- Inventory & Stock Movements (Transactional) ---
  public static getMovements(): InventoryMovement[] {
    return load<InventoryMovement[]>(STORAGE_KEYS.MOVEMENTS, initialInventoryMovements);
  }

  public static recordStockMovement(params: {
    productId: string;
    variantId?: string;
    movementType: InventoryMovementType;
    quantity: number; // positive delta
    warehouseId: string;
    reason: string;
    reference: string;
    notes?: string;
  }): void {
    const products = this.getProducts();
    const prod = products.find((p) => p.id === params.productId);
    if (!prod) throw new Error('Product not found');

    const currentUser = this.getCurrentUser();
    const warehouses = this.getWarehouses();
    const wh = warehouses.find((w) => w.id === params.warehouseId) || warehouses[0];

    let prevQty = prod.stockQuantity;
    let newQty = prod.stockQuantity;

    // Handle variant if specified
    if (params.variantId && prod.variants) {
      const v = prod.variants.find((vr) => vr.id === params.variantId);
      if (v) {
        prevQty = v.stockQuantity;
        if (
          params.movementType === 'stock_in' ||
          params.movementType === 'adjustment_add' ||
          params.movementType === 'transfer_in' ||
          params.movementType === 'sale_return' ||
          params.movementType === 'purchase_received'
        ) {
          v.stockQuantity += params.quantity;
          prod.stockQuantity += params.quantity;
        } else {
          v.stockQuantity = Math.max(0, v.stockQuantity - params.quantity);
          prod.stockQuantity = Math.max(0, prod.stockQuantity - params.quantity);
        }
        newQty = v.stockQuantity;
      }
    } else {
      if (
        params.movementType === 'stock_in' ||
        params.movementType === 'adjustment_add' ||
        params.movementType === 'transfer_in' ||
        params.movementType === 'sale_return' ||
        params.movementType === 'purchase_received'
      ) {
        prod.stockQuantity += params.quantity;
      } else {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - params.quantity);
      }
      newQty = prod.stockQuantity;
    }

    save(STORAGE_KEYS.PRODUCTS, products);

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: params.productId,
      variantId: params.variantId,
      productName: prod.nameEn,
      movementType: params.movementType,
      quantity: params.quantity,
      previousQuantity: prevQty,
      newQuantity: newQty,
      warehouseId: wh.id,
      warehouseName: wh.nameEn,
      userId: currentUser.id,
      userName: currentUser.nameEn,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reference: params.reference,
      reason: params.reason,
      notes: params.notes,
    };

    const movements = this.getMovements();
    movements.unshift(movement);
    save(STORAGE_KEYS.MOVEMENTS, movements);

    this.logAudit(
      'STOCK_MOVEMENT',
      'inventory',
      `${params.movementType}: ${params.quantity} pcs of ${prod.nameEn} at ${wh.nameEn} (Ref: ${params.reference})`,
      prod.id
    );

    this.notify();
  }

  // --- Warehouse Transfers ---
  public static getStockTransfers(): StockTransfer[] {
    return load<StockTransfer[]>(STORAGE_KEYS.TRANSFERS, []);
  }

  public static createStockTransfer(transfer: Omit<StockTransfer, 'id' | 'transferNumber'>): StockTransfer {
    const list = this.getStockTransfers();
    const count = list.length + 1;
    const transferNumber = `TR-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
    const newRecord: StockTransfer = {
      ...transfer,
      id: `tr-${Date.now()}`,
      transferNumber,
    };
    list.unshift(newRecord);
    save(STORAGE_KEYS.TRANSFERS, list);

    // Execute the movement if completed immediately
    if (transfer.status === 'completed') {
      for (const item of transfer.items) {
        this.recordStockMovement({
          productId: item.productId,
          variantId: item.variantId,
          movementType: 'transfer_out',
          quantity: item.quantity,
          warehouseId: transfer.fromWarehouseId,
          reason: `Transfer to ${transfer.toWarehouseName}`,
          reference: transferNumber,
        });
        this.recordStockMovement({
          productId: item.productId,
          variantId: item.variantId,
          movementType: 'transfer_in',
          quantity: item.quantity,
          warehouseId: transfer.toWarehouseId,
          reason: `Transfer from ${transfer.fromWarehouseName}`,
          reference: transferNumber,
        });
      }
    }

    this.notify();
    return newRecord;
  }

  // --- Customers & Loyalty ---
  public static getCustomers(): Customer[] {
    const list = load<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    let changed = false;
    for (const c of initialCustomers) {
      if (!list.some((existing) => existing.id === c.id)) {
        list.unshift(c);
        changed = true;
      }
    }
    if (changed) save(STORAGE_KEYS.CUSTOMERS, list);
    return list;
  }

  public static saveCustomer(customer: Customer): void {
    const list = this.getCustomers();
    const idx = list.findIndex((c) => c.id === customer.id);
    if (idx >= 0) list[idx] = customer;
    else list.push(customer);
    save(STORAGE_KEYS.CUSTOMERS, list);
    this.notify();
  }

  // --- Sales & POS ---
  public static getSales(): Sale[] {
    const list = load<Sale[]>(STORAGE_KEYS.SALES, initialSales);
    let changed = false;
    for (const s of initialSales) {
      if (!list.some((existing) => existing.id === s.id || existing.invoiceNumber === s.invoiceNumber)) {
        list.unshift(s);
        changed = true;
      }
    }
    if (changed) save(STORAGE_KEYS.SALES, list);
    return list;
  }

  public static getHeldSales(): { id: string; timestamp: string; note: string; cart: CartItem[]; customerId?: string }[] {
    return load(STORAGE_KEYS.HELD_SALES, []);
  }

  public static holdSale(cart: CartItem[], note: string, customerId?: string): void {
    const held = this.getHeldSales();
    held.push({
      id: `held-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: note || 'Held Cart',
      cart,
      customerId,
    });
    save(STORAGE_KEYS.HELD_SALES, held);
    this.notify();
  }

  public static deleteHeldSale(id: string): void {
    const held = this.getHeldSales().filter((h) => h.id !== id);
    save(STORAGE_KEYS.HELD_SALES, held);
    this.notify();
  }

  public static completeSale(params: {
    cart: CartItem[];
    payments: SalePayment[];
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    discountTotal: number;
    subtotal: number;
    vatTotal: number;
    grandTotal: number;
    changeGiven: number;
    notes?: string;
  }): Sale {
    const sales = this.getSales();
    const count = sales.length + 101;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${count.toString().padStart(5, '0')}`;
    const currentUser = this.getCurrentUser();
    const activeShift = this.getActiveShift();

    const sale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashierId: currentUser.id,
      cashierName: currentUser.nameEn,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      items: params.cart,
      subtotal: params.subtotal,
      discountTotal: params.discountTotal,
      vatTotal: params.vatTotal,
      grandTotal: params.grandTotal,
      payments: params.payments,
      changeGiven: params.changeGiven,
      status: 'completed',
      notes: params.notes,
      shiftId: activeShift?.id,
    };

    sales.unshift(sale);
    save(STORAGE_KEYS.SALES, sales);

    // Update Inventory for each item
    for (const item of params.cart) {
      this.recordStockMovement({
        productId: item.productId,
        variantId: item.variantId,
        movementType: 'sale',
        quantity: item.quantity,
        warehouseId: 'wh-1', // Default main store for POS
        reason: `POS Sale #${invoiceNumber}`,
        reference: invoiceNumber,
      });
    }

    // Update Customer loyalty and stats if customer is attached
    if (params.customerId) {
      const customers = this.getCustomers();
      const cust = customers.find((c) => c.id === params.customerId);
      if (cust) {
        cust.totalPurchases += params.grandTotal;
        cust.numberOfOrders += 1;
        cust.lastPurchaseDate = sale.date;
        const settings = this.getSettings();
        const earnedPoints = Math.floor(params.grandTotal * (settings.loyaltyPointsPerBhd || 1));
        cust.loyaltyPoints += earnedPoints;
        save(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    // Update Active Shift cash metrics
    if (activeShift) {
      params.payments.forEach((p) => {
        if (p.method === 'cash') {
          activeShift.totalSalesCash += p.amount - params.changeGiven;
        } else if (p.method === 'card') {
          activeShift.totalSalesCard += p.amount;
        } else if (p.method === 'benefit_pay') {
          activeShift.totalSalesBenefitPay += p.amount;
        } else {
          activeShift.totalSalesOther += p.amount;
        }
      });
      activeShift.transactionsCount += 1;
      this.saveShift(activeShift);
    }

    this.logAudit(
      'SALE_COMPLETED',
      'sales',
      `Invoice #${invoiceNumber} completed for ${params.grandTotal.toFixed(3)} BHD (${params.payments.map((p) => p.method).join(', ')})`,
      invoiceNumber
    );

    this.notify();
    return sale;
  }

  // --- Returns & Exchanges ---
  public static processReturn(returnData: Omit<SaleReturn, 'id' | 'returnNumber' | 'date' | 'time'>): SaleReturn {
    const count = Math.floor(100 + Math.random() * 900);
    const returnNumber = `RET-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
    const currentUser = this.getCurrentUser();

    const fullReturn: SaleReturn = {
      ...returnData,
      id: `ret-${Date.now()}`,
      returnNumber,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Return stock if condition is return_to_stock
    for (const item of returnData.items) {
      if (item.itemCondition === 'return_to_stock') {
        this.recordStockMovement({
          productId: item.productId,
          variantId: item.variantId,
          movementType: 'sale_return',
          quantity: item.quantity,
          warehouseId: returnData.warehouseId || 'wh-1',
          reason: `Customer Return #${returnNumber} (${returnData.reason})`,
          reference: returnNumber,
        });
      } else if (item.itemCondition === 'damaged') {
        this.recordStockMovement({
          productId: item.productId,
          variantId: item.variantId,
          movementType: 'damaged',
          quantity: item.quantity,
          warehouseId: returnData.warehouseId || 'wh-1',
          reason: `Damaged Return #${returnNumber}`,
          reference: returnNumber,
        });
      }
    }

    // Update shift if refund in cash
    const activeShift = this.getActiveShift();
    if (activeShift && returnData.refundMethod === 'cash') {
      activeShift.totalRefundsCash += returnData.refundTotal;
      this.saveShift(activeShift);
    }

    // Add store credit to customer if applicable
    if (returnData.customerId && returnData.refundMethod === 'store_credit') {
      const customers = this.getCustomers();
      const cust = customers.find((c) => c.id === returnData.customerId);
      if (cust) {
        cust.balance -= returnData.refundTotal; // negative balance represents store credit
        save(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    this.logAudit(
      'SALE_RETURN',
      'sales',
      `Processed return #${returnNumber} for Invoice #${returnData.originalInvoiceNumber} - Amount: ${returnData.refundTotal.toFixed(3)} BHD`,
      returnNumber
    );

    this.notify();
    return fullReturn;
  }

  // --- Cash Register Shifts ---
  public static getShifts(): PosShift[] {
    return load<PosShift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
  }

  public static getActiveShift(): PosShift | undefined {
    return this.getShifts().find((s) => s.status === 'open');
  }

  public static saveShift(shift: PosShift): void {
    const list = this.getShifts();
    const idx = list.findIndex((s) => s.id === shift.id);
    if (idx >= 0) list[idx] = shift;
    else list.unshift(shift);
    save(STORAGE_KEYS.SHIFTS, list);
    this.notify();
  }

  public static openShift(openingCash: number, notes?: string): PosShift {
    const active = this.getActiveShift();
    if (active) throw new Error('An active shift is already open.');

    const currentUser = this.getCurrentUser();
    const count = this.getShifts().length + 1;
    const shiftNumber = `SH-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;

    const newShift: PosShift = {
      id: `shift-${Date.now()}`,
      shiftNumber,
      cashierId: currentUser.id,
      cashierName: currentUser.nameEn,
      openedAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      openingCash,
      totalSalesCash: 0,
      totalSalesCard: 0,
      totalSalesBenefitPay: 0,
      totalSalesOther: 0,
      totalCashIn: 0,
      totalCashOut: 0,
      totalRefundsCash: 0,
      transactionsCount: 0,
      status: 'open',
      notes,
    };

    this.saveShift(newShift);
    this.logAudit('SHIFT_OPENED', 'shifts', `Opened shift #${shiftNumber} with ${openingCash.toFixed(3)} BHD cash float`, shiftNumber);
    return newShift;
  }

  public static closeShift(shiftId: string, closingCashEntered: number, notes?: string): PosShift {
    const shifts = this.getShifts();
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) throw new Error('Shift not found');

    const expectedCash =
      shift.openingCash +
      shift.totalSalesCash +
      shift.totalCashIn -
      shift.totalCashOut -
      shift.totalRefundsCash;

    const cashDifference = closingCashEntered - expectedCash;

    shift.status = 'closed';
    shift.closedAt = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    shift.closingCashEntered = closingCashEntered;
    shift.expectedCash = expectedCash;
    shift.cashDifference = cashDifference;
    if (notes) shift.notes = (shift.notes ? shift.notes + ' | ' : '') + notes;

    this.saveShift(shift);
    this.logAudit(
      'SHIFT_CLOSED',
      'shifts',
      `Closed shift #${shift.shiftNumber}. Expected: ${expectedCash.toFixed(3)} BHD, Counted: ${closingCashEntered.toFixed(3)} BHD (Diff: ${cashDifference.toFixed(3)} BHD)`,
      shift.shiftNumber
    );
    return shift;
  }

  public static recordCashInOut(type: 'cash_in' | 'cash_out', amount: number, reason: string): void {
    const shift = this.getActiveShift();
    if (!shift) throw new Error('No active shift open');

    if (type === 'cash_in') {
      shift.totalCashIn += amount;
    } else {
      shift.totalCashOut += amount;
    }

    this.saveShift(shift);
    this.logAudit('CASH_ADJUSTMENT', 'shifts', `${type.toUpperCase()}: ${amount.toFixed(3)} BHD (${reason})`, shift.shiftNumber);
    this.notify();
  }

  // --- Custom Orders & Events ---
  public static getCustomOrders(): CustomOrder[] {
    return load<CustomOrder[]>(STORAGE_KEYS.CUSTOM_ORDERS, initialCustomOrders);
  }

  public static saveCustomOrder(order: CustomOrder): void {
    const list = this.getCustomOrders();
    const idx = list.findIndex((o) => o.id === order.id);
    if (idx >= 0) list[idx] = order;
    else list.unshift(order);
    save(STORAGE_KEYS.CUSTOM_ORDERS, list);
    this.logAudit('CUSTOM_ORDER_SAVED', 'custom_orders', `Custom Order #${order.orderNumber} updated (${order.status})`, order.orderNumber);
    this.notify();
  }

  public static updateCustomOrderStatus(orderId: string, newStatus: CustomOrderStatus, notes?: string): void {
    const list = this.getCustomOrders();
    const order = list.find((o) => o.id === orderId);
    if (!order) return;

    const currentUser = this.getCurrentUser();
    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      updatedBy: currentUser.nameEn,
      notes,
    });

    save(STORAGE_KEYS.CUSTOM_ORDERS, list);
    this.logAudit(
      'CUSTOM_ORDER_STATUS',
      'custom_orders',
      `Order #${order.orderNumber} status changed to ${newStatus}`,
      order.orderNumber
    );
    this.notify();
  }

  // --- Quotations ---
  public static getQuotations(): Quotation[] {
    return load<Quotation[]>(STORAGE_KEYS.QUOTATIONS, initialQuotations);
  }

  public static saveQuotation(quotation: Quotation): void {
    const list = this.getQuotations();
    const idx = list.findIndex((q) => q.id === quotation.id);
    if (idx >= 0) list[idx] = quotation;
    else list.unshift(quotation);
    save(STORAGE_KEYS.QUOTATIONS, list);
    this.notify();
  }

  public static convertQuotationToOrder(quotationId: string): CustomOrder {
    const quotations = this.getQuotations();
    const qt = quotations.find((q) => q.id === quotationId);
    if (!qt) throw new Error('Quotation not found');

    const customOrders = this.getCustomOrders();
    const count = customOrders.length + 1;
    const orderNumber = `CO-${new Date().getFullYear()}-${count.toString().padStart(5, '0')}`;
    const currentUser = this.getCurrentUser();

    const newOrder: CustomOrder = {
      id: `co-${Date.now()}`,
      orderNumber,
      customerId: qt.customerId,
      customerName: qt.customerName,
      customerPhone: qt.customerPhone,
      customerWhatsapp: qt.customerPhone,
      eventType: 'Corporate Event',
      deadline: qt.validUntil,
      productName: qt.items.map((i) => i.description).join(' + '),
      quantity: qt.items.reduce((acc, i) => acc + i.quantity, 0),
      customizationDescription: `Converted from Quotation #${qt.quotationNumber}. ${qt.notes || ''}`,
      unitPrice: qt.subtotal / Math.max(1, qt.items.reduce((acc, i) => acc + i.quantity, 0)),
      totalPrice: qt.grandTotal,
      depositPaid: 0,
      remainingBalance: qt.grandTotal,
      status: 'new_request',
      statusHistory: [
        {
          status: 'new_request',
          timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          updatedBy: currentUser.nameEn,
          notes: `Converted from Quotation #${qt.quotationNumber}`,
        },
      ],
      createdAt: new Date().toISOString().split('T')[0],
      notes: qt.terms,
    };

    customOrders.unshift(newOrder);
    save(STORAGE_KEYS.CUSTOM_ORDERS, customOrders);

    qt.status = 'converted';
    qt.convertedTo = 'custom_order';
    qt.convertedRefNumber = orderNumber;
    save(STORAGE_KEYS.QUOTATIONS, quotations);

    this.logAudit(
      'QUOTATION_CONVERTED',
      'quotations',
      `Converted Quotation #${qt.quotationNumber} to Custom Order #${orderNumber}`,
      orderNumber
    );

    this.notify();
    return newOrder;
  }

  // --- Expenses ---
  public static getExpenses(): Expense[] {
    return load<Expense[]>(STORAGE_KEYS.EXPENSES, initialExpenses);
  }

  public static saveExpense(expense: Expense): void {
    const list = this.getExpenses();
    const idx = list.findIndex((e) => e.id === expense.id);
    if (idx >= 0) list[idx] = expense;
    else list.unshift(expense);
    save(STORAGE_KEYS.EXPENSES, list);
    this.logAudit('EXPENSE_RECORDED', 'accounting', `Expense #${expense.expenseNumber} for ${expense.amount.toFixed(3)} BHD (${expense.category})`, expense.expenseNumber);
    this.notify();
  }

  // --- Suppliers & Purchase Orders ---
  public static getSuppliers(): Supplier[] {
    return load<Supplier[]>(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
  }

  public static saveSupplier(supplier: Supplier): void {
    const list = this.getSuppliers();
    const idx = list.findIndex((s) => s.id === supplier.id);
    if (idx >= 0) list[idx] = supplier;
    else list.push(supplier);
    save(STORAGE_KEYS.SUPPLIERS, list);
    this.notify();
  }

  public static getPurchaseOrders(): PurchaseOrder[] {
    return load<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, []);
  }

  public static savePurchaseOrder(po: PurchaseOrder): void {
    const list = this.getPurchaseOrders();
    const idx = list.findIndex((p) => p.id === po.id);
    if (idx >= 0) list[idx] = po;
    else list.unshift(po);
    save(STORAGE_KEYS.PURCHASE_ORDERS, list);
    this.notify();
  }

  public static receivePurchaseOrderGoods(poId: string, receivedItems: { productId: string; quantity: number }[]): void {
    const list = this.getPurchaseOrders();
    const po = list.find((p) => p.id === poId);
    if (!po) return;

    for (const rec of receivedItems) {
      const item = po.items.find((i) => i.productId === rec.productId);
      if (item) {
        item.receivedQuantity += rec.quantity;
      }
      this.recordStockMovement({
        productId: rec.productId,
        movementType: 'purchase_received',
        quantity: rec.quantity,
        warehouseId: 'wh-1',
        reason: `PO Goods Received #${po.poNumber}`,
        reference: po.poNumber,
      });
    }

    const allReceived = po.items.every((i) => i.receivedQuantity >= i.quantity);
    po.status = allReceived ? 'received' : 'partially_received';
    save(STORAGE_KEYS.PURCHASE_ORDERS, list);

    this.logAudit('PURCHASE_GOODS_RECEIVED', 'purchases', `Received goods for PO #${po.poNumber}`, po.poNumber);
    this.notify();
  }

  // --- Promotions & Discounts ---
  public static getPromotions(): Promotion[] {
    return load<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
  }

  public static savePromotion(promo: Promotion): void {
    const list = this.getPromotions();
    const idx = list.findIndex((p) => p.id === promo.id);
    if (idx >= 0) list[idx] = promo;
    else list.push(promo);
    save(STORAGE_KEYS.PROMOTIONS, list);
    this.notify();
  }

  // --- Audit Logging ---
  public static getAuditLogs(): AuditLog[] {
    return load<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  }

  public static logAudit(action: string, module: string, details: string, referenceId?: string, oldValue?: string, newValue?: string): void {
    const currentUser = this.getCurrentUser();
    const logs = this.getAuditLogs();
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.nameEn,
      action,
      module,
      referenceId,
      oldValue,
      newValue,
      details,
    };
    logs.unshift(log);
    // Keep max 500 audit entries
    if (logs.length > 500) logs.length = 500;
    save(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // --- System Backup & Restore ---
  public static exportFullBackupJson(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      system: 'Emani Art Craft ERP & POS',
      version: '1.0.0',
      data: {
        settings: this.getSettings(),
        users: this.getUsers(),
        categories: this.getCategories(),
        collections: this.getCollections(),
        warehouses: this.getWarehouses(),
        suppliers: this.getSuppliers(),
        customers: this.getCustomers(),
        products: this.getProducts(),
        sales: this.getSales(),
        shifts: this.getShifts(),
        customOrders: this.getCustomOrders(),
        quotations: this.getQuotations(),
        expenses: this.getExpenses(),
        promotions: this.getPromotions(),
        auditLogs: this.getAuditLogs(),
        movements: this.getMovements(),
        transfers: this.getStockTransfers(),
        purchaseOrders: this.getPurchaseOrders(),
      },
    };
    return JSON.stringify(backup, null, 2);
  }

  public static restoreBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) throw new Error('Invalid backup file structure');

      const d = parsed.data;
      if (d.settings) save(STORAGE_KEYS.SETTINGS, d.settings);
      if (d.users) save(STORAGE_KEYS.USERS, d.users);
      if (d.categories) save(STORAGE_KEYS.CATEGORIES, d.categories);
      if (d.collections) save(STORAGE_KEYS.COLLECTIONS, d.collections);
      if (d.warehouses) save(STORAGE_KEYS.WAREHOUSES, d.warehouses);
      if (d.suppliers) save(STORAGE_KEYS.SUPPLIERS, d.suppliers);
      if (d.customers) save(STORAGE_KEYS.CUSTOMERS, d.customers);
      if (d.products) save(STORAGE_KEYS.PRODUCTS, d.products);
      if (d.sales) save(STORAGE_KEYS.SALES, d.sales);
      if (d.shifts) save(STORAGE_KEYS.SHIFTS, d.shifts);
      if (d.customOrders) save(STORAGE_KEYS.CUSTOM_ORDERS, d.customOrders);
      if (d.quotations) save(STORAGE_KEYS.QUOTATIONS, d.quotations);
      if (d.expenses) save(STORAGE_KEYS.EXPENSES, d.expenses);
      if (d.promotions) save(STORAGE_KEYS.PROMOTIONS, d.promotions);
      if (d.auditLogs) save(STORAGE_KEYS.AUDIT_LOGS, d.auditLogs);
      if (d.movements) save(STORAGE_KEYS.MOVEMENTS, d.movements);
      if (d.transfers) save(STORAGE_KEYS.TRANSFERS, d.transfers);
      if (d.purchaseOrders) save(STORAGE_KEYS.PURCHASE_ORDERS, d.purchaseOrders);

      this.logAudit('SYSTEM_RESTORE', 'system', 'Restored system database from backup archive');
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to restore backup', e);
      return false;
    }
  }
}

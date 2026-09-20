// PostgreSQL Schema Definition for Emani Art Craft using Drizzle ORM
import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Users table (Maps to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('manager').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  productId: text('product_id').notNull().unique(), // e.g. prod-1
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  sku: text('sku').notNull().unique(),
  barcode: text('barcode').notNull(),
  category: text('category').notNull(),
  material: text('material'),
  costPrice: numeric('cost_price', { precision: 10, scale: 3 }).notNull(),
  retailPrice: numeric('retail_price', { precision: 10, scale: 3 }).notNull(),
  stock: integer('stock').default(0).notNull(),
  minStock: integer('min_stock').default(5).notNull(),
  images: text('images').array(),
  active: boolean('active').default(true).notNull(),
  customizable: boolean('customizable').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Sales & Orders table
export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  saleId: text('sale_id').notNull().unique(),
  invoiceNumber: text('invoice_number').notNull(),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  subtotal: numeric('subtotal', { precision: 10, scale: 3 }).notNull(),
  vatAmount: numeric('vat_amount', { precision: 10, scale: 3 }).notNull(),
  total: numeric('total', { precision: 10, scale: 3 }).notNull(),
  paymentMethod: text('payment_method').notNull(), // 'benefit_pay' | 'card' | 'cash'
  status: text('status').default('completed').notNull(),
  createdById: text('created_by_id').references(() => users.uid),
  createdAt: timestamp('created_at').defaultNow(),
});

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
  sales: many(sales),
}));

// Sales relations
export const salesRelations = relations(sales, ({ one }) => ({
  cashier: one(users, {
    fields: [sales.createdById],
    references: [users.uid],
  }),
}));

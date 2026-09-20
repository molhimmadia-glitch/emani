// Database Helper for Products & Sales
import { db } from './index.ts';
import { products, sales } from './schema.ts';
import { desc } from 'drizzle-orm';

export async function getAllProducts() {
  try {
    return await db.select().from(products).orderBy(desc(products.id));
  } catch (error) {
    console.error('Database query products failed:', error);
    throw new Error('Database query products failed', { cause: error });
  }
}

export async function upsertProduct(prodData: {
  productId: string;
  nameAr: string;
  nameEn: string;
  sku: string;
  barcode: string;
  category: string;
  material?: string;
  costPrice: string;
  retailPrice: string;
  stock: number;
  minStock: number;
  images?: string[];
  active?: boolean;
  customizable?: boolean;
}) {
  try {
    const result = await db
      .insert(products)
      .values({
        productId: prodData.productId,
        nameAr: prodData.nameAr,
        nameEn: prodData.nameEn,
        sku: prodData.sku,
        barcode: prodData.barcode,
        category: prodData.category,
        material: prodData.material || null,
        costPrice: prodData.costPrice,
        retailPrice: prodData.retailPrice,
        stock: prodData.stock,
        minStock: prodData.minStock,
        images: prodData.images || [],
        active: prodData.active ?? true,
        customizable: prodData.customizable ?? false,
      })
      .onConflictDoUpdate({
        target: products.productId,
        set: {
          nameAr: prodData.nameAr,
          nameEn: prodData.nameEn,
          sku: prodData.sku,
          barcode: prodData.barcode,
          category: prodData.category,
          material: prodData.material || null,
          costPrice: prodData.costPrice,
          retailPrice: prodData.retailPrice,
          stock: prodData.stock,
          minStock: prodData.minStock,
          images: prodData.images || [],
          active: prodData.active ?? true,
          customizable: prodData.customizable ?? false,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database upsertProduct failed:', error);
    throw new Error('Database upsertProduct failed', { cause: error });
  }
}

export async function getAllSales() {
  try {
    return await db.select().from(sales).orderBy(desc(sales.id)).limit(100);
  } catch (error) {
    console.error('Database query sales failed:', error);
    throw new Error('Database query sales failed', { cause: error });
  }
}

export async function createSaleRecord(saleData: {
  saleId: string;
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: string;
  vatAmount: string;
  total: string;
  paymentMethod: string;
  status?: string;
  createdById?: string;
}) {
  try {
    const result = await db
      .insert(sales)
      .values({
        saleId: saleData.saleId,
        invoiceNumber: saleData.invoiceNumber,
        customerName: saleData.customerName || null,
        customerPhone: saleData.customerPhone || null,
        subtotal: saleData.subtotal,
        vatAmount: saleData.vatAmount,
        total: saleData.total,
        paymentMethod: saleData.paymentMethod,
        status: saleData.status || 'completed',
        createdById: saleData.createdById || null,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database createSaleRecord failed:', error);
    throw new Error('Database createSaleRecord failed', { cause: error });
  }
}

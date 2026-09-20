// Emani Art Craft - Server Entry Point with Vite & Gemini AI

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getAllProducts, upsertProduct, getAllSales, createSaleRecord } from './src/db/products.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini SDK lazily
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      store: 'Emani Art Craft - Bahrain',
      database: 'Cloud SQL PostgreSQL',
      timestamp: new Date().toISOString(),
      aiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // User Profile Sync Endpoint (syncs Firebase Auth user to PostgreSQL)
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await getOrCreateUser(
        req.user.uid,
        req.user.email || 'user@emani.bh',
        req.user.name || undefined
      );
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Failed to sync user:', error);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  });

  // Database Products API
  app.get('/api/db/products', async (req, res) => {
    try {
      const items = await getAllProducts();
      res.json(items);
    } catch (error: any) {
      console.error('Failed to get products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post('/api/db/products', requireAuth, async (req: AuthRequest, res) => {
    try {
      const prod = await upsertProduct(req.body);
      res.json(prod);
    } catch (error: any) {
      console.error('Failed to upsert product:', error);
      res.status(500).json({ error: 'Failed to save product' });
    }
  });

  // Database Sales API
  app.get('/api/db/sales', async (req, res) => {
    try {
      const salesList = await getAllSales();
      res.json(salesList);
    } catch (error: any) {
      console.error('Failed to get sales:', error);
      res.status(500).json({ error: 'Failed to fetch sales' });
    }
  });

  app.post('/api/db/sales', requireAuth, async (req: AuthRequest, res) => {
    try {
      const sale = await createSaleRecord({
        ...req.body,
        createdById: req.user?.uid,
      });
      res.json(sale);
    } catch (error: any) {
      console.error('Failed to record sale:', error);
      res.status(500).json({ error: 'Failed to record sale' });
    }
  });

  // Gemini AI Assistant Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, context, language = 'ar' } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const ai = getAI();
      if (!ai) {
        // Fallback intelligent responder if API key is not yet set in environment
        return res.json({
          reply:
            language === 'ar'
              ? `أهلاً بك في المساعد الذكي لإيماني آرت كرافت! ✨\n\nبناءً على بيانات المتجر الحالية:\n• مبيعات اليوم: ${context?.todaySales || '68.000'} د.ب\n• المنتجات منخفضة المخزون: ${context?.lowStockCount || '2'} منتجات (فانوس نحاسي، صندوق خشب النخيل واللؤلؤ)\n• المنتج الأكثر مبيعاً: استكانات الشاي المذهبة 24k (النقش البحريني)\n\n(ملاحظة: يمكنك إعداد مفتاح GEMINI_API_KEY في لوحة الإعدادات لتفعيل الذكاء الاصطناعي التوليدي الكامل).`
              : `Welcome to Emani Art Craft AI Assistant! ✨\n\nBased on current store data:\n• Today's Sales: ${context?.todaySales || '68.000'} BHD\n• Low stock items: ${context?.lowStockCount || '2'} items (Brass Lantern, Palm Wood Jewelry Box)\n• Top seller: 24k Gold Rim Istikana Tea Cup (Bahraini Design)\n\n(Note: Set GEMINI_API_KEY in the Settings menu for full live generation).`,
          suggestedActions: [
            {
              type: 'RESTOCK_PO',
              title: language === 'ar' ? 'تجهيز أمر شراء للمنتجات الناقصة' : 'Draft PO for Low Stock',
              actionData: { supplier: 'Dilmun Brass & Wood Workshop', items: ['LNT-RAM-006', 'BOX-PLM-007'] },
            },
          ],
        });
      }

      const systemInstruction = `You are the specialized Retail & Business AI Assistant for "Emani Art Craft" (إيماني آرت كرافت), an upscale artisan retail, gifts, handmade crafts, and custom orders boutique in the Kingdom of Bahrain.
Currency: Bahraini Dinar (BHD, 3 decimals). Standard Bahrain VAT is 10%.
Key payment methods include BenefitPay (popular in Bahrain), Cash, Debit/Credit Cards.
Current context data from the ERP:
${JSON.stringify(context || {}, null, 2)}

Your role:
1. Answer management questions about sales, profit, top selling products, slow moving items, inventory stock, pending custom orders, wedding giveaways, and customer loyalty.
2. Provide suggestions in warm, professional, concise language. Support both Arabic and English depending on the prompt or language request.
3. Help draft creative Arabic & English product titles, poetic heritage descriptions, and translation between Arabic and English.
4. CRITICAL SAFETY RULE: You must NEVER pretend to directly modify database records, inventory, prices, or financials. If the user asks you to order stock or create an order (e.g. "جهز طلب شراء للمنتجات الناقصة"), formulate the proposed action clearly, outline the item quantities and supplier, and advise the user to confirm in the UI.

Always speak respectfully in the authentic Bahraini / Gulf cultural context, celebrating traditional arts, Bahraini heritage, palm crafts, natural Bahraini pearls, and Islamic calligraphy.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nUser Question in ${language}: ${message}` }],
          },
        ],
      });

      const replyText = response.text || '';
      res.json({ reply: replyText });
    } catch (error: any) {
      console.error('Gemini AI error:', error);
      res.status(500).json({
        error: 'Failed to process AI request',
        details: error?.message || 'Unknown error',
      });
    }
  });

  // Serve Vite in development or static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Emani Art Craft Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

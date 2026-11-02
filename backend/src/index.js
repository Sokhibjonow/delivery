import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { usersRouter } from './routes/users.js';
import { settingsRouter } from './routes/settings.js';
import { toppingsRouter } from './routes/toppings.js';
import { promoRouter } from './routes/promo.js';
import { favoritesRouter } from './routes/favorites.js';
import { adminRouter } from './routes/admin.js';

import {
  startBot,
  startBotWebhook,
  webhookMiddleware,
  setWebAppUrl,
  getWebAppUrl,
} from './bot.js';
import { identify } from './telegramAuth.js';
import { requireAdmin } from './auth.js';
import { warmUpDatabase } from './prisma.js';

// Kutilmagan xato tufayli server butunlay o'chib qolmasligi uchun
process.on('unhandledRejection', (err) => {
  console.error('[api] ushlanmagan xato:', err?.message || err);
});

/**
 * Serverda (Render va h.k.) ishlaganda ochiq manzil shu yerda bo'ladi.
 * Bo'sh bo'lsa — kompyuterda (localhost + tunnel) ishlayapmiz.
 * Render bu manzilni RENDER_EXTERNAL_URL orqali o'zi beradi.
 */
const PUBLIC_URL = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || '')
  .trim()
  .replace(/\/+$/, '');

const IS_SERVER = PUBLIC_URL.startsWith('https://');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MINIAPP_DIST = path.join(ROOT, 'miniapp', 'dist');
const ADMIN_DIST = path.join(ROOT, 'admin', 'dist');

const app = express();

app.use(cors());
app.use(express.json());

// Telegram xabarlari (faqat serverda — webhook rejimi)
if (IS_SERVER) {
  app.use(webhookMiddleware());
}

// Har bir so'rovda mijozni Telegram initData orqali aniqlaymiz
app.use(identify);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, shop: process.env.SHOP_NAME || 'Pizza' });
});

app.get('/api/config', (_req, res) => {
  res.json({ shopName: process.env.SHOP_NAME || 'Pizza' });
});

/** Tunnel skripti yangi https manzilni shu yerga yuboradi (faqat kompyuterda) */
app.post('/api/webapp-url', requireAdmin, async (req, res) => {
  if (IS_SERVER) {
    return res.status(403).json({ error: 'Serverda manzil doimiy' });
  }

  const ok = await setWebAppUrl(req.body?.url);
  res.json({ ok, url: getWebAppUrl() });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/toppings', toppingsRouter);
app.use('/api/promo', promoRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/admin', adminRouter);

// Noma'lum API manzillari
app.use('/api', (_req, res) => res.status(404).json({ error: 'Topilmadi' }));

/* ---------- Tayyor (build qilingan) sahifalar ---------- */

// Admin panel: https://.../admin
if (fs.existsSync(ADMIN_DIST)) {
  app.use('/admin', express.static(ADMIN_DIST));
  app.get('/admin/*', (_req, res) =>
    res.sendFile(path.join(ADMIN_DIST, 'index.html'))
  );
}

// Mini App: https://.../
if (fs.existsSync(MINIAPP_DIST)) {
  app.use(express.static(MINIAPP_DIST));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(MINIAPP_DIST, 'index.html'))
  );
}

app.use((err, _req, res, _next) => {
  console.error('[api] xato:', err);
  res.status(500).json({ error: 'Serverda xatolik' });
});

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`[api] port ${PORT} da ishlamoqda`);

  // Bazani oldindan uyg'otamiz (Neon uxlab qolgan bo'lishi mumkin)
  warmUpDatabase();

  if (IS_SERVER) {
    console.log(`[api] Server rejimi: ${PUBLIC_URL}`);
    startBotWebhook(PUBLIC_URL);
  } else {
    startBot();
  }
});

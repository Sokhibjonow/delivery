import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { usersRouter } from './routes/users.js';
import { startBot, setWebAppUrl, getWebAppUrl } from './bot.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, shop: process.env.SHOP_NAME || 'Pizza' });
});

app.get('/api/config', (_req, res) => {
  res.json({ shopName: process.env.SHOP_NAME || 'Pizza' });
});

/** Tunnel skripti yangi https manzilni shu yerga yuboradi */
app.post('/api/webapp-url', async (req, res) => {
  const ok = await setWebAppUrl(req.body?.url);
  res.json({ ok, url: getWebAppUrl() });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);

app.use((err, _req, res, _next) => {
  console.error('[api] xato:', err);
  res.status(500).json({ error: 'Serverda xatolik' });
});

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`[api] http://localhost:${PORT} da ishlamoqda`);
  startBot();
});

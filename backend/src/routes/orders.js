import { Router } from 'express';
import { prisma } from '../prisma.js';
import { notifyCustomer, notifyAdmin } from '../bot.js';

export const ordersRouter = Router();

/** Barcha buyurtmalar (Admin panel uchun) */
ordersRouter.get('/', async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders);
});

/** Bitta mijozning buyurtmalari tarixi (Profil sahifasi) */
ordersRouter.get('/my/:telegramId', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { telegramId: String(req.params.telegramId) },
  });

  if (!user) return res.json([]);

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders);
});

/** Yangi buyurtma yaratish (Mini App savatchasidan) */
ordersRouter.post('/', async (req, res) => {
  const { telegramId, name, phone, location, items } = req.body;

  if (!telegramId) return res.status(400).json({ error: 'telegramId kerak' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Savatcha bo\'sh' });
  }

  // Narxlarni bazadan qayta hisoblaymiz (mijoz tomonidan o'zgartirilmasligi uchun)
  const ids = items.map((i) => Number(i.id));
  const dbProducts = await prisma.product.findMany({ where: { id: { in: ids } } });

  const safeItems = [];
  let total = 0;

  for (const item of items) {
    const product = dbProducts.find((p) => p.id === Number(item.id));
    if (!product) continue;

    const qty = Math.max(1, Number(item.qty) || 1);
    total += product.newPrice * qty;

    safeItems.push({
      id: product.id,
      name: product.name,
      price: product.newPrice,
      qty,
    });
  }

  if (safeItems.length === 0) {
    return res.status(400).json({ error: 'Mahsulotlar topilmadi' });
  }

  const user = await prisma.user.upsert({
    where: { telegramId: String(telegramId) },
    update: {
      name: name ? String(name) : undefined,
      phone: phone ? String(phone) : undefined,
    },
    create: {
      telegramId: String(telegramId),
      name: String(name || 'Mehmon'),
      phone: phone ? String(phone) : null,
    },
  });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      items: safeItems,
      total,
      location: location ? String(location) : null,
      status: 'kutilmoqda',
    },
  });

  // Botdan mijozga va adminga xabar
  notifyCustomer(user.telegramId, { ...order, items: safeItems });
  notifyAdmin({ ...order, items: safeItems }, user);

  res.status(201).json(order);
});

/** Buyurtma holatini o'zgartirish (Admin) */
ordersRouter.patch('/:id/status', async (req, res) => {
  const { status } = req.body;

  try {
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status: String(status) },
    });

    res.json(order);
  } catch {
    res.status(404).json({ error: 'Buyurtma topilmadi' });
  }
});

/** Buyurtmani o'chirish (Admin) */
ordersRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Buyurtma topilmadi' });
  }
});

import { Router } from 'express';
import { prisma } from '../prisma.js';
import { notifyCustomer, notifyAdmin, notifyStatus } from '../bot.js';
import { getSettings, isOpenNow } from './settings.js';
import { calcDiscount } from './promo.js';
import { requireAdmin } from '../auth.js';
import { requireCustomer } from '../telegramAuth.js';

export const ordersRouter = Router();

const STATUSES = ['yangi', 'tayyorlanmoqda', 'yolda', 'yetkazildi', 'bekor'];

/** Barcha buyurtmalar (Admin panel uchun) */
ordersRouter.get('/', requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders);
});

/** Faqat so'rov yuborayotgan mijozning o'z buyurtmalari */
ordersRouter.get('/my', requireCustomer, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { telegramId: req.customer.telegramId },
  });

  if (!user) return res.json([]);

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders);
});

/** Yangi buyurtma yaratish (Mini App savatchasidan) */
ordersRouter.post('/', requireCustomer, async (req, res) => {
  const { name, phone, location, items, promoCode } = req.body;
  const telegramId = req.customer.telegramId;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Savatcha bo\'sh' });
  }

  const settings = await getSettings();

  if (!isOpenNow(settings)) {
    return res.status(400).json({
      error: `Hozir yopiqmiz. Ish vaqti: ${settings.workFrom} — ${settings.workTo}`,
    });
  }

  // Narxlarni bazadan qayta hisoblaymiz (mijoz tomonidan o'zgartirilmasligi uchun)
  const ids = items.map((i) => Number(i.id));
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: ids } },
  });
  const dbToppings = await prisma.topping.findMany({ where: { active: true } });

  const safeItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = dbProducts.find((p) => p.id === Number(item.id));
    if (!product) continue;

    const qty = Math.max(1, Number(item.qty) || 1);

    // O'lcham
    let sizeLabel = null;
    let sizeDelta = 0;

    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      const chosen =
        product.sizes.find((s) => s.label === item.size) || product.sizes[0];
      sizeLabel = chosen.label;
      sizeDelta = Number(chosen.delta) || 0;
    }

    // Qo'shimchalar
    const chosenToppings = (item.toppingIds || [])
      .map((tid) => dbToppings.find((t) => t.id === Number(tid)))
      .filter(Boolean)
      .map((t) => ({ id: t.id, name: t.name, price: t.price }));

    const toppingsSum = chosenToppings.reduce((s, t) => s + t.price, 0);
    const unitPrice = product.newPrice + sizeDelta + toppingsSum;

    subtotal += unitPrice * qty;

    safeItems.push({
      id: product.id,
      name: product.name,
      price: unitPrice,
      qty,
      size: sizeLabel,
      toppings: chosenToppings,
    });
  }

  if (safeItems.length === 0) {
    return res.status(400).json({ error: 'Mahsulotlar topilmadi' });
  }

  if (subtotal < settings.minOrderTotal) {
    return res.status(400).json({
      error: `Minimal buyurtma summasi ${new Intl.NumberFormat('ru-RU').format(
        settings.minOrderTotal
      )} so'm`,
    });
  }

  // Promokod
  const { discount, promo } = await calcDiscount(promoCode, subtotal);

  // Yetkazib berish
  const afterDiscount = subtotal - discount;
  const deliveryFee =
    afterDiscount >= settings.freeDeliveryFrom ? 0 : settings.deliveryFee;

  const total = afterDiscount + deliveryFee;

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
      subtotal,
      deliveryFee,
      discount,
      promoCode: promo?.code || null,
      total,
      location: location ? String(location) : null,
      status: 'yangi',
    },
  });

  if (promo) {
    await prisma.promoCode.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  // Botdan mijozga va adminga xabar
  notifyCustomer(user.telegramId, { ...order, items: safeItems });
  notifyAdmin({ ...order, items: safeItems }, user);

  res.status(201).json(order);
});

/** Buyurtma holatini o'zgartirish (Admin) */
ordersRouter.patch('/:id/status', requireAdmin, async (req, res) => {
  const status = String(req.body.status || '');

  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Noto\'g\'ri holat' });
  }

  try {
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: { user: true },
    });

    // Mijozga holat o'zgargani haqida xabar
    notifyStatus(order.user.telegramId, order);

    res.json(order);
  } catch {
    res.status(404).json({ error: 'Buyurtma topilmadi' });
  }
});

/** Buyurtmani o'chirish (Admin) */
ordersRouter.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Buyurtma topilmadi' });
  }
});

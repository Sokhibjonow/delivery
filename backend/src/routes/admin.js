import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAdmin, adminPassword } from '../auth.js';
import { broadcast } from '../bot.js';

export const adminRouter = Router();

/** Parolni tekshirish */
adminRouter.post('/login', (req, res) => {
  const { password } = req.body;

  if (String(password || '') === adminPassword()) {
    return res.json({ ok: true, key: adminPassword() });
  }

  res.status(401).json({ error: 'Parol noto\'g\'ri' });
});

/** Mijozlar bazasi: nechta buyurtma, qancha sarflagan */
adminRouter.get('/customers', requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    include: { orders: { select: { total: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const rows = users.map((u) => {
    const totals = u.orders.map((o) => o.total);
    const spent = totals.reduce((s, t) => s + t, 0);

    const last = u.orders
      .map((o) => o.createdAt)
      .sort((a, b) => new Date(b) - new Date(a))[0];

    return {
      id: u.id,
      telegramId: u.telegramId,
      name: u.name,
      phone: u.phone,
      createdAt: u.createdAt,
      ordersCount: u.orders.length,
      spent,
      avgCheck: u.orders.length ? Math.round(spent / u.orders.length) : 0,
      lastOrderAt: last || null,
    };
  });

  rows.sort((a, b) => b.spent - a.spent);

  res.json(rows);
});

/** Buyurtmalarni CSV (Excel) formatida yuklab olish */
adminRouter.get('/export/orders', requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  const head = [
    'Buyurtma',
    'Sana',
    'Mijoz',
    'Telefon',
    'Telegram ID',
    'Mahsulotlar',
    'Mahsulotlar summasi',
    'Yetkazish',
    'Chegirma',
    'Promokod',
    'Jami',
    'Manzil',
    'Holati',
  ];

  const lines = orders.map((o) => {
    const items = o.items
      .map((i) => {
        const size = i.size ? ` (${i.size})` : '';
        const tops = i.toppings?.length
          ? ` + ${i.toppings.map((t) => t.name).join(', ')}`
          : '';
        return `${i.name}${size}${tops} x${i.qty}`;
      })
      .join(' | ');

    return [
      o.id,
      new Date(o.createdAt).toLocaleString('ru-RU'),
      o.user?.name || '',
      o.user?.phone || '',
      o.user?.telegramId || '',
      items,
      o.subtotal,
      o.deliveryFee,
      o.discount,
      o.promoCode || '',
      o.total,
      o.location || '',
      o.status,
    ];
  });

  const csv = [head, ...lines]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')
    )
    .join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="buyurtmalar.csv"'
  );

  // BOM — Excel kirill/lotin harflarni to'g'ri ochishi uchun
  res.send('﻿' + csv);
});

/** Barcha mijozlarga bot orqali xabar yuborish */
adminRouter.post('/broadcast', requireAdmin, async (req, res) => {
  const { text } = req.body;

  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: 'Xabar matni bo\'sh' });
  }

  const users = await prisma.user.findMany({ select: { telegramId: true } });
  const ids = users
    .map((u) => u.telegramId)
    .filter((id) => /^\d+$/.test(id)); // demo foydalanuvchilarni chetlab o'tamiz

  const result = await broadcast(ids, String(text).trim());

  res.json(result);
});

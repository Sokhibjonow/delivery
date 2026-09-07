import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireCustomer } from '../telegramAuth.js';

export const favoritesRouter = Router();

/** Faqat so'rov yuborayotgan mijozning o'z sevimlilari */
favoritesRouter.get('/', requireCustomer, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { telegramId: req.customer.telegramId },
  });

  if (!user) return res.json([]);

  const rows = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(rows.map((r) => r.product));
});

/** Sevimlilarga qo'shish / olib tashlash */
favoritesRouter.post('/toggle', requireCustomer, async (req, res) => {
  const { productId } = req.body;

  const user = await prisma.user.upsert({
    where: { telegramId: req.customer.telegramId },
    update: {},
    create: { telegramId: req.customer.telegramId, name: req.customer.name },
  });

  const where = {
    userId_productId: { userId: user.id, productId: Number(productId) },
  };

  const existing = await prisma.favorite.findUnique({ where });

  if (existing) {
    await prisma.favorite.delete({ where });
    return res.json({ favorite: false });
  }

  await prisma.favorite.create({
    data: { userId: user.id, productId: Number(productId) },
  });

  res.json({ favorite: true });
});

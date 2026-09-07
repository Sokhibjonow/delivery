import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireCustomer } from '../telegramAuth.js';

export const usersRouter = Router();

/**
 * Mini App ochilganda mijozni bazaga yozadi / yangilaydi.
 * Kim ekanligi so'rov tanasidan emas, tekshirilgan initData'dan olinadi.
 */
usersRouter.post('/auth', requireCustomer, async (req, res) => {
  const { telegramId, name } = req.customer;

  const user = await prisma.user.upsert({
    where: { telegramId },
    update: { name },
    create: { telegramId, name, phone: null },
  });

  res.json({ ...user, verified: req.customer.verified });
});

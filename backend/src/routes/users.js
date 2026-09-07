import { Router } from 'express';
import { prisma } from '../prisma.js';

export const usersRouter = Router();

/** Mini App ochilganda mijozni bazaga yozadi / yangilaydi */
usersRouter.post('/auth', async (req, res) => {
  const { telegramId, name, phone } = req.body;

  if (!telegramId) return res.status(400).json({ error: 'telegramId kerak' });

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

  res.json(user);
});

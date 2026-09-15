import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireCustomer } from '../telegramAuth.js';
import { normalizeLang } from '../i18n.js';

export const usersRouter = Router();

/**
 * Mini App ochilganda mijozni bazaga yozadi / yangilaydi.
 * Kim ekanligi so'rov tanasidan emas, tekshirilgan initData'dan olinadi.
 */
usersRouter.post('/auth', requireCustomer, async (req, res) => {
  const { telegramId, name, languageCode, verified } = req.customer;

  const existing = await prisma.user.findUnique({ where: { telegramId } });

  // Til: mijoz tanlagani > bazadagi > Telegram tili
  const requested = req.body?.lang;
  const lang = requested
    ? normalizeLang(requested)
    : existing?.lang || normalizeLang(languageCode);

  // upsert — bir vaqtda kelgan so'rovlar to'qnashmasligi uchun
  const user = await prisma.user.upsert({
    where: { telegramId },
    // Telegram'dagi ismni har safar yangilab turamiz
    update: { name, lang },
    create: { telegramId, name, lang },
  });

  res.json({ ...user, verified });
});

/** Tilni o'zgartirish */
usersRouter.post('/lang', requireCustomer, async (req, res) => {
  const lang = normalizeLang(req.body?.lang);

  const user = await prisma.user.upsert({
    where: { telegramId: req.customer.telegramId },
    update: { lang },
    create: { telegramId: req.customer.telegramId, name: req.customer.name, lang },
  });

  res.json({ lang: user.lang });
});

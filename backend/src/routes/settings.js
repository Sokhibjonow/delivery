import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAdmin } from '../auth.js';

export const settingsRouter = Router();

/** Sozlamalarni oladi (bo'lmasa yaratadi) */
export async function getSettings() {
  let s = await prisma.setting.findUnique({ where: { id: 1 } });
  if (!s) s = await prisma.setting.create({ data: { id: 1 } });
  return s;
}

/** Hozir do'kon ochiqmi? (Toshkent vaqti bo'yicha) */
export function isOpenNow(settings) {
  if (settings.alwaysOpen) return true;

  const now = new Date();
  const tashkent = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' })
  );

  const minutes = tashkent.getHours() * 60 + tashkent.getMinutes();
  const [fh, fm] = settings.workFrom.split(':').map(Number);
  const [th, tm] = settings.workTo.split(':').map(Number);

  const from = fh * 60 + fm;
  const to = th * 60 + tm;

  // Yarim tundan oshadigan ish vaqti (masalan 10:00 - 02:00)
  if (to <= from) return minutes >= from || minutes < to;

  return minutes >= from && minutes < to;
}

/** Mini App uchun ochiq sozlamalar */
settingsRouter.get('/', async (_req, res) => {
  const s = await getSettings();

  res.json({
    ...s,
    isOpenNow: isOpenNow(s),
    shopName: process.env.SHOP_NAME || 'Pizza',
  });
});

/** Sozlamalarni tahrirlash (Admin) */
settingsRouter.put('/', requireAdmin, async (req, res) => {
  const {
    workFrom,
    workTo,
    alwaysOpen,
    deliveryFee,
    freeDeliveryFrom,
    minOrderTotal,
  } = req.body;

  const s = await prisma.setting.upsert({
    where: { id: 1 },
    update: {
      workFrom: String(workFrom),
      workTo: String(workTo),
      alwaysOpen: Boolean(alwaysOpen),
      deliveryFee: Number(deliveryFee) || 0,
      freeDeliveryFrom: Number(freeDeliveryFrom) || 0,
      minOrderTotal: Number(minOrderTotal) || 0,
    },
    create: { id: 1 },
  });

  res.json({ ...s, isOpenNow: isOpenNow(s) });
});

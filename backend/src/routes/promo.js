import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAdmin } from '../auth.js';

export const promoRouter = Router();

/** Promokod bo'yicha chegirmani hisoblaydi */
export async function calcDiscount(code, subtotal) {
  if (!code) return { discount: 0, promo: null };

  const promo = await prisma.promoCode.findUnique({
    where: { code: String(code).trim().toUpperCase() },
  });

  if (!promo || !promo.active) {
    return { discount: 0, promo: null, error: 'Bunday promokod topilmadi' };
  }

  if (subtotal < promo.minTotal) {
    return {
      discount: 0,
      promo: null,
      error: `Bu promokod ${new Intl.NumberFormat('ru-RU').format(
        promo.minTotal
      )} so'mdan yuqori buyurtmalarga amal qiladi`,
    };
  }

  const discount =
    promo.type === 'percent'
      ? Math.round((subtotal * promo.value) / 100)
      : Math.min(promo.value, subtotal);

  return { discount, promo };
}

/** Mini App: promokodni tekshirish */
promoRouter.post('/check', async (req, res) => {
  const { code, subtotal } = req.body;

  const { discount, promo, error } = await calcDiscount(
    code,
    Number(subtotal) || 0
  );

  if (error) return res.status(400).json({ error });

  res.json({
    ok: true,
    code: promo.code,
    discount,
    label:
      promo.type === 'percent'
        ? `${promo.value}% chegirma`
        : `${new Intl.NumberFormat('ru-RU').format(promo.value)} so'm chegirma`,
  });
});

/* ---------- Admin ---------- */

promoRouter.get('/', requireAdmin, async (_req, res) => {
  res.json(await prisma.promoCode.findMany({ orderBy: { id: 'desc' } }));
});

promoRouter.post('/', requireAdmin, async (req, res) => {
  const { code, type, value, minTotal } = req.body;

  if (!code || !value) {
    return res.status(400).json({ error: 'Kod va qiymat majburiy' });
  }

  try {
    const p = await prisma.promoCode.create({
      data: {
        code: String(code).trim().toUpperCase(),
        type: type === 'amount' ? 'amount' : 'percent',
        value: Number(value),
        minTotal: Number(minTotal) || 0,
      },
    });

    res.status(201).json(p);
  } catch {
    res.status(400).json({ error: 'Bunday kod allaqachon mavjud' });
  }
});

promoRouter.put('/:id', requireAdmin, async (req, res) => {
  const { code, type, value, minTotal, active } = req.body;

  try {
    const p = await prisma.promoCode.update({
      where: { id: Number(req.params.id) },
      data: {
        code: String(code).trim().toUpperCase(),
        type: type === 'amount' ? 'amount' : 'percent',
        value: Number(value),
        minTotal: Number(minTotal) || 0,
        active: Boolean(active),
      },
    });

    res.json(p);
  } catch {
    res.status(404).json({ error: 'Topilmadi' });
  }
});

promoRouter.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.promoCode.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Topilmadi' });
  }
});

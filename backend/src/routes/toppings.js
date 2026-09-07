import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAdmin } from '../auth.js';

export const toppingsRouter = Router();

/** Faol qo'shimchalar ro'yxati */
toppingsRouter.get('/', async (_req, res) => {
  const list = await prisma.topping.findMany({
    where: { active: true },
    orderBy: { id: 'asc' },
  });

  res.json(list);
});

/** Barcha qo'shimchalar (Admin) */
toppingsRouter.get('/all', requireAdmin, async (_req, res) => {
  res.json(await prisma.topping.findMany({ orderBy: { id: 'asc' } }));
});

toppingsRouter.post('/', requireAdmin, async (req, res) => {
  const { name, price, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Nom va narx majburiy' });
  }

  const t = await prisma.topping.create({
    data: {
      name: String(name),
      price: Number(price),
      category: String(category || 'Pizza'),
    },
  });

  res.status(201).json(t);
});

toppingsRouter.put('/:id', requireAdmin, async (req, res) => {
  const { name, price, active, category } = req.body;

  try {
    const t = await prisma.topping.update({
      where: { id: Number(req.params.id) },
      data: {
        name: String(name),
        price: Number(price),
        active: Boolean(active),
        category: String(category || 'Pizza'),
      },
    });

    res.json(t);
  } catch {
    res.status(404).json({ error: 'Topilmadi' });
  }
});

toppingsRouter.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.topping.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Topilmadi' });
  }
});

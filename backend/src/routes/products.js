import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAdmin } from '../auth.js';

export const productsRouter = Router();

/** Barcha mahsulotlar (ixtiyoriy ?category=Pizza) */
productsRouter.get('/', async (req, res) => {
  const { category } = req.query;

  const where =
    category && category !== 'Hammasi' ? { category: String(category) } : {};

  const products = await prisma.product.findMany({
    where,
    orderBy: { id: 'asc' },
  });

  res.json(products);
});

/** Kategoriyalar ro'yxati */
productsRouter.get('/categories', async (_req, res) => {
  const rows = await prisma.product.findMany({
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' },
  });

  res.json(['Hammasi', ...rows.map((r) => r.category)]);
});

/** Bitta mahsulot */
productsRouter.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' });
  res.json(product);
});

/** Yangi mahsulot (Admin) */
productsRouter.post('/', requireAdmin, async (req, res) => {
  const { name, nameRu, description, descriptionRu, imageUrl, oldPrice, newPrice, category, sizes } = req.body;

  if (!name || !newPrice || !category) {
    return res
      .status(400)
      .json({ error: 'Nom, yangi narx va kategoriya majburiy' });
  }

  const product = await prisma.product.create({
    data: {
      name: String(name),
      nameRu: nameRu ? String(nameRu) : null,
      description: String(description || ''),
      descriptionRu: descriptionRu ? String(descriptionRu) : null,
      imageUrl: String(imageUrl || ''),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      newPrice: Number(newPrice),
      category: String(category),
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : null,
    },
  });

  res.status(201).json(product);
});

/** Mahsulotni tahrirlash (Admin) */
productsRouter.put('/:id', requireAdmin, async (req, res) => {
  const { name, nameRu, description, descriptionRu, imageUrl, oldPrice, newPrice, category, sizes } = req.body;

  try {
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        name: String(name),
        nameRu: nameRu ? String(nameRu) : null,
        description: String(description || ''),
        descriptionRu: descriptionRu ? String(descriptionRu) : null,
        imageUrl: String(imageUrl || ''),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        newPrice: Number(newPrice),
        category: String(category),
        sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : null,
      },
    });

    res.json(product);
  } catch {
    res.status(404).json({ error: 'Mahsulot topilmadi' });
  }
});

/** Mahsulotni o'chirish (Admin) */
productsRouter.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Mahsulot topilmadi' });
  }
});

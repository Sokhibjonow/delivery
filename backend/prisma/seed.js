import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PIZZA_SIZES = [
  { label: '25 sm', delta: 0 },
  { label: '30 sm', delta: 15000 },
  { label: '35 sm', delta: 28000 },
];

const products = [
  {
    name: 'Margarita',
    description:
      'Klassik italyan pizzasi. Yupqa xamir, mazali tomat sousi va cho’zilib turadigan mozzarella pishlog’i.',
    imageUrl:
      'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80',
    oldPrice: 65000,
    newPrice: 49000,
    category: 'Pizza',
    sizes: PIZZA_SIZES,
  },
  {
    name: 'Peperoni',
    description:
      'Achchiqroq peperoni kolbasasi, qo’sh mozzarella va maxsus tomat sousi bilan tayyorlangan eng ommabop pizza.',
    imageUrl:
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
    oldPrice: 89000,
    newPrice: 69000,
    category: 'Pizza',
    sizes: PIZZA_SIZES,
  },
  {
    name: 'Qazi pizza',
    description:
      'Milliy ta’m! Tabiiy ot qazisi, qizil piyoz, bulg’or qalampiri va mozzarella pishlog’i.',
    imageUrl:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    oldPrice: 110000,
    newPrice: 89000,
    category: 'Pizza',
    sizes: PIZZA_SIZES,
  },
  {
    name: 'Pishloqli',
    description:
      'To’rt xil pishloq uyg’unligi: mozzarella, chedder, parmezan va suzma pishloq. Pishloq shinavandalari uchun.',
    imageUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    oldPrice: 95000,
    newPrice: 75000,
    category: 'Pizza',
    sizes: PIZZA_SIZES,
  },
  {
    name: 'Coca-Cola 0.5L',
    description: 'Muzdek Coca-Cola. Pizza uchun eng yaxshi hamroh.',
    imageUrl:
      'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80',
    oldPrice: null,
    newPrice: 5000,
    category: 'Ichimliklar',
    sizes: null,
  },
];

const toppings = [
  { name: 'Qo’shimcha mozzarella', price: 8000 },
  { name: 'Qo’ziqorin', price: 6000 },
  { name: 'Peperoni kolbasa', price: 10000 },
  { name: 'Zaytun', price: 5000 },
  { name: 'Bulg’or qalampiri', price: 4000 },
  { name: 'Achchiq jalapeño', price: 4000 },
];

const promos = [
  { code: 'PIZZA10', type: 'percent', value: 10, minTotal: 0 },
  { code: 'YANGI20', type: 'amount', value: 20000, minTotal: 100000 },
];

async function main() {
  console.log('Seed boshlandi...\n');

  // --- Mahsulotlar ---
  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });

    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: p });
      console.log(`  yangilandi : ${p.name}`);
    } else {
      await prisma.product.create({ data: p });
      console.log(`  qo'shildi   : ${p.name}`);
    }
  }

  // --- Qo'shimchalar ---
  console.log('');
  for (const t of toppings) {
    const existing = await prisma.topping.findFirst({ where: { name: t.name } });

    if (!existing) {
      await prisma.topping.create({ data: t });
      console.log(`  qo'shimcha  : ${t.name}`);
    }
  }

  // --- Promokodlar ---
  console.log('');
  for (const p of promos) {
    await prisma.promoCode.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
    console.log(`  promokod    : ${p.code}`);
  }

  // --- Sozlamalar ---
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  // --- Eski buyurtmalar holatini yangi tizimga o'tkazish ---
  const migrated = await prisma.order.updateMany({
    where: { status: 'kutilmoqda' },
    data: { status: 'yangi' },
  });

  if (migrated.count > 0) {
    console.log(`\n  ${migrated.count} ta eski buyurtma holati yangilandi`);
  }

  console.log('\nSeed tugadi.');
  console.log(`  Mahsulotlar  : ${await prisma.product.count()}`);
  console.log(`  Qo'shimchalar: ${await prisma.topping.count()}`);
  console.log(`  Promokodlar  : ${await prisma.promoCode.count()}`);
}

main()
  .catch((e) => {
    console.error('Seed xatosi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

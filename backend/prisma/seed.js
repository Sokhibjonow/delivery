import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  },
  {
    name: 'Coca-Cola 0.5L',
    description: 'Muzdek Coca-Cola. Pizza uchun eng yaxshi hamroh.',
    imageUrl:
      'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80',
    oldPrice: null,
    newPrice: 5000,
    category: 'Ichimliklar',
  },
];

async function main() {
  console.log('Seed boshlandi...');

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

  const total = await prisma.product.count();
  console.log(`Seed tugadi. Bazadagi mahsulotlar soni: ${total}`);
}

main()
  .catch((e) => {
    console.error('Seed xatosi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

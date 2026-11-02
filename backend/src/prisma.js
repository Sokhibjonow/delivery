import { PrismaClient } from '@prisma/client';

/**
 * Neon bazasi bir necha daqiqa ishlatilmasa uxlab qoladi va uyg'onishi
 * 5–15 soniya olishi mumkin. Prisma'ning standart kutish vaqti atigi
 * 5 soniya — shuning uchun birinchi so'rov "Can't reach database server"
 * xatosi bilan uzilardi. Kutish vaqtini uzaytiramiz.
 */
function withTimeouts(url) {
  if (!url) return url;

  try {
    const u = new URL(url);

    if (!u.searchParams.has('connect_timeout')) {
      u.searchParams.set('connect_timeout', '30');
    }

    if (!u.searchParams.has('pool_timeout')) {
      u.searchParams.set('pool_timeout', '30');
    }

    return u.toString();
  } catch {
    // Manzil tushunarsiz bo'lsa o'zgartirmaymiz
    return url;
  }
}

export const prisma = new PrismaClient({
  datasourceUrl: withTimeouts(process.env.DATABASE_URL),
});

/**
 * Server ishga tushganda bazani oldindan uyg'otadi — shunda birinchi
 * mijoz kutib qolmaydi. Baza uxlab qolgan bo'lsa qayta urinadi.
 */
export async function warmUpDatabase(attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[db] baza tayyor');
      return true;
    } catch (e) {
      console.warn(`[db] ulanmadi (${i}/${attempts}):`, e.message.split('\n')[0]);
      if (i < attempts) await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.error('[db] bazaga ulanib bo\'lmadi — DATABASE_URL ni tekshiring');
  return false;
}

import { Telegraf, Markup } from 'telegraf';
import { prisma } from './prisma.js';
import { t, normalizeLang, MULTILANG } from './i18n.js';

const token = process.env.BOT_TOKEN;
const shopName = process.env.SHOP_NAME || 'Pizza';

export const bot = token ? new Telegraf(token) : null;

// Tunnel manzili dastur ishlab turganda ham o'zgartirilishi mumkin
let webAppUrl = (process.env.WEBAPP_URL || '').trim();

function isReady() {
  return webAppUrl.startsWith('https://');
}

function menuKeyboard(lang) {
  const tr = t(lang);

  if (isReady()) {
    return Markup.keyboard([
      [Markup.button.webApp(tr('orderBtn'), webAppUrl)],
      [Markup.button.contactRequest(tr('contactBtn'))],
    ]).resize();
  }

  return Markup.removeKeyboard();
}

/** Foydalanuvchini bazadan topadi yoki yaratadi va tilini qaytaradi */
async function touchUser(ctx) {
  const telegramId = String(ctx.from.id);

  const name =
    [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') ||
    ctx.from.username ||
    'Mehmon';

  const existing = await prisma.user.findUnique({ where: { telegramId } });

  if (existing) {
    // Telegram'dagi ism o'zgargan bo'lsa yangilaymiz
    if (existing.name !== name) {
      return prisma.user.update({ where: { telegramId }, data: { name } });
    }
    return existing;
  }

  return prisma.user.create({
    data: { telegramId, name, lang: normalizeLang(ctx.from.language_code) },
  });
}

if (bot) {
  bot.start(async (ctx) => {
    const user = await touchUser(ctx);
    const tr = t(user.lang);

    const text = isReady()
      ? tr('welcome', user.name, shopName)
      : tr('notReady', user.name, shopName);

    await ctx.reply(text, menuKeyboard(user.lang));
  });

  bot.command('menu', async (ctx) => {
    const user = await touchUser(ctx);
    await ctx.reply(t(user.lang)('menu'), menuKeyboard(user.lang));
  });

  bot.command('id', async (ctx) => {
    const user = await touchUser(ctx);
    await ctx.reply(t(user.lang)('yourId', ctx.from.id));
  });

  // Til almashtirish: /uz va /ru (ko'p tillilik yoqilgan bo'lsa)
  if (MULTILANG) {
    bot.command(['uz', 'ru'], async (ctx) => {
      const lang = ctx.message.text.includes('ru') ? 'ru' : 'uz';

      await touchUser(ctx);
      await prisma.user.update({
        where: { telegramId: String(ctx.from.id) },
        data: { lang },
      });

      await ctx.reply(t(lang)('langChanged'), menuKeyboard(lang));
    });
  }

  // Mijoz telefon raqamini yuborganda bazaga saqlaymiz
  bot.on('contact', async (ctx) => {
    const phone = ctx.message.contact.phone_number;
    const user = await touchUser(ctx);

    await prisma.user.update({
      where: { telegramId: String(ctx.from.id) },
      data: { phone },
    });

    await ctx.reply(t(user.lang)('phoneSaved', phone), menuKeyboard(user.lang));
  });

  bot.on('message', async (ctx) => {
    const user = await touchUser(ctx);
    await ctx.reply(t(user.lang)('pressButton'), menuKeyboard(user.lang));
  });

  bot.catch((err) => {
    console.error('[bot] xato:', err.message);
  });
}

/** Mini App manzilini yangilaydi va Telegram menyu tugmasini qayta sozlaydi */
export async function setWebAppUrl(url) {
  const clean = String(url || '').trim();

  if (!clean.startsWith('https://')) {
    console.warn('[bot] noto\'g\'ri manzil:', clean);
    return false;
  }

  webAppUrl = clean;

  if (!bot) return false;

  try {
    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: 'web_app',
        text: 'Buyurtma',
        web_app: { url: clean },
      },
    });

    console.log('[bot] Mini App manzili ulandi:', clean);
    return true;
  } catch (e) {
    console.error('[bot] menyu tugmasi xatosi:', e.message);
    return false;
  }
}

export function getWebAppUrl() {
  return webAppUrl;
}

/* ---------- Buyurtma xabarlari ---------- */

export const STATUS_LABELS = {
  yangi: 'Yangi',
  tayyorlanmoqda: 'Tayyorlanmoqda',
  yolda: "Yo'lda",
  yetkazildi: 'Yetkazildi',
  bekor: 'Bekor qilindi',
};

const STATUS_KEYS = {
  tayyorlanmoqda: 'statusCooking',
  yolda: 'statusRoad',
  yetkazildi: 'statusDone',
  bekor: 'statusCancel',
};

/** Holat o'zgarganda mijozga xabar */
export async function notifyStatus(telegramId, order, lang = 'uz') {
  if (!bot) return;

  const key = STATUS_KEYS[order.status];
  if (!key) return;

  const tr = t(lang);

  try {
    await bot.telegram.sendMessage(
      telegramId,
      `${tr('orderLabel', order.id)}\n\n${tr(key)}`
    );
  } catch (e) {
    console.error('[bot] holat xabari yuborilmadi:', e.message);
  }
}

/** Mijozga buyurtma qabul qilingani haqida xabar yuboradi */
export async function notifyCustomer(telegramId, order, lang = 'uz') {
  if (!bot) return;

  const tr = t(lang);
  const sum = tr('sum');

  const list = order.items
    .map((i) => {
      const size = i.size ? ` (${i.size})` : '';
      const tops = i.toppings?.length
        ? `\n     + ${i.toppings.map((x) => x.name).join(', ')}`
        : '';
      return `  • ${i.name}${size} × ${i.qty} — ${fmt(
        i.price * i.qty
      )} ${sum}${tops}`;
    })
    .join('\n');

  const rows = [
    tr('orderAccepted'),
    '',
    tr('orderNumber', order.id),
    list,
    '',
    `${tr('products')}: ${fmt(order.subtotal)} ${sum}`,
  ];

  if (order.discount > 0) {
    rows.push(
      `${tr('discount')}${order.promoCode ? ` (${order.promoCode})` : ''}: −${fmt(
        order.discount
      )} ${sum}`
    );
  }

  rows.push(
    `${tr('delivery')}: ${
      order.deliveryFee > 0 ? `${fmt(order.deliveryFee)} ${sum}` : tr('free')
    }`
  );

  rows.push('', `${tr('total')}: ${fmt(order.total)} ${sum}`);

  try {
    await bot.telegram.sendMessage(telegramId, rows.join('\n'));
  } catch (e) {
    console.error('[bot] xabar yuborilmadi:', e.message);
  }
}

/** Adminga yangi buyurtma haqida ma'lumot beradi (doim o'zbekcha) */
export async function notifyAdmin(order, user) {
  const adminId = process.env.ADMIN_TELEGRAM_ID;
  if (!bot || !adminId) return;

  const list = order.items
    .map((i) => {
      const size = i.size ? ` (${i.size})` : '';
      const tops = i.toppings?.length
        ? ` + ${i.toppings.map((x) => x.name).join(', ')}`
        : '';
      return `  • ${i.name}${size}${tops} × ${i.qty}`;
    })
    .join('\n');

  const text =
    `🔔 Yangi buyurtma #${order.id}\n\n` +
    `👤 ${user.name}\n` +
    `📞 ${user.phone || '—'}\n` +
    `📍 ${order.location || '—'}\n\n` +
    `${list}\n\n` +
    `💰 Jami: ${fmt(order.total)} so'm`;

  try {
    await bot.telegram.sendMessage(adminId, text);
  } catch (e) {
    console.error('[bot] admin xabari yuborilmadi:', e.message);
  }
}

/** Barcha mijozlarga reklama xabari */
export async function broadcast(telegramIds, text) {
  if (!bot) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const id of telegramIds) {
    try {
      await bot.telegram.sendMessage(id, text);
      sent++;
    } catch {
      failed++;
    }

    // Telegram limitiga tushib qolmaslik uchun kichik pauza
    await new Promise((r) => setTimeout(r, 60));
  }

  console.log(`[bot] reklama yuborildi: ${sent} ta, xato: ${failed} ta`);
  return { sent, failed };
}

function fmt(n) {
  return new Intl.NumberFormat('ru-RU').format(n);
}

export async function startBot() {
  if (!bot) {
    console.warn('[bot] BOT_TOKEN topilmadi — bot ishga tushmadi');
    return;
  }

  if (isReady()) {
    await setWebAppUrl(webAppUrl);
  } else {
    console.log('[bot] Tunnel manzili kutilmoqda (tunnel.js uni yuboradi)...');
  }

  bot.launch({ dropPendingUpdates: true }).catch((e) => {
    console.error('[bot] polling to\'xtadi:', e.message);
  });

  const me = await bot.telegram.getMe();
  console.log(`[bot] @${me.username} ishga tushdi`);

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

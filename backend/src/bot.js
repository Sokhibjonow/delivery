import { Telegraf, Markup } from 'telegraf';
import { prisma } from './prisma.js';

const token = process.env.BOT_TOKEN;
const shopName = process.env.SHOP_NAME || 'Pizza';

export const bot = token ? new Telegraf(token) : null;

// Tunnel manzili dastur ishlab turganda ham o'zgartirilishi mumkin
let webAppUrl = (process.env.WEBAPP_URL || '').trim();

function isReady() {
  return webAppUrl.startsWith('https://');
}

function menuKeyboard() {
  if (isReady()) {
    return Markup.keyboard([
      [Markup.button.webApp('🍕 Buyurtma berish', webAppUrl)],
      [Markup.button.contactRequest('📞 Raqamimni yuborish')],
    ]).resize();
  }
  return Markup.removeKeyboard();
}

if (bot) {
  bot.start(async (ctx) => {
    const name = ctx.from.first_name || 'Mehmon';

    const text = isReady()
      ? `Assalomu alaykum, ${name}! 👋\n\n` +
        `${shopName} ga xush kelibsiz 🍕\n\n` +
        `Pastdagi «🍕 Buyurtma berish» tugmasini bosing va issiqqina pizzalarni tanlang.`
      : `Assalomu alaykum, ${name}! 👋\n\n` +
        `${shopName} ga xush kelibsiz 🍕\n\n` +
        `⚠️ Ilova hozircha sozlanmoqda. Iltimos, biroz kuting.`;

    await ctx.reply(text, menuKeyboard());
  });

  bot.command('menu', async (ctx) => {
    await ctx.reply('Menyu 👇', menuKeyboard());
  });

  bot.command('id', async (ctx) => {
    await ctx.reply(`Sizning Telegram ID'ingiz: ${ctx.from.id}`);
  });

  // Mijoz telefon raqamini yuborganda bazaga saqlaymiz
  bot.on('contact', async (ctx) => {
    const phone = ctx.message.contact.phone_number;
    const telegramId = String(ctx.from.id);

    const name =
      [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') ||
      'Mehmon';

    await prisma.user.upsert({
      where: { telegramId },
      update: { phone },
      create: { telegramId, name, phone },
    });

    await ctx.reply(
      `Rahmat! Raqamingiz saqlandi: ${phone}\n\n` +
        `Endi buyurtma berishda uni qayta yozish shart emas 👍`,
      menuKeyboard()
    );
  });

  bot.on('message', async (ctx) => {
    await ctx.reply(
      'Buyurtma berish uchun pastdagi tugmani bosing 👇',
      menuKeyboard()
    );
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

const STATUS_MESSAGES = {
  tayyorlanmoqda:
    'Buyurtmangiz tayyorlanmoqda 👨‍🍳\nOshpazlarimiz ish boshladi!',
  yolda: "Kuryerimiz yo'lga chiqdi 🛵\nTez orada eshigingiz oldida bo'ladi.",
  yetkazildi: 'Buyurtmangiz yetkazildi 🍕\nYoqimli ishtaha! Rahmat 💚',
  bekor:
    'Afsuski, buyurtmangiz bekor qilindi ❌\nSavollar bo\'lsa biz bilan bog\'laning.',
};

/** Holat o'zgarganda mijozga xabar */
export async function notifyStatus(telegramId, order) {
  if (!bot) return;

  const message = STATUS_MESSAGES[order.status];
  if (!message) return;

  try {
    await bot.telegram.sendMessage(
      telegramId,
      `🧾 Buyurtma #${order.id}\n\n${message}`
    );
  } catch (e) {
    console.error('[bot] holat xabari yuborilmadi:', e.message);
  }
}

/** Mijozga buyurtma qabul qilingani haqida xabar yuboradi */
export async function notifyCustomer(telegramId, order) {
  if (!bot) return;

  const list = order.items
    .map((i) => {
      const size = i.size ? ` (${i.size})` : '';
      const tops = i.toppings?.length
        ? `\n     + ${i.toppings.map((t) => t.name).join(', ')}`
        : '';
      return `  • ${i.name}${size} × ${i.qty} — ${fmt(
        i.price * i.qty
      )} so'm${tops}`;
    })
    .join('\n');

  const rows = [
    `Buyurtmangiz muvaffaqiyatli qabul qilindi! Kuryerimiz tez orada bog'lanadi 🍕`,
    ``,
    `🧾 Buyurtma raqami: #${order.id}`,
    list,
    ``,
    `Mahsulotlar: ${fmt(order.subtotal)} so'm`,
  ];

  if (order.discount > 0) {
    rows.push(
      `Chegirma${order.promoCode ? ` (${order.promoCode})` : ''}: −${fmt(
        order.discount
      )} so'm`
    );
  }

  rows.push(
    `Yetkazib berish: ${
      order.deliveryFee > 0 ? fmt(order.deliveryFee) + " so'm" : 'Bepul'
    }`
  );
  rows.push(``, `💰 Jami: ${fmt(order.total)} so'm`);

  try {
    await bot.telegram.sendMessage(telegramId, rows.join('\n'));
  } catch (e) {
    console.error('[bot] xabar yuborilmadi:', e.message);
  }
}

/** Adminga yangi buyurtma haqida ma'lumot beradi */
export async function notifyAdmin(order, user) {
  const adminId = process.env.ADMIN_TELEGRAM_ID;
  if (!bot || !adminId) return;

  const list = order.items
    .map((i) => {
      const size = i.size ? ` (${i.size})` : '';
      const tops = i.toppings?.length
        ? ` + ${i.toppings.map((t) => t.name).join(', ')}`
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

  // Kod o'zgarganda server qayta ishga tushsa, eski sessiya bilan
  // to'qnashuv bo'lmasligi uchun xatoni yutamiz
  bot.launch({ dropPendingUpdates: true }).catch((e) => {
    console.error('[bot] polling to\'xtadi:', e.message);
  });

  const me = await bot.telegram.getMe();
  console.log(`[bot] @${me.username} ishga tushdi`);

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

import { Telegraf, Markup } from 'telegraf';

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

/** Mijozga buyurtma qabul qilingani haqida xabar yuboradi */
export async function notifyCustomer(telegramId, order) {
  if (!bot) return;

  const list = order.items
    .map((i) => `  • ${i.name} × ${i.qty} — ${fmt(i.price * i.qty)} so'm`)
    .join('\n');

  const text =
    `Buyurtmangiz muvaffaqiyatli qabul qilindi! Kuryerimiz tez orada bog'lanadi 🍕\n\n` +
    `🧾 Buyurtma raqami: #${order.id}\n` +
    `${list}\n\n` +
    `💰 Jami: ${fmt(order.total)} so'm`;

  try {
    await bot.telegram.sendMessage(telegramId, text);
  } catch (e) {
    console.error('[bot] xabar yuborilmadi:', e.message);
  }
}

/** Adminga yangi buyurtma haqida ma'lumot beradi */
export async function notifyAdmin(order, user) {
  const adminId = process.env.ADMIN_TELEGRAM_ID;
  if (!bot || !adminId) return;

  const list = order.items.map((i) => `  • ${i.name} × ${i.qty}`).join('\n');

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

  bot.launch();
  const me = await bot.telegram.getMe();
  console.log(`[bot] @${me.username} ishga tushdi`);

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

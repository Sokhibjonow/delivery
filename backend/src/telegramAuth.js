import crypto from 'node:crypto';

/**
 * Telegram'dan kelgan initData'ni bot tokeni bilan tekshiradi.
 * Bu mijozni ishonchli aniqlashning yagona to'g'ri yo'li —
 * foydalanuvchi o'z ID'sini o'zgartira olmaydi.
 */
export function verifyInitData(initData, botToken) {
  if (!initData || !botToken) return null;

  let params;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return null;
  }

  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculated = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');

  if (calculated !== hash) return null;

  // initData localStorage'da saqlanadi, shuning uchun 30 kunlik muddat beramiz
  const authDate = Number(params.get('auth_date'));
  if (authDate && Date.now() / 1000 - authDate > 60 * 60 * 24 * 30) return null;

  const raw = params.get('user');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Har bir so'rovda mijozni aniqlaydi.
 * 1) Telegram initData (tekshirilgan) — asosiy yo'l
 * 2) Brauzerda test qilish uchun qurilmaga xos mehmon ID'si
 */
export function identify(req, _res, next) {
  const initData = req.get('x-init-data') || '';
  const tgUser = verifyInitData(initData, process.env.BOT_TOKEN);

  if (tgUser?.id) {
    req.customer = {
      telegramId: String(tgUser.id),
      name:
        [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') ||
        'Mehmon',
      verified: true,
    };
    return next();
  }

  const guest = req.get('x-guest-id') || '';

  if (/^guest-[a-z0-9]{8,40}$/i.test(guest)) {
    req.customer = { telegramId: guest, name: 'Mehmon', verified: false };
    return next();
  }

  req.customer = null;
  next();
}

/** Mijoz aniqlanmagan bo'lsa so'rovni to'xtatadi */
export function requireCustomer(req, res, next) {
  if (!req.customer) {
    return res.status(401).json({ error: 'Foydalanuvchi aniqlanmadi' });
  }
  next();
}

// Bot xabarlari uchun tarjimalar (o'zbek / rus)

/**
 * Ko'p tillilik yoqilganmi?
 * Rus tilini qayta yoqish uchun buni true ga o'zgartiring.
 * Bu qiymat miniapp/src/i18n.js dagi MULTILANG bilan bir xil bo'lishi kerak.
 */
export const MULTILANG = false;

const MESSAGES = {
  uz: {
    welcome: (name, shop) =>
      `Assalomu alaykum, ${name}! 👋\n\n` +
      `${shop} ga xush kelibsiz 🍕\n\n` +
      `Pastdagi «🍕 Buyurtma berish» tugmasini bosing va issiqqina pizzalarni tanlang.`,
    notReady: (name, shop) =>
      `Assalomu alaykum, ${name}! 👋\n\n` +
      `${shop} ga xush kelibsiz 🍕\n\n` +
      `⚠️ Ilova hozircha sozlanmoqda. Iltimos, biroz kuting.`,
    menu: 'Menyu 👇',
    orderBtn: '🍕 Buyurtma berish',
    contactBtn: '📞 Raqamimni yuborish',
    yourId: (id) => `Sizning Telegram ID'ingiz: ${id}`,
    phoneSaved: (phone) =>
      `Rahmat! Raqamingiz saqlandi: ${phone}\n\n` +
      `Endi buyurtma berishda uni qayta yozish shart emas 👍`,
    pressButton: 'Buyurtma berish uchun pastdagi tugmani bosing 👇',
    langChanged: 'Til o\'zgartirildi ✅',

    orderAccepted:
      'Buyurtmangiz muvaffaqiyatli qabul qilindi! Kuryerimiz tez orada bog\'lanadi 🍕',
    orderNumber: (id) => `🧾 Buyurtma raqami: #${id}`,
    products: 'Mahsulotlar',
    discount: 'Chegirma',
    delivery: 'Yetkazib berish',
    free: 'Bepul',
    total: '💰 Jami',
    sum: 'so\'m',

    statusCooking: 'Buyurtmangiz tayyorlanmoqda 👨‍🍳\nOshpazlarimiz ish boshladi!',
    statusRoad: 'Kuryerimiz yo\'lga chiqdi 🛵\nTez orada eshigingiz oldida bo\'ladi.',
    statusDone: 'Buyurtmangiz yetkazildi 🍕\nYoqimli ishtaha! Rahmat 💚',
    statusCancel:
      'Afsuski, buyurtmangiz bekor qilindi ❌\nSavollar bo\'lsa biz bilan bog\'laning.',
    orderLabel: (id) => `🧾 Buyurtma #${id}`,
  },

  ru: {
    welcome: (name, shop) =>
      `Здравствуйте, ${name}! 👋\n\n` +
      `Добро пожаловать в ${shop} 🍕\n\n` +
      `Нажмите кнопку «🍕 Сделать заказ» ниже и выберите горячую пиццу.`,
    notReady: (name, shop) =>
      `Здравствуйте, ${name}! 👋\n\n` +
      `Добро пожаловать в ${shop} 🍕\n\n` +
      `⚠️ Приложение пока настраивается. Пожалуйста, подождите.`,
    menu: 'Меню 👇',
    orderBtn: '🍕 Сделать заказ',
    contactBtn: '📞 Отправить мой номер',
    yourId: (id) => `Ваш Telegram ID: ${id}`,
    phoneSaved: (phone) =>
      `Спасибо! Ваш номер сохранён: ${phone}\n\n` +
      `Теперь при заказе его не нужно вводить заново 👍`,
    pressButton: 'Чтобы сделать заказ, нажмите кнопку ниже 👇',
    langChanged: 'Язык изменён ✅',

    orderAccepted:
      'Ваш заказ успешно принят! Курьер свяжется с вами в ближайшее время 🍕',
    orderNumber: (id) => `🧾 Номер заказа: #${id}`,
    products: 'Товары',
    discount: 'Скидка',
    delivery: 'Доставка',
    free: 'Бесплатно',
    total: '💰 Итого',
    sum: 'сум',

    statusCooking: 'Ваш заказ готовится 👨‍🍳\nНаши повара уже приступили!',
    statusRoad: 'Курьер выехал 🛵\nСкоро будет у вашей двери.',
    statusDone: 'Ваш заказ доставлен 🍕\nПриятного аппетита! Спасибо 💚',
    statusCancel:
      'К сожалению, ваш заказ отменён ❌\nЕсли есть вопросы — свяжитесь с нами.',
    orderLabel: (id) => `🧾 Заказ #${id}`,
  },
};

export function normalizeLang(code) {
  if (!MULTILANG) return 'uz';

  const c = String(code || '').toLowerCase();
  if (c.startsWith('ru') || c === 'be' || c === 'kk') return 'ru';
  return 'uz';
}

/** Tanlangan til uchun matn oluvchi funksiya */
export function t(lang) {
  const pack = (MULTILANG && MESSAGES[lang]) || MESSAGES.uz;

  return (key, ...args) => {
    const value = pack[key] ?? MESSAGES.uz[key];
    return typeof value === 'function' ? value(...args) : value;
  };
}

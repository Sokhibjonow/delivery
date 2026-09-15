import { createContext, useContext } from "react";

/**
 * Ko'p tillilik yoqilganmi?
 * Rus tilini qayta yoqish uchun buni true ga o'zgartiring — boshqa hech narsa
 * o'zgartirish shart emas (tarjimalar joyida turibdi).
 */
export const MULTILANG = false;

export const LANGS = [
  { code: "uz", label: "O'zbekcha", short: "UZ" },
  { code: "ru", label: "Русский", short: "RU" },
];

const DICT = {
  uz: {
    /* --- Umumiy --- */
    sum: "so'm",
    from: "dan",
    priceFrom: (p) => `${p} dan`,
    guest: "Mehmon",
    loading: "Yuklanmoqda...",
    all: "Hammasi",

    /* --- Onboarding --- */
    onb1Title: "Sizni ochlik qiynayaptimi?",
    onb1Text: "Biz issiqqina pizzalarni tezkor yetkazamiz.",
    onb2Title: "Bu qanday ishlaydi?",
    onb2Text: "Tanlang, buyurtma bering va rohatlaning.",
    onb3Title: "10,000+ odam",
    onb3Text: "allaqachon biz bilan. Siz ham qo'shiling!",
    skip: "O'tkazib yuborish",
    next: "Keyingisi",
    start: "Boshla",

    /* --- Bosh sahifa --- */
    welcome: "Xush kelibsiz 👋",
    closedNotice: (from, to) => `🕒 Hozir yopiqmiz. Ish vaqti: ${from} — ${to}`,
    heroTitle: "Yangi buyurtma berish",
    heroText: (shop) =>
      `${shop} — issiqqina pizzalar 30 daqiqada eshigingizda.`,
    openMenu: "Menyuni ochish",
    freeDeliveryNotice: (amount) =>
      `🛵 ${amount} so'mdan yuqori buyurtmalarga yetkazib berish bepul`,
    popular: "Ommabop pizzalar",
    seeAll: "Barchasi",

    /* --- Katalog --- */
    menuLabel: "Menyu",
    catalog: "Katalog",
    searchPlaceholder: "Pizza qidirish...",
    nothingFound: "Hech narsa topilmadi",
    tryAnother: "Boshqa nom yoki kategoriyani sinab ko'ring",

    /* --- Mahsulot oynasi --- */
    chooseSize: "O'lchamni tanlang",
    toppings: "Qo'shimchalar",
    ingredients: "Tarkibi",
    addToCart: "Savatchaga qo'shish",

    /* --- Savatcha --- */
    yourOrder: "Buyurtmangiz",
    cart: "Savatcha",
    cartEmpty: "Savatcha bo'sh",
    cartEmptyText: "Katalogdan o'zingizga yoqqan pizzani tanlang",
    goToCatalog: "Katalogga o'tish",
    upsell: (name, price) =>
      `Bunga qo'shimcha ravishda ${name} ni atigi ${price} so'mga qo'shasizmi?`,
    promoCode: "Promokod",
    promoPlaceholder: "Kodni kiriting",
    promoApply: "Qo'llash",
    promoRemove: "Olib tashlash",
    promoExpired: "Promokod bu summaga amal qilmaydi",
    deliveryInfo: "Yetkazib berish ma'lumotlari",
    yourName: "Ismingiz",
    namePlaceholder: "Ismingizni kiriting",
    yourPhone: "Telefon raqamingiz",
    connectPhone: "📞 Telegram raqamimni ulash",
    addressLabel: "Manzil / lokatsiya",
    addressPlaceholder: "Ko'cha, uy, xonadon raqami",
    detectLocation: "📍 Joylashuvni aniqlash",
    detecting: "Aniqlanmoqda...",
    productsSum: "Mahsulotlar",
    discount: "Chegirma",
    deliveryFee: "Yetkazib berish",
    free: "Bepul",
    freeHint: (amount) =>
      `Yana ${amount} so'mlik buyurtma qo'shsangiz — yetkazish bepul 🎉`,
    total: "Jami",
    minOrder: (amount) => `Minimal buyurtma summasi ${amount} so'm`,
    confirmOrder: "Buyurtmani tasdiqlash",
    sending: "Yuborilmoqda...",

    /* --- Profil --- */
    myOrders: "📜 Buyurtmalarim",
    favorites: "❤️ Sevimlilar",
    noOrders: "Buyurtmalar yo'q",
    noOrdersText: "Birinchi buyurtmangizni hoziroq bering",
    favEmpty: "Sevimlilar bo'sh",
    favEmptyText: "Yoqqan pizzani ❤️ belgisi bilan saqlab qo'ying",
    orderNo: (id) => `Buyurtma #${id}`,
    orderAgain: "Yana shundan buyurtma qilish",
    orderCancelled: "❌ Buyurtma bekor qilingan",
    language: "🌐 Til",

    /* --- Holatlar --- */
    stepNew: "Qabul qilindi",
    stepCooking: "Tayyorlanmoqda",
    stepRoad: "Yo'lda",
    stepDone: "Yetkazildi",

    /* --- Pastki menyu --- */
    navHome: "Bosh sahifa",
    navCatalog: "Katalog",
    navCart: "Savatcha",
    navProfile: "Profil",

    /* --- Xabarlar --- */
    addedToCart: (name) => `${name} savatchaga qo'shildi`,
    favAdded: "Sevimlilarga qo'shildi ❤️",
    favRemoved: "Sevimlilardan olib tashlandi",
    orderAccepted: "Buyurtmangiz qabul qilindi! 🍕",
    phoneManual: "Raqamni qo'lda kiriting yoki botdagi tugmadan foydalaning",
    phoneSaving: "Rahmat! Raqam saqlanmoqda...",
    phoneLinked: "Raqamingiz ulandi ✅",
    itemsUnavailable: "Bu mahsulotlar hozircha mavjud emas",

    /* --- Stories --- */
    st1Label: "Chegirma",
    st1Title: "Bugun -30%",
    st1Text: "Barcha klassik pizzalarga bugun kechgacha 30% chegirma amal qiladi.",
    st2Label: "Yangi",
    st2Title: "Qazi pizza",
    st2Text: "Milliy ta'mdagi yangi pizzamizni birinchilardan bo'lib tatib ko'ring.",
    st3Label: "Tezkor",
    st3Title: "30 daqiqa",
    st3Text: "Buyurtmangizni 30 daqiqa ichida issiqligicha yetkazib beramiz.",
    st4Label: "Sovg'a",
    st4Title: "Bepul ichimlik",
    st4Text: "100 000 so'mdan yuqori buyurtmaga Coca-Cola bepul.",
    st5Label: "Top",
    st5Title: "Eng ko'p tanlangan",
    st5Text: "Peperoni — mijozlarimiz eng ko'p buyurtma qiladigan pizza.",

    /* --- Standart tarkib --- */
    defBullet1: "Yangi va sifatli mahsulotlar",
    defBullet2: "Buyurtmadan keyin tayyorlanadi",
    defBullet3: "30 daqiqada yetkazib beriladi",
  },

  ru: {
    /* --- Общее --- */
    sum: "сум",
    from: "от",
    priceFrom: (p) => `от ${p}`,
    guest: "Гость",
    loading: "Загрузка...",
    all: "Все",

    /* --- Онбординг --- */
    onb1Title: "Проголодались?",
    onb1Text: "Мы быстро доставим горячую пиццу.",
    onb2Title: "Как это работает?",
    onb2Text: "Выбирайте, заказывайте и наслаждайтесь.",
    onb3Title: "10 000+ человек",
    onb3Text: "уже с нами. Присоединяйтесь!",
    skip: "Пропустить",
    next: "Далее",
    start: "Начать",

    /* --- Главная --- */
    welcome: "Добро пожаловать 👋",
    closedNotice: (from, to) =>
      `🕒 Сейчас закрыто. Часы работы: ${from} — ${to}`,
    heroTitle: "Сделать новый заказ",
    heroText: (shop) => `${shop} — горячая пицца у вашей двери за 30 минут.`,
    openMenu: "Открыть меню",
    freeDeliveryNotice: (amount) =>
      `🛵 При заказе от ${amount} сум доставка бесплатно`,
    popular: "Популярные пиццы",
    seeAll: "Все",

    /* --- Каталог --- */
    menuLabel: "Меню",
    catalog: "Каталог",
    searchPlaceholder: "Поиск пиццы...",
    nothingFound: "Ничего не найдено",
    tryAnother: "Попробуйте другое название или категорию",

    /* --- Карточка товара --- */
    chooseSize: "Выберите размер",
    toppings: "Добавки",
    ingredients: "Состав",
    addToCart: "В корзину",

    /* --- Корзина --- */
    yourOrder: "Ваш заказ",
    cart: "Корзина",
    cartEmpty: "Корзина пуста",
    cartEmptyText: "Выберите понравившуюся пиццу из каталога",
    goToCatalog: "Перейти в каталог",
    upsell: (name, price) =>
      `Добавить к заказу ${name} всего за ${price} сум?`,
    promoCode: "Промокод",
    promoPlaceholder: "Введите код",
    promoApply: "Применить",
    promoRemove: "Убрать",
    promoExpired: "Промокод не действует для этой суммы",
    deliveryInfo: "Данные для доставки",
    yourName: "Ваше имя",
    namePlaceholder: "Введите имя",
    yourPhone: "Номер телефона",
    connectPhone: "📞 Взять номер из Telegram",
    addressLabel: "Адрес / локация",
    addressPlaceholder: "Улица, дом, квартира",
    detectLocation: "📍 Определить местоположение",
    detecting: "Определяем...",
    productsSum: "Товары",
    discount: "Скидка",
    deliveryFee: "Доставка",
    free: "Бесплатно",
    freeHint: (amount) =>
      `Добавьте ещё на ${amount} сум — и доставка будет бесплатной 🎉`,
    total: "Итого",
    minOrder: (amount) => `Минимальная сумма заказа ${amount} сум`,
    confirmOrder: "Подтвердить заказ",
    sending: "Отправляем...",

    /* --- Профиль --- */
    myOrders: "📜 Мои заказы",
    favorites: "❤️ Избранное",
    noOrders: "Заказов нет",
    noOrdersText: "Сделайте свой первый заказ прямо сейчас",
    favEmpty: "В избранном пусто",
    favEmptyText: "Сохраняйте любимые пиццы значком ❤️",
    orderNo: (id) => `Заказ #${id}`,
    orderAgain: "Повторить заказ",
    orderCancelled: "❌ Заказ отменён",
    language: "🌐 Язык",

    /* --- Статусы --- */
    stepNew: "Принят",
    stepCooking: "Готовится",
    stepRoad: "В пути",
    stepDone: "Доставлен",

    /* --- Нижнее меню --- */
    navHome: "Главная",
    navCatalog: "Каталог",
    navCart: "Корзина",
    navProfile: "Профиль",

    /* --- Уведомления --- */
    addedToCart: (name) => `${name} добавлен в корзину`,
    favAdded: "Добавлено в избранное ❤️",
    favRemoved: "Удалено из избранного",
    orderAccepted: "Ваш заказ принят! 🍕",
    phoneManual: "Введите номер вручную или используйте кнопку в боте",
    phoneSaving: "Спасибо! Сохраняем номер...",
    phoneLinked: "Номер подключён ✅",
    itemsUnavailable: "Этих товаров сейчас нет в наличии",

    /* --- Истории --- */
    st1Label: "Скидка",
    st1Title: "Сегодня -30%",
    st1Text: "На все классические пиццы сегодня до вечера скидка 30%.",
    st2Label: "Новинка",
    st2Title: "Пицца Кази",
    st2Text: "Попробуйте первыми нашу новую пиццу с национальным вкусом.",
    st3Label: "Быстро",
    st3Title: "30 минут",
    st3Text: "Доставим ваш заказ горячим в течение 30 минут.",
    st4Label: "Подарок",
    st4Title: "Напиток в подарок",
    st4Text: "При заказе от 100 000 сум — Coca-Cola бесплатно.",
    st5Label: "Топ",
    st5Title: "Выбор гостей",
    st5Text: "Пепперони — самая заказываемая пицца у наших гостей.",

    /* --- Состав по умолчанию --- */
    defBullet1: "Свежие и качественные продукты",
    defBullet2: "Готовим после заказа",
    defBullet3: "Доставка за 30 минут",
  },
};

/* ---------- Kategoriya nomlari ---------- */
const CATEGORIES = {
  ru: {
    Hammasi: "Все",
    Pizza: "Пицца",
    Ichimliklar: "Напитки",
    Salatlar: "Салаты",
    Desertlar: "Десерты",
  },
};

export function translateCategory(name, lang) {
  return CATEGORIES[lang]?.[name] || name;
}

/* ---------- Mahsulot tarkibi ---------- */
export const INGREDIENTS = {
  uz: {
    Margarita: [
      "Yupqa italyan xamiri",
      "Maxsus tomat sousi",
      "Mozzarella pishlog'i",
      "Yangi rayhon barglari",
      "Zaytun moyi",
    ],
    Peperoni: [
      "Yupqa italyan xamiri",
      "Achchiqroq peperoni kolbasasi",
      "Qo'sh mozzarella pishlog'i",
      "Tomat sousi va ziravorlar",
    ],
    "Qazi pizza": [
      "Tabiiy ot qazisi",
      "Qizil piyoz",
      "Bulg'or qalampiri",
      "Mozzarella pishlog'i",
      "Tomat sousi",
    ],
    Pishloqli: [
      "Mozzarella pishlog'i",
      "Chedder pishlog'i",
      "Parmezan pishlog'i",
      "Suzma pishloq",
      "Qaymoqli sous",
    ],
  },
  ru: {
    Margarita: [
      "Тонкое итальянское тесто",
      "Фирменный томатный соус",
      "Сыр моцарелла",
      "Свежий базилик",
      "Оливковое масло",
    ],
    Peperoni: [
      "Тонкое итальянское тесто",
      "Острая колбаса пепперони",
      "Двойная моцарелла",
      "Томатный соус и специи",
    ],
    "Qazi pizza": [
      "Натуральная конская казы",
      "Красный лук",
      "Болгарский перец",
      "Сыр моцарелла",
      "Томатный соус",
    ],
    Pishloqli: [
      "Сыр моцарелла",
      "Сыр чеддер",
      "Сыр пармезан",
      "Творожный сыр",
      "Сливочный соус",
    ],
  },
};

/* ---------- Kontekst ---------- */
export const LangContext = createContext({ lang: "uz", t: (k) => k });

export function useLang() {
  return useContext(LangContext);
}

/** Tanlangan til uchun matn oluvchi funksiya */
export function createT(lang) {
  const pack = DICT[lang] || DICT.uz;

  return (key, ...args) => {
    const value = pack[key] ?? DICT.uz[key] ?? key;
    return typeof value === "function" ? value(...args) : value;
  };
}

export function detectLang() {
  if (!MULTILANG) return "uz";

  try {
    const saved = localStorage.getItem("pizza_lang");
    if (saved === "uz" || saved === "ru") return saved;
  } catch {
    /* jim */
  }

  const code =
    window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code ||
    navigator.language ||
    "";

  return String(code).toLowerCase().startsWith("ru") ? "ru" : "uz";
}

export function saveLang(lang) {
  if (!MULTILANG) return;

  try {
    localStorage.setItem("pizza_lang", lang);
  } catch {
    /* jim */
  }
}

/** Mahsulot yoki qo'shimchaning tanlangan tildagi nomi/ta'rifi */
export function localized(item, lang, field = "name") {
  if (!item) return "";

  if (lang === "ru") {
    const ruField = field + "Ru";
    if (item[ruField]) return item[ruField];
  }

  return item[field] || "";
}

// Telegram WebApp bilan ishlash uchun kichik yordamchi.

export const tg = window.Telegram?.WebApp;

const INIT_DATA_KEY = "pizza_tg_init_data";
const GUEST_KEY = "pizza_guest_id";

/**
 * Telegram bergan initData'ni qaytaradi.
 *
 * Muhim: sahifa qayta yuklanganda manzildagi #tgWebAppData yo'qolishi mumkin
 * (masalan dastur yangilanganda). Shu sababli birinchi ochilishda uni
 * localStorage'ga saqlab qo'yamiz va keyin ham o'sha mijoz sifatida qolamiz.
 */
export function getInitData() {
  const fresh = tg?.initData || "";

  if (fresh) {
    try {
      localStorage.setItem(INIT_DATA_KEY, fresh);
    } catch {
      /* jim */
    }
    return fresh;
  }

  // Manzil hash'idan o'qib ko'ramiz
  const fromHash = new URLSearchParams(
    window.location.hash.replace(/^#/, "")
  ).get("tgWebAppData");

  if (fromHash) {
    try {
      localStorage.setItem(INIT_DATA_KEY, fromHash);
    } catch {
      /* jim */
    }
    return fromHash;
  }

  try {
    return localStorage.getItem(INIT_DATA_KEY) || "";
  } catch {
    return "";
  }
}

/** Brauzerda test qilish uchun qurilmaga xos yagona ID */
export function getGuestId() {
  try {
    let id = localStorage.getItem(GUEST_KEY);

    if (!id) {
      const rnd =
        Math.random().toString(36).slice(2) +
        Math.random().toString(36).slice(2);
      id = `guest-${rnd.slice(0, 16)}`;
      localStorage.setItem(GUEST_KEY, id);
    }

    return id;
  } catch {
    return "guest-nostorage000";
  }
}

export function initTelegram() {
  if (!tg) return;

  // Har bir chaqiruv alohida himoyalangan: eski Telegram versiyalarida
  // qo'llab-quvvatlanmagan metod xato bersa ham ilova ishlashda davom etadi
  safe(() => tg.ready());
  safe(() => tg.expand());
  safe(() => tg.setHeaderColor("#ffffff"));
  safe(() => tg.setBackgroundColor("#ffffff"));

  // Pastga tortganda ilova yopilib ketmasligi uchun (scroll to'g'ri ishlaydi)
  safe(() => tg.disableVerticalSwipes?.());

  // initData'ni darhol saqlab qo'yamiz
  getInitData();

  // Telegram oynasining balandligini CSS'ga uzatamiz
  const applyHeight = () => {
    const h = tg.viewportStableHeight || tg.viewportHeight;
    if (h) {
      document.documentElement.style.setProperty("--tg-height", `${h}px`);
    }
  };

  applyHeight();
  safe(() => tg.onEvent("viewportChanged", applyHeight));
}

/** Faqat ekranda ko'rsatish uchun ism (haqiqiy shaxs serverda aniqlanadi) */
export function getDisplayName() {
  const u = tg?.initDataUnsafe?.user;

  if (u?.id) {
    return [u.first_name, u.last_name].filter(Boolean).join(" ") || "Mehmon";
  }

  return "Mehmon";
}

function safe(fn) {
  try {
    fn();
  } catch {
    /* qo'llab-quvvatlanmaydi */
  }
}

export function haptic(type = "light") {
  try {
    tg?.HapticFeedback?.impactOccurred(type);
  } catch {
    /* qo'llab-quvvatlanmaydi */
  }
}

/**
 * Telegram'dan telefon raqamini so'raydi.
 * Mijoz rozi bo'lsa, raqam bot orqali bazaga yoziladi.
 */
export function requestPhone() {
  return new Promise((resolve) => {
    if (!tg?.requestContact) return resolve(false);

    try {
      tg.requestContact((ok) => resolve(Boolean(ok)));
    } catch {
      resolve(false);
    }
  });
}

export function closeApp() {
  if (tg?.close) {
    tg.close();
  } else {
    alert("Buyurtmangiz qabul qilindi! (Telegram ichida ilova yopiladi)");
  }
}

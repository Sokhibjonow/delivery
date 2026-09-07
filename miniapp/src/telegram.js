// Telegram WebApp bilan ishlash uchun kichik yordamchi.
// Brauzerda (Telegram'siz) test qilish uchun "demo" foydalanuvchi qaytaradi.

export const tg = window.Telegram?.WebApp;

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

function safe(fn) {
  try {
    fn();
  } catch {
    /* qo'llab-quvvatlanmaydi */
  }
}

export function getTelegramUser() {
  const u = tg?.initDataUnsafe?.user;

  if (u?.id) {
    return {
      telegramId: String(u.id),
      name: [u.first_name, u.last_name].filter(Boolean).join(" ") || "Mehmon",
    };
  }

  // Brauzerda test qilish rejimi
  return { telegramId: "demo-web-user", name: "Mehmon" };
}

export function haptic(type = "light") {
  try {
    tg?.HapticFeedback?.impactOccurred(type);
  } catch {
    /* qo'llab-quvvatlanmaydi */
  }
}

export function closeApp() {
  if (tg?.close) {
    tg.close();
  } else {
    alert("Buyurtmangiz qabul qilindi! (Telegram ichida ilova yopiladi)");
  }
}

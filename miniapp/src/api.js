import { getInitData, getGuestId, debugInfo } from "./telegram.js";

// Vite dev-server /api so'rovlarini backendga (localhost:4000) uzatadi.
const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Mijozni serverda ishonchli aniqlash uchun
      "x-init-data": getInitData(),
      "x-guest-id": getGuestId(),
      "x-tg-debug": debugInfo(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Server bilan bog'lanishda xatolik");
  }

  return res.json();
}

export const api = {
  getSettings: () => request("/settings"),

  getProducts: () => request("/products"),

  getCategories: () => request("/products/categories"),

  getToppings: () => request("/toppings"),

  auth: (lang) =>
    request("/users/auth", { method: "POST", body: JSON.stringify({ lang }) }),

  setLang: (lang) =>
    request("/users/lang", { method: "POST", body: JSON.stringify({ lang }) }),

  getMyOrders: () => request("/orders/my"),

  createOrder: (payload) =>
    request("/orders", { method: "POST", body: JSON.stringify(payload) }),

  getFavorites: () => request("/favorites"),

  toggleFavorite: (productId) =>
    request("/favorites/toggle", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),

  checkPromo: (code, subtotal) =>
    request("/promo/check", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    }),
};

export function formatPrice(n) {
  return new Intl.NumberFormat("ru-RU").format(Number(n) || 0);
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Savatchadagi har bir variant uchun yagona kalit */
export function cartKey(productId, size, toppingIds) {
  const tops = [...(toppingIds || [])].sort((a, b) => a - b).join(".");
  return `${productId}|${size || ""}|${tops}`;
}

export const ORDER_STEPS = [
  { key: "yangi", tKey: "stepNew", icon: "📝" },
  { key: "tayyorlanmoqda", tKey: "stepCooking", icon: "👨‍🍳" },
  { key: "yolda", tKey: "stepRoad", icon: "🛵" },
  { key: "yetkazildi", tKey: "stepDone", icon: "✅" },
];

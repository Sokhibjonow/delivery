// Vite dev-server /api so'rovlarini backendga (localhost:4000) uzatadi.
const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Server bilan bog'lanishda xatolik");
  }

  return res.json();
}

export const api = {
  getConfig: () => request("/config"),

  getProducts: () => request("/products"),

  getCategories: () => request("/products/categories"),

  auth: (user) =>
    request("/users/auth", { method: "POST", body: JSON.stringify(user) }),

  getMyOrders: (telegramId) => request(`/orders/my/${telegramId}`),

  createOrder: (payload) =>
    request("/orders", { method: "POST", body: JSON.stringify(payload) }),
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

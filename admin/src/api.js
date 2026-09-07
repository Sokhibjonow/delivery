// Vite dev-server /api so'rovlarini backendga (localhost:4000) uzatadi.
const BASE = "/api";
const KEY_STORAGE = "pizza_admin_key";

export function getKey() {
  return localStorage.getItem(KEY_STORAGE) || "";
}

export function setKey(key) {
  localStorage.setItem(KEY_STORAGE, key);
}

export function clearKey() {
  localStorage.removeItem(KEY_STORAGE);
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": getKey(),
    },
    ...options,
  });

  if (res.status === 401) {
    clearKey();
    window.location.reload();
    throw new Error("Sessiya tugadi");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Server bilan bog'lanishda xatolik");
  }

  return res.json();
}

export const api = {
  login: async (password) => {
    const res = await fetch(BASE + "/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) throw new Error("Parol noto'g'ri");

    const data = await res.json();
    setKey(data.key);
    return data;
  },

  /* --- Buyurtmalar --- */
  getOrders: () => request("/orders"),

  setOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteOrder: (id) => request(`/orders/${id}`, { method: "DELETE" }),

  /* --- Mahsulotlar --- */
  getProducts: () => request("/products"),

  createProduct: (data) =>
    request("/products", { method: "POST", body: JSON.stringify(data) }),

  updateProduct: (id, data) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  /* --- Qo'shimchalar --- */
  getToppings: () => request("/toppings/all"),

  createTopping: (data) =>
    request("/toppings", { method: "POST", body: JSON.stringify(data) }),

  updateTopping: (id, data) =>
    request(`/toppings/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteTopping: (id) => request(`/toppings/${id}`, { method: "DELETE" }),

  /* --- Promokodlar --- */
  getPromos: () => request("/promo"),

  createPromo: (data) =>
    request("/promo", { method: "POST", body: JSON.stringify(data) }),

  updatePromo: (id, data) =>
    request(`/promo/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deletePromo: (id) => request(`/promo/${id}`, { method: "DELETE" }),

  /* --- Mijozlar --- */
  getCustomers: () => request("/admin/customers"),

  /* --- Sozlamalar --- */
  getSettings: () => request("/settings"),

  saveSettings: (data) =>
    request("/settings", { method: "PUT", body: JSON.stringify(data) }),

  /* --- Reklama --- */
  broadcast: (text) =>
    request("/admin/broadcast", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  /* --- Excel eksport --- */
  exportOrders: async () => {
    const res = await fetch(`${BASE}/admin/export/orders`, {
      headers: { "x-admin-key": getKey() },
    });

    if (!res.ok) throw new Error("Yuklab bo'lmadi");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `buyurtmalar-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  },
};

export const STATUSES = [
  { key: "yangi", label: "Yangi", cls: "badge--new" },
  { key: "tayyorlanmoqda", label: "Tayyorlanmoqda", cls: "badge--cook" },
  { key: "yolda", label: "Yo'lda", cls: "badge--road" },
  { key: "yetkazildi", label: "Yetkazildi", cls: "badge--done" },
  { key: "bekor", label: "Bekor qilindi", cls: "badge--cancel" },
];

export function statusInfo(key) {
  return STATUSES.find((s) => s.key === key) || STATUSES[0];
}

export function formatPrice(n) {
  return new Intl.NumberFormat("ru-RU").format(Number(n) || 0);
}

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

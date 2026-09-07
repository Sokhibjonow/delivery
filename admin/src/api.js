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
  getOrders: () => request("/orders"),

  setOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteOrder: (id) => request(`/orders/${id}`, { method: "DELETE" }),

  getProducts: () => request("/products"),

  createProduct: (data) =>
    request("/products", { method: "POST", body: JSON.stringify(data) }),

  updateProduct: (id, data) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
};

export function formatPrice(n) {
  return new Intl.NumberFormat("ru-RU").format(Number(n) || 0);
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import {
  initTelegram,
  getTelegramUser,
  haptic,
  closeApp,
} from "./telegram.js";

import Onboarding from "./pages/Onboarding.jsx";
import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import Cart from "./pages/Cart.jsx";
import Profile from "./pages/Profile.jsx";

import BottomNav from "./components/BottomNav.jsx";
import ProductSheet from "./components/ProductSheet.jsx";

const ONBOARDING_KEY = "pizza_onboarding_done";
const CART_KEY = "pizza_cart";

export default function App() {
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === "1"
  );

  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState("Pizza");
  const [user, setUser] = useState({ telegramId: "", name: "Mehmon" });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Hammasi"]);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [tab, setTab] = useState("home");
  const [sheetProduct, setSheetProduct] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  /* ---------- Dastlabki yuklash ---------- */
  useEffect(() => {
    initTelegram();

    const tgUser = getTelegramUser();

    (async () => {
      try {
        const [config, list, cats, dbUser] = await Promise.all([
          api.getConfig().catch(() => ({ shopName: "Pizza" })),
          api.getProducts(),
          api.getCategories(),
          api.auth(tgUser).catch(() => null),
        ]);

        setShopName(config.shopName);
        setProducts(list);
        setCategories(cats);
        setUser({
          telegramId: tgUser.telegramId,
          name: dbUser?.name || tgUser.name,
          phone: dbUser?.phone || "",
        });
      } catch (e) {
        showToast(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- Savatchani saqlash ---------- */
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  /* ---------- Buyurtmalar tarixi ---------- */
  const loadOrders = useCallback(async () => {
    if (!user.telegramId) return;
    setOrdersLoading(true);
    try {
      setOrders(await api.getMyOrders(user.telegramId));
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [user.telegramId]);

  useEffect(() => {
    if (tab === "profile") loadOrders();
  }, [tab, loadOrders]);

  /* ---------- Yordamchilar ---------- */
  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  }

  function addToCart(product, qty = 1) {
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.newPrice,
          imageUrl: product.imageUrl,
          qty,
        },
      ];
    });

    showToast(`${product.name} savatchaga qo'shildi`);
  }

  function changeQty(id, qty) {
    if (qty <= 0) return removeFromCart(id);
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function reorder(order) {
    const items = order.items
      .map((i) => {
        const product = products.find((p) => p.id === i.id);
        if (!product) return null;
        return {
          id: product.id,
          name: product.name,
          price: product.newPrice,
          imageUrl: product.imageUrl,
          qty: i.qty,
        };
      })
      .filter(Boolean);

    if (items.length === 0) {
      showToast("Bu mahsulotlar hozircha mavjud emas");
      return;
    }

    setCart(items);
    setTab("cart");
  }

  async function submitOrder({ name, phone, location }) {
    setSubmitting(true);

    try {
      await api.createOrder({
        telegramId: user.telegramId,
        name,
        phone,
        location,
        items: cart.map((i) => ({ id: i.id, qty: i.qty })),
      });

      setCart([]);
      setUser((u) => ({ ...u, name, phone }));
      haptic("heavy");
      showToast("Buyurtmangiz qabul qilindi! 🍕");

      setTimeout(closeApp, 1500);
    } catch (e) {
      showToast(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- Render ---------- */
  if (!onboarded) {
    return (
      <Onboarding
        onFinish={() => {
          localStorage.setItem(ONBOARDING_KEY, "1");
          setOnboarded(true);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
      </div>
    );
  }

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  return (
    <div className="app">
      {tab === "home" && (
        <Home
          user={user}
          products={products}
          shopName={shopName}
          onOpen={setSheetProduct}
          onAdd={addToCart}
          goTo={setTab}
        />
      )}

      {tab === "catalog" && (
        <Catalog
          products={products}
          categories={categories}
          onOpen={setSheetProduct}
          onAdd={addToCart}
        />
      )}

      {tab === "cart" && (
        <Cart
          cart={cart}
          products={products}
          user={user}
          onChangeQty={changeQty}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onSubmit={submitOrder}
          submitting={submitting}
          goTo={setTab}
        />
      )}

      {tab === "profile" && (
        <Profile
          user={user}
          orders={orders}
          loading={ordersLoading}
          onReorder={reorder}
          goTo={setTab}
        />
      )}

      <ProductSheet
        product={sheetProduct}
        onClose={() => setSheetProduct(null)}
        onAdd={addToCart}
      />

      <BottomNav tab={tab} onChange={setTab} cartCount={cartCount} />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

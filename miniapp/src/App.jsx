import { useCallback, useEffect, useState } from "react";
import { api, cartKey } from "./api.js";
import {
  initTelegram,
  getDisplayName,
  haptic,
  closeApp,
  requestPhone,
} from "./telegram.js";

import Onboarding from "./pages/Onboarding.jsx";
import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import Cart from "./pages/Cart.jsx";
import Profile from "./pages/Profile.jsx";

import BottomNav from "./components/BottomNav.jsx";
import ProductSheet from "./components/ProductSheet.jsx";

const ONBOARDING_KEY = "pizza_onboarding_done";
const CART_KEY = "pizza_cart_v2";

const DEFAULT_SETTINGS = {
  isOpenNow: true,
  workFrom: "09:00",
  workTo: "23:00",
  deliveryFee: 0,
  freeDeliveryFrom: 0,
  minOrderTotal: 0,
  shopName: "Pizza",
};

export default function App() {
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === "1"
  );

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [user, setUser] = useState({ telegramId: "", name: "Mehmon" });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Hammasi"]);
  const [toppings, setToppings] = useState([]);

  const [favorites, setFavorites] = useState([]); // product obyektlari

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

  const favoriteIds = favorites.map((f) => f.id);

  /* ---------- Dastlabki yuklash ---------- */
  useEffect(() => {
    initTelegram();

    (async () => {
      try {
        const [cfg, list, cats, tops, dbUser] = await Promise.all([
          api.getSettings().catch(() => DEFAULT_SETTINGS),
          api.getProducts(),
          api.getCategories(),
          api.getToppings().catch(() => []),
          api.auth().catch(() => null),
        ]);

        setSettings({ ...DEFAULT_SETTINGS, ...cfg });
        setProducts(list);
        setCategories(cats);
        setToppings(tops);

        setUser({
          telegramId: dbUser?.telegramId || "",
          name: dbUser?.name || getDisplayName(),
          phone: dbUser?.phone || "",
          verified: Boolean(dbUser?.verified),
        });

        const favs = await api.getFavorites().catch(() => []);
        setFavorites(favs);
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
      setOrders(await api.getMyOrders());
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
    setTimeout(() => setToast(""), 2400);
  }

  function addToCart(product, opts = {}) {
    const { qty = 1, size = null, toppings: tops = [], unitPrice } = opts;

    const price = unitPrice ?? product.newPrice;
    const key = cartKey(product.id, size, tops.map((t) => t.id));

    setCart((prev) => {
      const found = prev.find((i) => i.key === key);

      if (found) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: i.qty + qty } : i
        );
      }

      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price,
          size,
          toppings: tops,
          qty,
        },
      ];
    });

    showToast(`${product.name} savatchaga qo'shildi`);
  }

  function changeQty(key, qty) {
    if (qty <= 0) return removeFromCart(key);
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
  }

  function removeFromCart(key) {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }

  async function toggleFavorite(product) {
    if (!user.telegramId) return;

    const isFav = favoriteIds.includes(product.id);

    // Darhol ko'rsatamiz, keyin serverga yozamiz
    setFavorites((prev) =>
      isFav ? prev.filter((p) => p.id !== product.id) : [product, ...prev]
    );

    try {
      await api.toggleFavorite(product.id);
      showToast(
        isFav ? "Sevimlilardan olib tashlandi" : "Sevimlilarga qo'shildi ❤️"
      );
    } catch {
      // xato bo'lsa orqaga qaytaramiz
      setFavorites((prev) =>
        isFav ? [product, ...prev] : prev.filter((p) => p.id !== product.id)
      );
    }
  }

  function reorder(order) {
    const items = order.items
      .map((i) => {
        const product = products.find((p) => p.id === i.id);
        if (!product) return null;

        const tops = i.toppings || [];

        return {
          key: cartKey(product.id, i.size, tops.map((t) => t.id)),
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: i.price,
          size: i.size || null,
          toppings: tops,
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

  async function handleRequestPhone() {
    const ok = await requestPhone();

    if (!ok) {
      showToast("Raqamni qo'lda kiriting yoki botdagi tugmadan foydalaning");
      return;
    }

    showToast("Rahmat! Raqam saqlanmoqda...");

    // Bot raqamni bazaga yozguncha biroz kutamiz
    setTimeout(async () => {
      try {
        const fresh = await api.auth();
        if (fresh?.phone) {
          setUser((u) => ({ ...u, phone: fresh.phone }));
          showToast("Raqamingiz ulandi ✅");
        }
      } catch {
        /* jim */
      }
    }, 1800);
  }

  async function submitOrder({ name, phone, location, promoCode }) {
    setSubmitting(true);

    try {
      await api.createOrder({
        name,
        phone,
        location,
        promoCode,
        items: cart.map((i) => ({
          id: i.id,
          qty: i.qty,
          size: i.size,
          toppingIds: (i.toppings || []).map((t) => t.id),
        })),
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
          settings={settings}
          onOpen={setSheetProduct}
          onAdd={addToCart}
          goTo={setTab}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {tab === "catalog" && (
        <Catalog
          products={products}
          categories={categories}
          onOpen={setSheetProduct}
          onAdd={addToCart}
          favorites={favoriteIds}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {tab === "cart" && (
        <Cart
          cart={cart}
          products={products}
          user={user}
          settings={settings}
          onChangeQty={changeQty}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onSubmit={submitOrder}
          submitting={submitting}
          goTo={setTab}
          onRequestPhone={handleRequestPhone}
        />
      )}

      {tab === "profile" && (
        <Profile
          user={user}
          orders={orders}
          loading={ordersLoading}
          onReorder={reorder}
          goTo={setTab}
          favorites={favorites}
          favoriteIds={favoriteIds}
          onOpen={setSheetProduct}
          onAdd={addToCart}
          onToggleFavorite={toggleFavorite}
        />
      )}

      <ProductSheet
        product={sheetProduct}
        toppings={
          sheetProduct
            ? toppings.filter((t) => t.category === sheetProduct.category)
            : []
        }
        onClose={() => setSheetProduct(null)}
        onAdd={addToCart}
        isFavorite={sheetProduct ? favoriteIds.includes(sheetProduct.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      <BottomNav tab={tab} onChange={setTab} cartCount={cartCount} />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

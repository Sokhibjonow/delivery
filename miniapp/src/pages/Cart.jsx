import { useEffect, useMemo, useState } from "react";
import { api, formatPrice } from "../api.js";
import { haptic } from "../telegram.js";

export default function Cart({
  cart,
  products,
  user,
  settings,
  onChangeQty,
  onAdd,
  onRemove,
  onSubmit,
  submitting,
  goTo,
  onRequestPhone,
}) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [location, setLocation] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState(null); // { code, discount, label }
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  // Bot orqali raqam kelgan bo'lsa maydonni to'ldiramiz
  useEffect(() => {
    if (user.phone && !phone) setPhone(user.phone);
  }, [user.phone]);

  // Qo'shimcha taklif uchun ichimlik
  const drink = useMemo(
    () => products.find((p) => p.category === "Ichimliklar"),
    [products]
  );

  const drinkInCart = drink ? cart.some((i) => i.id === drink.id) : false;

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = promo?.discount || 0;
  const afterDiscount = subtotal - discount;

  const deliveryFee =
    cart.length === 0
      ? 0
      : afterDiscount >= settings.freeDeliveryFrom
      ? 0
      : settings.deliveryFee;

  const total = afterDiscount + deliveryFee;

  // Savatcha o'zgarsa promokod qayta hisoblanadi
  useEffect(() => {
    if (!promo?.code || subtotal === 0) return;

    let cancelled = false;

    api
      .checkPromo(promo.code, subtotal)
      .then((r) => {
        if (!cancelled) setPromo({ code: r.code, discount: r.discount, label: r.label });
      })
      .catch(() => {
        if (!cancelled) {
          setPromo(null);
          setPromoError("Promokod bu summaga amal qilmaydi");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [subtotal]);

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;

    haptic();
    setPromoLoading(true);
    setPromoError("");

    try {
      const r = await api.checkPromo(code, subtotal);
      setPromo({ code: r.code, discount: r.discount, label: r.label });
      setPromoInput("");
    } catch (e) {
      setPromo(null);
      setPromoError(e.message);
    } finally {
      setPromoLoading(false);
    }
  };

  const toggleDrink = () => {
    haptic();
    if (!drink) return;
    if (drinkInCart) {
      const item = cart.find((i) => i.id === drink.id);
      onRemove(item.key);
    } else {
      onAdd(drink, { qty: 1 });
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(
          `Geolokatsiya: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
        );
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  };

  const belowMin = subtotal > 0 && subtotal < settings.minOrderTotal;

  const valid =
    cart.length > 0 &&
    !belowMin &&
    settings.isOpenNow &&
    name.trim() &&
    phone.trim() &&
    location.trim();

  if (cart.length === 0) {
    return (
      <div className="page">
        <header className="header">
          <div>
            <div className="header__hi">Buyurtmangiz</div>
            <div className="header__name">Savatcha</div>
          </div>
        </header>

        <div className="empty">
          <div className="empty__emoji">🛒</div>
          <div className="empty__title">Savatcha bo'sh</div>
          <div style={{ marginBottom: 20 }}>
            Katalogdan o'zingizga yoqqan pizzani tanlang
          </div>
          <button
            className="btn"
            style={{ maxWidth: 240, margin: "0 auto" }}
            onClick={() => goTo("catalog")}
          >
            Katalogga o'tish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="header__hi">Buyurtmangiz</div>
          <div className="header__name">Savatcha</div>
        </div>
      </header>

      {!settings.isOpenNow && (
        <div className="notice notice--warn">
          🕒 Hozir yopiqmiz. Ish vaqti: {settings.workFrom} — {settings.workTo}
        </div>
      )}

      {cart.map((item) => (
        <div className="cart-row" key={item.key}>
          <img className="cart-row__img" src={item.imageUrl} alt={item.name} />

          <div className="cart-row__main">
            <div className="cart-row__name">
              {item.name}
              {item.size ? <span className="cart-row__size"> · {item.size}</span> : null}
            </div>

            {item.toppings?.length > 0 && (
              <div className="cart-row__tops">
                + {item.toppings.map((t) => t.name).join(", ")}
              </div>
            )}

            <div className="cart-row__price">{formatPrice(item.price)} so'm</div>
          </div>

          <div className="stepper">
            <button
              onClick={() => {
                haptic();
                onChangeQty(item.key, item.qty - 1);
              }}
            >
              −
            </button>
            <span>{item.qty}</span>
            <button
              onClick={() => {
                haptic();
                onChangeQty(item.key, item.qty + 1);
              }}
            >
              +
            </button>
          </div>
        </div>
      ))}

      {drink && (
        <div className="upsell">
          <img className="upsell__img" src={drink.imageUrl} alt={drink.name} />
          <div className="upsell__text">
            Bunga qo'shimcha ravishda <b>{drink.name}</b> ni atigi{" "}
            <b>{formatPrice(drink.newPrice)} so'mga</b> qo'shasizmi?
          </div>
          <button
            className={"switch" + (drinkInCart ? " switch--on" : "")}
            onClick={toggleDrink}
            aria-label="Ichimlik qo'shish"
          />
        </div>
      )}

      {/* ---------- Promokod ---------- */}
      <div className="section__title" style={{ margin: "22px 0 12px" }}>
        Promokod
      </div>

      {promo ? (
        <div className="promo-applied">
          <div>
            <b>{promo.code}</b> — {promo.label}
          </div>
          <button
            onClick={() => {
              haptic();
              setPromo(null);
              setPromoError("");
            }}
          >
            Olib tashlash
          </button>
        </div>
      ) : (
        <>
          <div className="promo-row">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Kodni kiriting"
            />
            <button
              className="btn btn--ghost"
              onClick={applyPromo}
              disabled={promoLoading || !promoInput.trim()}
            >
              {promoLoading ? "..." : "Qo'llash"}
            </button>
          </div>
          {promoError && <div className="promo-error">{promoError}</div>}
        </>
      )}

      {/* ---------- Ma'lumotlar ---------- */}
      <div className="section__title" style={{ margin: "22px 0 12px" }}>
        Yetkazib berish ma'lumotlari
      </div>

      <div className="field">
        <label>Ismingiz</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ismingizni kiriting"
        />
      </div>

      <div className="field">
        <label>Telefon raqamingiz</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
          inputMode="tel"
        />
        <button
          className="btn btn--ghost"
          style={{ marginTop: 8, padding: 12, fontSize: 14 }}
          onClick={() => {
            haptic();
            onRequestPhone();
          }}
        >
          📞 Telegram raqamimni ulash
        </button>
      </div>

      <div className="field">
        <label>Manzil / lokatsiya</label>
        <textarea
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ko'cha, uy, xonadon raqami"
        />
        <button
          className="btn btn--ghost"
          style={{ marginTop: 8, padding: 12, fontSize: 14 }}
          onClick={detectLocation}
          disabled={geoLoading}
        >
          {geoLoading ? "Aniqlanmoqda..." : "📍 Joylashuvni aniqlash"}
        </button>
      </div>

      {/* ---------- Hisob ---------- */}
      <div className="summary">
        <div className="summary__row">
          <span>Mahsulotlar</span>
          <span>{formatPrice(subtotal)} so'm</span>
        </div>

        {discount > 0 && (
          <div className="summary__row summary__row--green">
            <span>Chegirma ({promo.code})</span>
            <span>−{formatPrice(discount)} so'm</span>
          </div>
        )}

        <div className="summary__row">
          <span>Yetkazib berish</span>
          <span>
            {deliveryFee === 0 ? "Bepul" : `${formatPrice(deliveryFee)} so'm`}
          </span>
        </div>

        {deliveryFee > 0 && (
          <div className="summary__hint">
            Yana {formatPrice(settings.freeDeliveryFrom - afterDiscount)} so'mlik
            buyurtma qo'shsangiz — yetkazish bepul 🎉
          </div>
        )}
      </div>

      <div className="total">
        <span>Jami</span>
        <span>{formatPrice(total)} so'm</span>
      </div>

      {belowMin && (
        <div className="notice notice--warn">
          Minimal buyurtma summasi {formatPrice(settings.minOrderTotal)} so'm
        </div>
      )}

      <button
        className="btn"
        disabled={!valid || submitting}
        onClick={() =>
          onSubmit({ name, phone, location, promoCode: promo?.code || null })
        }
      >
        {submitting ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}
      </button>

      <div style={{ height: 20 }} />
    </div>
  );
}

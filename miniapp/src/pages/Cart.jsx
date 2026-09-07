import { useMemo, useState } from "react";
import { formatPrice } from "../api.js";
import { haptic } from "../telegram.js";

export default function Cart({
  cart,
  products,
  user,
  onChangeQty,
  onAdd,
  onRemove,
  onSubmit,
  submitting,
  goTo,
}) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [location, setLocation] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  // Qo'shimcha taklif uchun ichimlik
  const drink = useMemo(
    () => products.find((p) => p.category === "Ichimliklar"),
    [products]
  );

  const drinkInCart = drink ? cart.some((i) => i.id === drink.id) : false;

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const toggleDrink = () => {
    haptic();
    if (!drink) return;
    if (drinkInCart) onRemove(drink.id);
    else onAdd(drink, 1);
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

  const valid = cart.length > 0 && name.trim() && phone.trim() && location.trim();

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

      {cart.map((item) => (
        <div className="cart-row" key={item.id}>
          <img className="cart-row__img" src={item.imageUrl} alt={item.name} />

          <div className="cart-row__main">
            <div className="cart-row__name">{item.name}</div>
            <div className="cart-row__price">
              {formatPrice(item.price)} so'm
            </div>
          </div>

          <div className="stepper">
            <button
              onClick={() => {
                haptic();
                onChangeQty(item.id, item.qty - 1);
              }}
            >
              −
            </button>
            <span>{item.qty}</span>
            <button
              onClick={() => {
                haptic();
                onChangeQty(item.id, item.qty + 1);
              }}
            >
              +
            </button>
          </div>
        </div>
      ))}

      {drink && (
        <div className="upsell">
          <img
            className="upsell__img"
            src={drink.imageUrl}
            alt={drink.name}
          />
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

      <div className="total">
        <span>Jami</span>
        <span>{formatPrice(total)} so'm</span>
      </div>

      <button
        className="btn"
        disabled={!valid || submitting}
        onClick={() => onSubmit({ name, phone, location })}
      >
        {submitting ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}
      </button>

      <div style={{ height: 20 }} />
    </div>
  );
}

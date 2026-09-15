import { useEffect, useMemo, useState } from "react";
import { api, formatPrice } from "../api.js";
import { haptic } from "../telegram.js";
import { useLang, localized } from "../i18n.js";

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
  const { lang, t } = useLang();

  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [location, setLocation] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState(null); // { code, discount, label }
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  // Telegram'dan ism/raqam kelsa maydonlarni to'ldiramiz
  useEffect(() => {
    if (user.name && !name) setName(user.name);
  }, [user.name]);

  useEffect(() => {
    if (user.phone && !phone) setPhone(user.phone);
  }, [user.phone]);

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
        if (!cancelled)
          setPromo({ code: r.code, discount: r.discount, label: r.label });
      })
      .catch(() => {
        if (!cancelled) {
          setPromo(null);
          setPromoError(t("promoExpired"));
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
          `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
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
            <div className="header__hi">{t("yourOrder")}</div>
            <div className="header__name">{t("cart")}</div>
          </div>
        </header>

        <div className="empty">
          <div className="empty__emoji">🛒</div>
          <div className="empty__title">{t("cartEmpty")}</div>
          <div style={{ marginBottom: 20 }}>{t("cartEmptyText")}</div>
          <button
            className="btn"
            style={{ maxWidth: 240, margin: "0 auto" }}
            onClick={() => goTo("catalog")}
          >
            {t("goToCatalog")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="header__hi">{t("yourOrder")}</div>
          <div className="header__name">{t("cart")}</div>
        </div>
      </header>

      {!settings.isOpenNow && (
        <div className="notice notice--warn">
          {t("closedNotice", settings.workFrom, settings.workTo)}
        </div>
      )}

      {cart.map((item) => (
        <div className="cart-row" key={item.key}>
          <img className="cart-row__img" src={item.imageUrl} alt={localized(item, lang)} />

          <div className="cart-row__main">
            <div className="cart-row__name">
              {localized(item, lang)}
              {item.size ? (
                <span className="cart-row__size"> · {item.size}</span>
              ) : null}
            </div>

            {item.toppings?.length > 0 && (
              <div className="cart-row__tops">
                + {item.toppings.map((x) => localized(x, lang)).join(", ")}
              </div>
            )}

            <div className="cart-row__price">
              {formatPrice(item.price)} {t("sum")}
            </div>
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
          <img className="upsell__img" src={drink.imageUrl} alt={localized(drink, lang)} />
          <div className="upsell__text">
            {t("upsell", localized(drink, lang), formatPrice(drink.newPrice))}
          </div>
          <button
            className={"switch" + (drinkInCart ? " switch--on" : "")}
            onClick={toggleDrink}
            aria-label={t("toppings")}
          />
        </div>
      )}

      {/* ---------- Promokod ---------- */}
      <div className="section__title" style={{ margin: "22px 0 12px" }}>
        {t("promoCode")}
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
            {t("promoRemove")}
          </button>
        </div>
      ) : (
        <>
          <div className="promo-row">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder={t("promoPlaceholder")}
            />
            <button
              className="btn btn--ghost"
              onClick={applyPromo}
              disabled={promoLoading || !promoInput.trim()}
            >
              {promoLoading ? "..." : t("promoApply")}
            </button>
          </div>
          {promoError && <div className="promo-error">{promoError}</div>}
        </>
      )}

      {/* ---------- Ma'lumotlar ---------- */}
      <div className="section__title" style={{ margin: "22px 0 12px" }}>
        {t("deliveryInfo")}
      </div>

      <div className="field">
        <label>{t("yourName")}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
        />
      </div>

      <div className="field">
        <label>{t("yourPhone")}</label>
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
          {t("connectPhone")}
        </button>
      </div>

      <div className="field">
        <label>{t("addressLabel")}</label>
        <textarea
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t("addressPlaceholder")}
        />
        <button
          className="btn btn--ghost"
          style={{ marginTop: 8, padding: 12, fontSize: 14 }}
          onClick={detectLocation}
          disabled={geoLoading}
        >
          {geoLoading ? t("detecting") : t("detectLocation")}
        </button>
      </div>

      {/* ---------- Hisob ---------- */}
      <div className="summary">
        <div className="summary__row">
          <span>{t("productsSum")}</span>
          <span>
            {formatPrice(subtotal)} {t("sum")}
          </span>
        </div>

        {discount > 0 && (
          <div className="summary__row summary__row--green">
            <span>
              {t("discount")} ({promo.code})
            </span>
            <span>
              −{formatPrice(discount)} {t("sum")}
            </span>
          </div>
        )}

        <div className="summary__row">
          <span>{t("deliveryFee")}</span>
          <span>
            {deliveryFee === 0
              ? t("free")
              : `${formatPrice(deliveryFee)} ${t("sum")}`}
          </span>
        </div>

        {deliveryFee > 0 && (
          <div className="summary__hint">
            {t("freeHint", formatPrice(settings.freeDeliveryFrom - afterDiscount))}
          </div>
        )}
      </div>

      <div className="total">
        <span>{t("total")}</span>
        <span>
          {formatPrice(total)} {t("sum")}
        </span>
      </div>

      {belowMin && (
        <div className="notice notice--warn">
          {t("minOrder", formatPrice(settings.minOrderTotal))}
        </div>
      )}

      <button
        className="btn"
        disabled={!valid || submitting}
        onClick={() =>
          onSubmit({ name, phone, location, promoCode: promo?.code || null })
        }
      >
        {submitting ? t("sending") : t("confirmOrder")}
      </button>

      <div style={{ height: 20 }} />
    </div>
  );
}

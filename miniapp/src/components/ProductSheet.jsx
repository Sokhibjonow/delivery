import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "../api.js";
import { haptic } from "../telegram.js";
import { useLang, INGREDIENTS, localized } from "../i18n.js";

export default function ProductSheet({
  product,
  toppings,
  onClose,
  onAdd,
  isFavorite,
  onToggleFavorite,
}) {
  const { lang, t } = useLang();

  const [qty, setQty] = useState(1);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [selected, setSelected] = useState([]);

  const sizes = useMemo(
    () => (Array.isArray(product?.sizes) ? product.sizes : []),
    [product]
  );

  // Sahifa scroll'i faqat oyna OCHIQ bo'lganda bloklanadi
  useEffect(() => {
    if (!product) return;

    setQty(1);
    setSizeIndex(0);
    setSelected([]);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  if (!product) return null;

  const title = localized(product, lang);
  const desc = localized(product, lang, "description");

  const bullets = INGREDIENTS[lang]?.[product.name] ||
    INGREDIENTS.uz[product.name] || [
      t("defBullet1"),
      t("defBullet2"),
      t("defBullet3"),
    ];

  const size = sizes[sizeIndex] || null;
  const sizeDelta = size ? Number(size.delta) || 0 : 0;

  const chosenToppings = toppings.filter((x) => selected.includes(x.id));
  const toppingsSum = chosenToppings.reduce((s, x) => s + x.price, 0);

  const unitPrice = product.newPrice + sizeDelta + toppingsSum;
  const total = unitPrice * qty;

  const toggleTopping = (id) => {
    haptic();
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  return (
    <>
      <div className="backdrop" onClick={onClose} />

      <div className="sheet">
        <div className="sheet__handle" />

        <div className="sheet__scroll">
          <div className="sheet__imgwrap">
            <img
              className="sheet__img"
              src={product.imageUrl}
              alt={title}
            />
            <button
              className={"fav-btn" + (isFavorite ? " fav-btn--on" : "")}
              onClick={() => {
                haptic();
                onToggleFavorite(product);
              }}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          </div>

          <h2 className="sheet__title">{title}</h2>

          {product.oldPrice ? (
            <div className="price__old" style={{ fontSize: 13 }}>
              {formatPrice(product.oldPrice)} {t("sum")}
            </div>
          ) : null}

          <p className="sheet__desc">{desc}</p>

          {sizes.length > 0 && (
            <>
              <div className="sheet__sub">{t("chooseSize")}</div>
              <div className="segmented">
                {sizes.map((s, i) => (
                  <button
                    key={s.label}
                    className={"segment" + (i === sizeIndex ? " segment--on" : "")}
                    onClick={() => {
                      haptic();
                      setSizeIndex(i);
                    }}
                  >
                    <span>{s.label}</span>
                    {s.delta > 0 && (
                      <span className="segment__plus">
                        +{formatPrice(s.delta)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {toppings.length > 0 && (
            <>
              <div className="sheet__sub">{t("toppings")}</div>
              <div className="toppings">
                {toppings.map((x) => {
                  const on = selected.includes(x.id);
                  return (
                    <button
                      key={x.id}
                      className={"topping" + (on ? " topping--on" : "")}
                      onClick={() => toggleTopping(x.id)}
                    >
                      <span className={"tick" + (on ? " tick--on" : "")}>
                        {on ? "✓" : ""}
                      </span>
                      <span className="topping__name">{localized(x, lang)}</span>
                      <span className="topping__price">
                        +{formatPrice(x.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="sheet__sub">{t("ingredients")}</div>
          <ul className="bullets">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>

        <div className="sheet__cta">
          <div className="qty">
            <button
              className="qty__btn"
              onClick={() => {
                haptic();
                setQty((q) => Math.max(1, q - 1));
              }}
            >
              −
            </button>
            <span className="qty__val">{qty}</span>
            <button
              className="qty__btn"
              onClick={() => {
                haptic();
                setQty((q) => Math.min(20, q + 1));
              }}
            >
              +
            </button>
          </div>

          <button
            className="btn"
            onClick={() => {
              haptic("medium");
              onAdd(product, {
                qty,
                size: size?.label || null,
                toppings: chosenToppings,
                unitPrice,
              });
              onClose();
            }}
          >
            {t("addToCart")} — {formatPrice(total)} {t("sum")}
          </button>
        </div>
      </div>
    </>
  );
}

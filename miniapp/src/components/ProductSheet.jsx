import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "../api.js";
import { haptic } from "../telegram.js";

// Har bir mahsulot tarkibi (bullet-point'lar uchun)
const INGREDIENTS = {
  Margarita: [
    "Yupqa italyan xamiri",
    "Maxsus tomat sousi",
    "Mozzarella pishlog'i",
    "Yangi rayhon barglari",
    "Zaytun moyi",
  ],
  Peperoni: [
    "Yupqa italyan xamiri",
    "Achchiqroq peperoni kolbasasi",
    "Qo'sh mozzarella pishlog'i",
    "Tomat sousi va ziravorlar",
  ],
  "Qazi pizza": [
    "Tabiiy ot qazisi",
    "Qizil piyoz",
    "Bulg'or qalampiri",
    "Mozzarella pishlog'i",
    "Tomat sousi",
  ],
  Pishloqli: [
    "Mozzarella pishlog'i",
    "Chedder pishlog'i",
    "Parmezan pishlog'i",
    "Suzma pishloq",
    "Qaymoqli sous",
  ],
};

const DEFAULT_BULLETS = [
  "Yangi va sifatli mahsulotlar",
  "Buyurtmadan keyin tayyorlanadi",
  "30 daqiqada yetkazib beriladi",
];

export default function ProductSheet({
  product,
  toppings,
  onClose,
  onAdd,
  isFavorite,
  onToggleFavorite,
}) {
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

  const bullets = INGREDIENTS[product.name] || DEFAULT_BULLETS;

  const size = sizes[sizeIndex] || null;
  const sizeDelta = size ? Number(size.delta) || 0 : 0;

  const chosenToppings = toppings.filter((t) => selected.includes(t.id));
  const toppingsSum = chosenToppings.reduce((s, t) => s + t.price, 0);

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
              alt={product.name}
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

          <h2 className="sheet__title">{product.name}</h2>

          {product.oldPrice ? (
            <div className="price__old" style={{ fontSize: 13 }}>
              {formatPrice(product.oldPrice)} so'm
            </div>
          ) : null}

          <p className="sheet__desc">{product.description}</p>

          {sizes.length > 0 && (
            <>
              <div className="sheet__sub">O'lchamni tanlang</div>
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
              <div className="sheet__sub">Qo'shimchalar</div>
              <div className="toppings">
                {toppings.map((t) => {
                  const on = selected.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      className={"topping" + (on ? " topping--on" : "")}
                      onClick={() => toggleTopping(t.id)}
                    >
                      <span className={"tick" + (on ? " tick--on" : "")}>
                        {on ? "✓" : ""}
                      </span>
                      <span className="topping__name">{t.name}</span>
                      <span className="topping__price">
                        +{formatPrice(t.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="sheet__sub">Tarkibi</div>
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
            Savatchaga qo'shish — {formatPrice(total)} so'm
          </button>
        </div>
      </div>
    </>
  );
}

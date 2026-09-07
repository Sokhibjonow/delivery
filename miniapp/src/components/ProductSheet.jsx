import { useEffect, useState } from "react";
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

export default function ProductSheet({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);

  // Sahifa scroll'i faqat oyna OCHIQ bo'lganda bloklanadi
  useEffect(() => {
    if (!product) return;

    setQty(1);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  if (!product) return null;

  const bullets = INGREDIENTS[product.name] || DEFAULT_BULLETS;
  const total = product.newPrice * qty;

  return (
    <>
      <div className="backdrop" onClick={onClose} />

      <div className="sheet">
        <div className="sheet__handle" />

        <div className="sheet__scroll">
          <img
            className="sheet__img"
            src={product.imageUrl}
            alt={product.name}
          />

          <h2 className="sheet__title">{product.name}</h2>

          {product.oldPrice ? (
            <div className="price__old" style={{ fontSize: 13 }}>
              {formatPrice(product.oldPrice)} so'm
            </div>
          ) : null}

          <p className="sheet__desc">{product.description}</p>

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
              onAdd(product, qty);
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

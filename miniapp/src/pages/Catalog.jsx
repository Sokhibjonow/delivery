import { useState } from "react";
import ProductCard from "../components/ProductCard.jsx";
import { haptic } from "../telegram.js";

export default function Catalog({ products, categories, onOpen, onAdd }) {
  const [active, setActive] = useState("Hammasi");

  const visible =
    active === "Hammasi"
      ? products
      : products.filter((p) => p.category === active);

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="header__hi">Menyu</div>
          <div className="header__name">Katalog</div>
        </div>
      </header>

      <div className="chips">
        {categories.map((c) => (
          <button
            key={c}
            className={"chip" + (active === c ? " chip--on" : "")}
            onClick={() => {
              haptic();
              setActive(c);
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <div className="empty__emoji">🍽️</div>
          <div className="empty__title">Mahsulot topilmadi</div>
          <div>Boshqa kategoriyani tanlab ko'ring</div>
        </div>
      ) : (
        <div className="grid">
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={onOpen}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

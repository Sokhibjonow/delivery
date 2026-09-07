import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard.jsx";
import { haptic } from "../telegram.js";

export default function Catalog({
  products,
  categories,
  onOpen,
  onAdd,
  favorites,
  onToggleFavorite,
}) {
  const [active, setActive] = useState("Hammasi");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((p) => {
      const byCategory = active === "Hammasi" || p.category === active;
      const bySearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      return byCategory && bySearch;
    });
  }, [products, active, query]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="header__hi">Menyu</div>
          <div className="header__name">Katalog</div>
        </div>
      </header>

      <div className="search">
        <span className="search__icon">🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pizza qidirish..."
        />
        {query && (
          <button className="search__clear" onClick={() => setQuery("")}>
            ×
          </button>
        )}
      </div>

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
          <div className="empty__title">Hech narsa topilmadi</div>
          <div>Boshqa nom yoki kategoriyani sinab ko'ring</div>
        </div>
      ) : (
        <div className="grid">
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={onOpen}
              onAdd={onAdd}
              isFavorite={favorites.includes(p.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

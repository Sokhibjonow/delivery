import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard.jsx";
import { haptic } from "../telegram.js";
import { useLang, translateCategory, localized } from "../i18n.js";

export default function Catalog({
  products,
  categories,
  onOpen,
  onAdd,
  favorites,
  onToggleFavorite,
}) {
  const { lang, t } = useLang();
  const [active, setActive] = useState("Hammasi");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((p) => {
      const byCategory = active === "Hammasi" || p.category === active;
      const haystack = [p.name, p.nameRu, p.description, p.descriptionRu]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const bySearch = !q || haystack.includes(q);

      return byCategory && bySearch;
    });
  }, [products, active, query]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="header__hi">{t("menuLabel")}</div>
          <div className="header__name">{t("catalog")}</div>
        </div>
      </header>

      <div className="search">
        <span className="search__icon">🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
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
            {translateCategory(c, lang)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <div className="empty__emoji">🍽️</div>
          <div className="empty__title">{t("nothingFound")}</div>
          <div>{t("tryAnother")}</div>
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

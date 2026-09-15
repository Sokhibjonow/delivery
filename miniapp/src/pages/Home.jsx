import Stories from "../components/Stories.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { formatPrice } from "../api.js";
import { useLang } from "../i18n.js";

export default function Home({
  user,
  products,
  settings,
  onOpen,
  onAdd,
  goTo,
  favoriteIds,
  onToggleFavorite,
}) {
  const { t } = useLang();
  const popular = products.filter((p) => p.category === "Pizza").slice(0, 4);

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="header__hi">{t("welcome")}</div>
          <div className="header__name">
            {user.name === "Mehmon" ? t("guest") : user.name}
          </div>
        </div>
        <div className="header__avatar">🍕</div>
      </header>

      {!settings.isOpenNow && (
        <div className="notice notice--warn">
          {t("closedNotice", settings.workFrom, settings.workTo)}
        </div>
      )}

      <Stories />

      <section className="hero">
        <div className="hero__emoji">🍕</div>
        <div className="hero__title">{t("heroTitle")}</div>
        <p className="hero__text">{t("heroText", settings.shopName)}</p>
        <button className="btn" onClick={() => goTo("catalog")}>
          {t("openMenu")}
        </button>
      </section>

      {settings.freeDeliveryFrom > 0 && (
        <div className="notice notice--info">
          {t("freeDeliveryNotice", formatPrice(settings.freeDeliveryFrom))}
        </div>
      )}

      <section className="section">
        <div className="section__head">
          <div className="section__title">{t("popular")}</div>
          <button className="section__link" onClick={() => goTo("catalog")}>
            {t("seeAll")}
          </button>
        </div>

        <div className="grid">
          {popular.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={onOpen}
              onAdd={onAdd}
              isFavorite={favoriteIds.includes(p.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

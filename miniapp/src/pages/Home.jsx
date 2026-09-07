import Stories from "../components/Stories.jsx";
import ProductCard from "../components/ProductCard.jsx";

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
  const popular = products.filter((p) => p.category === "Pizza").slice(0, 4);

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="header__hi">Xush kelibsiz 👋</div>
          <div className="header__name">{user.name}</div>
        </div>
        <div className="header__avatar">🍕</div>
      </header>

      {!settings.isOpenNow && (
        <div className="notice notice--warn">
          🕒 Hozir yopiqmiz. Ish vaqti: {settings.workFrom} — {settings.workTo}
        </div>
      )}

      <Stories />

      <section className="hero">
        <div className="hero__emoji">🍕</div>
        <div className="hero__title">Yangi buyurtma berish</div>
        <p className="hero__text">
          {settings.shopName} — issiqqina pizzalar 30 daqiqada eshigingizda.
        </p>
        <button className="btn" onClick={() => goTo("catalog")}>
          Menyuni ochish
        </button>
      </section>

      {settings.freeDeliveryFrom > 0 && (
        <div className="notice notice--info">
          🛵 {new Intl.NumberFormat("ru-RU").format(settings.freeDeliveryFrom)}{" "}
          so'mdan yuqori buyurtmalarga yetkazib berish <b>bepul</b>
        </div>
      )}

      <section className="section">
        <div className="section__head">
          <div className="section__title">Ommabop pizzalar</div>
          <button className="section__link" onClick={() => goTo("catalog")}>
            Barchasi
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

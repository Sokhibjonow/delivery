import Stories from "../components/Stories.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function Home({ user, products, shopName, onOpen, onAdd, goTo }) {
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

      <Stories />

      <section className="hero">
        <div className="hero__emoji">🍕</div>
        <div className="hero__title">Yangi buyurtma berish</div>
        <p className="hero__text">
          {shopName} — issiqqina pizzalar 30 daqiqada eshigingizda.
        </p>
        <button className="btn" onClick={() => goTo("catalog")}>
          Menyuni ochish
        </button>
      </section>

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
            />
          ))}
        </div>
      </section>
    </div>
  );
}

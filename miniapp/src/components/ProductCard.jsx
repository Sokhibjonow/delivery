import { formatPrice } from "../api.js";
import { haptic } from "../telegram.js";
import { useLang, localized } from "../i18n.js";

export default function ProductCard({
  product,
  onOpen,
  onAdd,
  isFavorite,
  onToggleFavorite,
}) {
  const { lang, t } = useLang();
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;

  const name = localized(product, lang);
  const price = `${formatPrice(product.newPrice)} ${t("sum")}`;

  return (
    <div className="card" onClick={() => onOpen(product)}>
      <div className="card__imgwrap">
        <img className="card__img" src={product.imageUrl} alt={name} />

        {onToggleFavorite && (
          <button
            className={"fav-btn fav-btn--sm" + (isFavorite ? " fav-btn--on" : "")}
            onClick={(e) => {
              e.stopPropagation();
              haptic();
              onToggleFavorite(product);
            }}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      <div className="card__body">
        <div className="card__name">{name}</div>

        <div className="card__foot">
          <div>
            {product.oldPrice ? (
              <div className="price__old">
                {formatPrice(product.oldPrice)} {t("sum")}
              </div>
            ) : null}
            <div className="price__new">
              {hasSizes ? t("priceFrom", price) : price}
            </div>
          </div>

          <button
            className="add"
            onClick={(e) => {
              e.stopPropagation();
              haptic();
              // O'lchami bor mahsulot uchun oynani ochamiz
              if (hasSizes) onOpen(product);
              else onAdd(product, { qty: 1 });
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

import { formatPrice } from "../api.js";
import { haptic } from "../telegram.js";

export default function ProductCard({
  product,
  onOpen,
  onAdd,
  isFavorite,
  onToggleFavorite,
}) {
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;

  return (
    <div className="card" onClick={() => onOpen(product)}>
      <div className="card__imgwrap">
        <img className="card__img" src={product.imageUrl} alt={product.name} />

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
        <div className="card__name">{product.name}</div>

        <div className="card__foot">
          <div>
            {product.oldPrice ? (
              <div className="price__old">
                {formatPrice(product.oldPrice)} so'm
              </div>
            ) : null}
            <div className="price__new">
              {hasSizes ? `${formatPrice(product.newPrice)} so'm dan` : `${formatPrice(product.newPrice)} so'm`}
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

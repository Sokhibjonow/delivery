import { formatPrice } from "../api.js";
import { haptic } from "../telegram.js";

export default function ProductCard({ product, onOpen, onAdd }) {
  return (
    <div className="card" onClick={() => onOpen(product)}>
      <img className="card__img" src={product.imageUrl} alt={product.name} />

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
              {formatPrice(product.newPrice)} so'm
            </div>
          </div>

          <button
            className="add"
            onClick={(e) => {
              e.stopPropagation();
              haptic();
              onAdd(product);
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

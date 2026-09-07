import { useCallback, useEffect, useState } from "react";
import { api, formatPrice } from "../api.js";
import ProductModal from "../components/ProductModal.jsx";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null = yopiq, {} = yangi

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await api.getProducts());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (data) => {
    if (data.id) await api.updateProduct(data.id, data);
    else await api.createProduct(data);
    setEditing(null);
    load();
  };

  const remove = async (product) => {
    if (!confirm(`"${product.name}" o'chirilsinmi?`)) return;
    await api.deleteProduct(product.id);
    load();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Mahsulotlar</h1>
          <div className="page-sub">
            Pizzalar va ichimliklarni qo'shing, tahrirlang yoki o'chiring
          </div>
        </div>

        <button className="btn" onClick={() => setEditing({})}>
          + Yangi mahsulot
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="panel">
        {loading ? (
          <div className="loader">
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <div className="empty">
            <div className="empty__emoji">🍕</div>
            <div className="empty__title">Mahsulotlar yo'q</div>
            <div>"Yangi mahsulot" tugmasi orqali qo'shing</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rasm</th>
                  <th>Nomi</th>
                  <th>Ta'rifi</th>
                  <th>Kategoriya</th>
                  <th>Eski narx</th>
                  <th>Yangi narx</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img className="thumb" src={p.imageUrl} alt={p.name} />
                    </td>

                    <td className="cell-strong">{p.name}</td>

                    <td
                      className="cell-muted"
                      style={{ maxWidth: 280 }}
                      title={p.description}
                    >
                      {p.description.length > 70
                        ? p.description.slice(0, 70) + "..."
                        : p.description}
                    </td>

                    <td>
                      <span className="tag">{p.category}</span>
                    </td>

                    <td className="old-price">
                      {p.oldPrice ? formatPrice(p.oldPrice) + " so'm" : "—"}
                    </td>

                    <td className="cell-price">
                      {formatPrice(p.newPrice)} so'm
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn--sm btn--ghost"
                          onClick={() => setEditing(p)}
                        >
                          Tahrirlash
                        </button>
                        <button
                          className="btn btn--sm btn--danger"
                          onClick={() => remove(p)}
                        >
                          O'chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <ProductModal
          product={editing}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

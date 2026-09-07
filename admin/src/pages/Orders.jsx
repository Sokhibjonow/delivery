import { useCallback, useEffect, useState } from "react";
import { api, formatPrice, formatDate } from "../api.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setOrders(await api.getOrders());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Real vaqtga yaqin yangilanish: har 10 soniyada
    const timer = setInterval(() => load(true), 10000);
    return () => clearInterval(timer);
  }, [load]);

  const toggleStatus = async (order) => {
    const next = order.status === "yetkazildi" ? "kutilmoqda" : "yetkazildi";
    await api.setOrderStatus(order.id, next);
    load(true);
  };

  const remove = async (order) => {
    if (!confirm(`#${order.id} buyurtma o'chirilsinmi?`)) return;
    await api.deleteOrder(order.id);
    load(true);
  };

  const pending = orders.filter((o) => o.status !== "yetkazildi").length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Buyurtmalar</h1>
          <div className="page-sub">
            Mijozlardan tushgan barcha buyurtmalar ro'yxati
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="live">
            <span className="live__dot" />
            Har 10 soniyada yangilanadi
          </span>
          <button className="btn btn--ghost" onClick={() => load()}>
            ⟳ Yangilash
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stats">
        <div className="stat">
          <div className="stat__label">Jami buyurtmalar</div>
          <div className="stat__value">{orders.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Kutilmoqda</div>
          <div className="stat__value">{pending}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Umumiy summa</div>
          <div className="stat__value">{formatPrice(revenue)} so'm</div>
        </div>
      </div>

      <div className="panel">
        {loading ? (
          <div className="loader">
            <div className="spinner" />
          </div>
        ) : orders.length === 0 ? (
          <div className="empty">
            <div className="empty__emoji">🧾</div>
            <div className="empty__title">Hozircha buyurtmalar yo'q</div>
            <div>Mini App orqali birinchi buyurtma kutilmoqda</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Mijoz</th>
                  <th>Telefon</th>
                  <th>Buyurtma tarkibi</th>
                  <th>Manzil</th>
                  <th>Jami</th>
                  <th>Sana</th>
                  <th>Holati</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="cell-strong">#{o.id}</td>

                    <td className="cell-strong">{o.user?.name || "—"}</td>

                    <td>{o.user?.phone || "—"}</td>

                    <td>
                      <ul className="items-list">
                        {o.items.map((i, idx) => (
                          <li key={idx}>
                            {i.name} × {i.qty}
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td className="cell-muted" style={{ maxWidth: 200 }}>
                      {o.location || "—"}
                    </td>

                    <td className="cell-price">
                      {formatPrice(o.total)} so'm
                    </td>

                    <td className="cell-muted">{formatDate(o.createdAt)}</td>

                    <td>
                      <button
                        className={
                          "badge" +
                          (o.status === "yetkazildi" ? " badge--done" : "")
                        }
                        onClick={() => toggleStatus(o)}
                        title="Holatni o'zgartirish"
                      >
                        {o.status}
                      </button>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn--sm btn--danger"
                          onClick={() => remove(o)}
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
    </>
  );
}

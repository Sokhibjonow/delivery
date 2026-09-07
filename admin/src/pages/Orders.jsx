import { useCallback, useEffect, useState } from "react";
import { api, formatPrice, formatDate, STATUSES, statusInfo } from "../api.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("hammasi");

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
    const timer = setInterval(() => load(true), 10000);
    return () => clearInterval(timer);
  }, [load]);

  const changeStatus = async (order, status) => {
    await api.setOrderStatus(order.id, status);
    load(true);
  };

  const remove = async (order) => {
    if (!confirm(`#${order.id} buyurtma o'chirilsinmi?`)) return;
    await api.deleteOrder(order.id);
    load(true);
  };

  const visible =
    filter === "hammasi" ? orders : orders.filter((o) => o.status === filter);

  const active = orders.filter(
    (o) => o.status !== "yetkazildi" && o.status !== "bekor"
  ).length;

  const revenue = orders
    .filter((o) => o.status !== "bekor")
    .reduce((s, o) => s + o.total, 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Buyurtmalar</h1>
          <div className="page-sub">
            Mijozlardan tushgan barcha buyurtmalar ro'yxati
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="live">
            <span className="live__dot" />
            Har 10 soniyada yangilanadi
          </span>
          <button className="btn btn--ghost" onClick={() => api.exportOrders()}>
            ⬇ Excel'ga yuklash
          </button>
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
          <div className="stat__label">Faol (yetkazilmagan)</div>
          <div className="stat__value">{active}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Umumiy summa</div>
          <div className="stat__value">{formatPrice(revenue)} so'm</div>
        </div>
      </div>

      <div className="filters">
        <button
          className={"chip" + (filter === "hammasi" ? " chip--on" : "")}
          onClick={() => setFilter("hammasi")}
        >
          Hammasi ({orders.length})
        </button>
        {STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s.key).length;
          return (
            <button
              key={s.key}
              className={"chip" + (filter === s.key ? " chip--on" : "")}
              onClick={() => setFilter(s.key)}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="panel">
        {loading ? (
          <div className="loader">
            <div className="spinner" />
          </div>
        ) : visible.length === 0 ? (
          <div className="empty">
            <div className="empty__emoji">🧾</div>
            <div className="empty__title">Buyurtmalar yo'q</div>
            <div>Bu bo'limda hozircha hech narsa yo'q</div>
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
                  <th>Hisob</th>
                  <th>Sana</th>
                  <th>Holati</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {visible.map((o) => (
                  <tr key={o.id}>
                    <td className="cell-strong">#{o.id}</td>

                    <td className="cell-strong">{o.user?.name || "—"}</td>

                    <td>{o.user?.phone || "—"}</td>

                    <td>
                      <ul className="items-list">
                        {o.items.map((i, idx) => (
                          <li key={idx}>
                            {i.name}
                            {i.size ? ` (${i.size})` : ""} × {i.qty}
                            {i.toppings?.length > 0 && (
                              <div className="items-list__tops">
                                + {i.toppings.map((t) => t.name).join(", ")}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td className="cell-muted" style={{ maxWidth: 180 }}>
                      {o.location || "—"}
                    </td>

                    <td>
                      <div className="money">
                        <div className="money__row">
                          <span>Mahsulot</span>
                          <span>{formatPrice(o.subtotal)}</span>
                        </div>
                        {o.discount > 0 && (
                          <div className="money__row money__row--green">
                            <span>{o.promoCode || "Chegirma"}</span>
                            <span>−{formatPrice(o.discount)}</span>
                          </div>
                        )}
                        <div className="money__row">
                          <span>Yetkazish</span>
                          <span>
                            {o.deliveryFee > 0
                              ? formatPrice(o.deliveryFee)
                              : "Bepul"}
                          </span>
                        </div>
                        <div className="money__total">
                          {formatPrice(o.total)} so'm
                        </div>
                      </div>
                    </td>

                    <td className="cell-muted">{formatDate(o.createdAt)}</td>

                    <td>
                      <select
                        className={"status-select " + statusInfo(o.status).cls}
                        value={o.status}
                        onChange={(e) => changeStatus(o, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
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

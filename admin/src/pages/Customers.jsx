import { useCallback, useEffect, useState } from "react";
import { api, formatPrice, formatDate } from "../api.js";

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await api.getCustomers());
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

  const q = query.trim().toLowerCase();
  const visible = q
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.phone || "").includes(q) ||
          r.telegramId.includes(q)
      )
    : rows;

  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);
  const withOrders = rows.filter((r) => r.ordersCount > 0).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Mijozlar</h1>
          <div className="page-sub">
            Kim necha marta buyurtma qilgan va qancha sarflagan
          </div>
        </div>

        <button className="btn btn--ghost" onClick={load}>
          ⟳ Yangilash
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stats">
        <div className="stat">
          <div className="stat__label">Jami mijozlar</div>
          <div className="stat__value">{rows.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Buyurtma qilganlar</div>
          <div className="stat__value">{withOrders}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Umumiy tushum</div>
          <div className="stat__value">{formatPrice(totalSpent)} so'm</div>
        </div>
      </div>

      <div className="search-bar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ism, telefon yoki Telegram ID bo'yicha qidirish..."
        />
      </div>

      <div className="panel">
        {loading ? (
          <div className="loader">
            <div className="spinner" />
          </div>
        ) : visible.length === 0 ? (
          <div className="empty">
            <div className="empty__emoji">👥</div>
            <div className="empty__title">Mijozlar topilmadi</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ismi</th>
                  <th>Telefon</th>
                  <th>Telegram ID</th>
                  <th>Buyurtmalar</th>
                  <th>Sarflagan</th>
                  <th>O'rtacha chek</th>
                  <th>Oxirgi buyurtma</th>
                </tr>
              </thead>

              <tbody>
                {visible.map((r, i) => (
                  <tr key={r.id}>
                    <td className="cell-muted">{i + 1}</td>
                    <td className="cell-strong">
                      {r.name}
                      {r.ordersCount >= 3 && (
                        <span className="tag tag--vip">VIP</span>
                      )}
                    </td>
                    <td>{r.phone || "—"}</td>
                    <td className="cell-muted">{r.telegramId}</td>
                    <td className="cell-strong">{r.ordersCount}</td>
                    <td className="cell-price">{formatPrice(r.spent)} so'm</td>
                    <td>{formatPrice(r.avgCheck)} so'm</td>
                    <td className="cell-muted">{formatDate(r.lastOrderAt)}</td>
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

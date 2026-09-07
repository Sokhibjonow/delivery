import { formatPrice, formatDate } from "../api.js";
import { haptic } from "../telegram.js";

export default function Profile({ user, orders, loading, onReorder, goTo }) {
  return (
    <div className="page">
      <div className="profile-top">
        <div className="profile-top__avatar">👤</div>
        <div className="profile-top__name">{user.name}</div>
        {user.phone ? (
          <div className="profile-top__id">{user.phone}</div>
        ) : (
          <div className="profile-top__id">ID: {user.telegramId}</div>
        )}
      </div>

      <div className="section__title" style={{ marginBottom: 12 }}>
        📜 Mening buyurtmalarim
      </div>

      {loading ? (
        <div className="loader">
          <div className="spinner" />
        </div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="empty__emoji">🧾</div>
          <div className="empty__title">Buyurtmalar yo'q</div>
          <div style={{ marginBottom: 20 }}>
            Birinchi buyurtmangizni hoziroq bering
          </div>
          <button
            className="btn"
            style={{ maxWidth: 240, margin: "0 auto" }}
            onClick={() => goTo("catalog")}
          >
            Katalogga o'tish
          </button>
        </div>
      ) : (
        orders.map((o) => (
          <div className="order" key={o.id}>
            <div className="order__head">
              <div className="order__id">Buyurtma #{o.id}</div>
              <div
                className={
                  "badge" + (o.status === "yetkazildi" ? " badge--done" : "")
                }
              >
                {o.status}
              </div>
            </div>

            <div className="order__items">
              {o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}
            </div>

            <div className="order__items" style={{ fontSize: 12 }}>
              {formatDate(o.createdAt)}
            </div>

            <div className="order__foot">
              <div className="order__total">
                {formatPrice(o.total)} so'm
              </div>
              <button
                className="order__again"
                onClick={() => {
                  haptic("medium");
                  onReorder(o);
                }}
              >
                Yana shundan buyurtma qilish
              </button>
            </div>
          </div>
        ))
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}

import { useState } from "react";
import { formatPrice, formatDate, ORDER_STEPS } from "../api.js";
import { haptic } from "../telegram.js";
import ProductCard from "../components/ProductCard.jsx";

function OrderTracker({ status }) {
  if (status === "bekor") {
    return <div className="tracker tracker--cancel">❌ Buyurtma bekor qilingan</div>;
  }

  const current = ORDER_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="tracker">
      {ORDER_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <div
            key={step.key}
            className={"tracker__step" + (done ? " tracker__step--on" : "")}
          >
            <div className="tracker__dot">{done ? step.icon : ""}</div>
            <div className="tracker__label">{step.label}</div>
            {i < ORDER_STEPS.length - 1 && (
              <div
                className={
                  "tracker__line" + (i < current ? " tracker__line--on" : "")
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Profile({
  user,
  orders,
  loading,
  onReorder,
  goTo,
  favorites,
  favoriteIds,
  onOpen,
  onAdd,
  onToggleFavorite,
}) {
  const [tab, setTab] = useState("orders");

  return (
    <div className="page">
      <div className="profile-top">
        <div className="profile-top__avatar">👤</div>
        <div className="profile-top__name">{user.name}</div>
        {user.phone ? (
          <div className="profile-top__id">{user.phone}</div>
        ) : null}
      </div>

      {!user.verified && (
        <div className="notice notice--warn">
          👤 Siz mehmon rejimidasiz. Buyurtmalaringiz saqlanadi, lekin botdan
          xabar kelishi uchun ilovani Telegram'dagi «🍕 Buyurtma berish»
          tugmasi orqali oching.
        </div>
      )}

      <div className="tabs">
        <button
          className={"tabs__item" + (tab === "orders" ? " tabs__item--on" : "")}
          onClick={() => {
            haptic();
            setTab("orders");
          }}
        >
          📜 Buyurtmalarim
        </button>
        <button
          className={"tabs__item" + (tab === "fav" ? " tabs__item--on" : "")}
          onClick={() => {
            haptic();
            setTab("fav");
          }}
        >
          ❤️ Sevimlilar {favorites.length > 0 ? `(${favorites.length})` : ""}
        </button>
      </div>

      {tab === "fav" ? (
        favorites.length === 0 ? (
          <div className="empty">
            <div className="empty__emoji">🤍</div>
            <div className="empty__title">Sevimlilar bo'sh</div>
            <div style={{ marginBottom: 20 }}>
              Yoqqan pizzani ❤️ belgisi bilan saqlab qo'ying
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
          <div className="grid">
            {favorites.map((p) => (
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
        )
      ) : loading ? (
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
              <div className="order__date">{formatDate(o.createdAt)}</div>
            </div>

            <OrderTracker status={o.status} />

            <div className="order__items">
              {o.items
                .map((i) => {
                  const size = i.size ? ` (${i.size})` : "";
                  return `${i.name}${size} × ${i.qty}`;
                })
                .join(", ")}
            </div>

            <div className="order__foot">
              <div className="order__total">{formatPrice(o.total)} so'm</div>
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

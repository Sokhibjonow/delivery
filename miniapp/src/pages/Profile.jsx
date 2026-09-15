import { useState } from "react";
import { formatPrice, formatDate, ORDER_STEPS } from "../api.js";
import { haptic } from "../telegram.js";
import { useLang, LANGS, MULTILANG, localized } from "../i18n.js";
import ProductCard from "../components/ProductCard.jsx";

function OrderTracker({ status, t }) {
  if (status === "bekor") {
    return <div className="tracker tracker--cancel">{t("orderCancelled")}</div>;
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
            <div className="tracker__label">{t(step.tKey)}</div>
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
  onChangeLang,
  products = [],
}) {
  const { lang, t } = useLang();
  const [tab, setTab] = useState("orders");

  return (
    <div className="page">
      <div className="profile-top">
        <div className="profile-top__avatar">👤</div>
        <div className="profile-top__name">
          {user.name === "Mehmon" ? t("guest") : user.name}
        </div>
        {user.phone ? (
          <div className="profile-top__id">{user.phone}</div>
        ) : null}
      </div>

      {MULTILANG && (
        <div className="lang-row">
          <span className="lang-row__label">{t("language")}</span>
          <div className="lang-switch">
            {LANGS.map((l) => (
              <button
                key={l.code}
                className={"lang-btn" + (lang === l.code ? " lang-btn--on" : "")}
                onClick={() => {
                  haptic();
                  onChangeLang(l.code);
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
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
          {t("myOrders")}
        </button>
        <button
          className={"tabs__item" + (tab === "fav" ? " tabs__item--on" : "")}
          onClick={() => {
            haptic();
            setTab("fav");
          }}
        >
          {t("favorites")} {favorites.length > 0 ? `(${favorites.length})` : ""}
        </button>
      </div>

      {tab === "fav" ? (
        favorites.length === 0 ? (
          <div className="empty">
            <div className="empty__emoji">🤍</div>
            <div className="empty__title">{t("favEmpty")}</div>
            <div style={{ marginBottom: 20 }}>{t("favEmptyText")}</div>
            <button
              className="btn"
              style={{ maxWidth: 240, margin: "0 auto" }}
              onClick={() => goTo("catalog")}
            >
              {t("goToCatalog")}
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
          <div className="empty__title">{t("noOrders")}</div>
          <div style={{ marginBottom: 20 }}>{t("noOrdersText")}</div>
          <button
            className="btn"
            style={{ maxWidth: 240, margin: "0 auto" }}
            onClick={() => goTo("catalog")}
          >
            {t("goToCatalog")}
          </button>
        </div>
      ) : (
        orders.map((o) => (
          <div className="order" key={o.id}>
            <div className="order__head">
              <div className="order__id">{t("orderNo", o.id)}</div>
              <div className="order__date">{formatDate(o.createdAt)}</div>
            </div>

            <OrderTracker status={o.status} t={t} />

            <div className="order__items">
              {o.items
                .map((i) => {
                  const product = products.find((x) => x.id === i.id);
                  const label = localized(product || i, lang);
                  const size = i.size ? ` (${i.size})` : "";
                  return `${label}${size} × ${i.qty}`;
                })
                .join(", ")}
            </div>

            <div className="order__foot">
              <div className="order__total">
                {formatPrice(o.total)} {t("sum")}
              </div>
              <button
                className="order__again"
                onClick={() => {
                  haptic("medium");
                  onReorder(o);
                }}
              >
                {t("orderAgain")}
              </button>
            </div>
          </div>
        ))
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}

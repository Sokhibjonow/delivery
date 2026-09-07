import { haptic } from "../telegram.js";

const TABS = [
  { key: "home", icon: "🏠", label: "Bosh sahifa" },
  { key: "catalog", icon: "🔍", label: "Katalog" },
  { key: "cart", icon: "🛒", label: "Savatcha" },
  { key: "profile", icon: "👤", label: "Profil" },
];

export default function BottomNav({ tab, onChange, cartCount }) {
  return (
    <nav className="nav">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={"nav__item" + (tab === t.key ? " nav__item--on" : "")}
          onClick={() => {
            haptic();
            onChange(t.key);
          }}
        >
          <span className="nav__icon">{t.icon}</span>
          <span>{t.label}</span>
          {t.key === "cart" && cartCount > 0 && (
            <span className="nav__badge">{cartCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

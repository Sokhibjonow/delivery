import { haptic } from "../telegram.js";
import { useLang } from "../i18n.js";

const TABS = [
  { key: "home", icon: "🏠", tKey: "navHome" },
  { key: "catalog", icon: "🔍", tKey: "navCatalog" },
  { key: "cart", icon: "🛒", tKey: "navCart" },
  { key: "profile", icon: "👤", tKey: "navProfile" },
];

export default function BottomNav({ tab, onChange, cartCount }) {
  const { t } = useLang();

  return (
    <nav className="nav">
      {TABS.map((item) => (
        <button
          key={item.key}
          className={"nav__item" + (tab === item.key ? " nav__item--on" : "")}
          onClick={() => {
            haptic();
            onChange(item.key);
          }}
        >
          <span className="nav__icon">{item.icon}</span>
          <span>{t(item.tKey)}</span>
          {item.key === "cart" && cartCount > 0 && (
            <span className="nav__badge">{cartCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

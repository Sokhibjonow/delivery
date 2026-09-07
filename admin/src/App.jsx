import { useState } from "react";
import { getKey, clearKey } from "./api.js";

import Login from "./pages/Login.jsx";
import Orders from "./pages/Orders.jsx";
import Products from "./pages/Products.jsx";
import Toppings from "./pages/Toppings.jsx";
import Promos from "./pages/Promos.jsx";
import Customers from "./pages/Customers.jsx";
import Broadcast from "./pages/Broadcast.jsx";
import Settings from "./pages/Settings.jsx";

const PAGES = [
  { key: "orders", icon: "🧾", label: "Buyurtmalar", el: Orders },
  { key: "products", icon: "🍕", label: "Mahsulotlar", el: Products },
  { key: "toppings", icon: "🧀", label: "Qo'shimchalar", el: Toppings },
  { key: "promos", icon: "🎟️", label: "Promokodlar", el: Promos },
  { key: "customers", icon: "👥", label: "Mijozlar", el: Customers },
  { key: "broadcast", icon: "📢", label: "Reklama", el: Broadcast },
  { key: "settings", icon: "⚙️", label: "Sozlamalar", el: Settings },
];

export default function App() {
  const [authed, setAuthed] = useState(() => Boolean(getKey()));
  const [page, setPage] = useState("orders");

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  const Current = PAGES.find((p) => p.key === page)?.el || Orders;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__logo">🍕</div>
          <div>
            <div className="brand__name">Pizza Cubick</div>
            <div className="brand__sub">Admin Panel</div>
          </div>
        </div>

        {PAGES.map((p) => (
          <button
            key={p.key}
            className={"side-link" + (page === p.key ? " side-link--on" : "")}
            onClick={() => setPage(p.key)}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}

        <div className="side-foot">
          <button
            className="btn btn--ghost"
            style={{ width: "100%", marginBottom: 12 }}
            onClick={() => {
              clearKey();
              setAuthed(false);
            }}
          >
            Chiqish
          </button>
          Backend: localhost:4000
          <br />
          Admin: localhost:5174
        </div>
      </aside>

      <main className="main">
        <Current />
      </main>
    </div>
  );
}

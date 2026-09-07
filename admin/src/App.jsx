import { useState } from "react";
import Orders from "./pages/Orders.jsx";
import Products from "./pages/Products.jsx";

const PAGES = [
  { key: "orders", icon: "🧾", label: "Buyurtmalar" },
  { key: "products", icon: "🍕", label: "Mahsulotlar" },
];

export default function App() {
  const [page, setPage] = useState("orders");

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
          Backend: localhost:4000
          <br />
          Admin: localhost:5174
        </div>
      </aside>

      <main className="main">
        {page === "orders" ? <Orders /> : <Products />}
      </main>
    </div>
  );
}

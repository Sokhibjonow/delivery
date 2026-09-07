import { useState } from "react";
import { api } from "../api.js";

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.login(password);
      onSuccess();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form className="login__box" onSubmit={submit}>
        <div className="login__logo">🍕</div>
        <div className="login__title">Pizza Cubick</div>
        <div className="login__sub">Admin panelga kirish</div>

        {error && <div className="error">{error}</div>}

        <div className="field">
          <label>Parol</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolni kiriting"
            autoFocus
          />
        </div>

        <button className="btn" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Tekshirilmoqda..." : "Kirish"}
        </button>

        <div className="login__hint">
          Parol <code>backend/.env</code> faylidagi <code>ADMIN_PASSWORD</code>{" "}
          da saqlanadi
        </div>
      </form>
    </div>
  );
}

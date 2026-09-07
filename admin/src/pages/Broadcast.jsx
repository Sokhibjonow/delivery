import { useEffect, useState } from "react";
import { api } from "../api.js";

const TEMPLATES = [
  {
    label: "🔥 Chegirma",
    text: "🔥 Bugun barcha pizzalarga 20% chegirma!\n\nPromokod: PIZZA10\nBuyurtma berish uchun botdagi tugmani bosing 🍕",
  },
  {
    label: "🆕 Yangi mahsulot",
    text: "🆕 Menyumizda yangilik!\n\nYangi pizzamizni birinchilardan bo'lib tatib ko'ring 🍕",
  },
  {
    label: "🎁 Bepul yetkazish",
    text: "🎁 Bugun 150 000 so'mdan yuqori barcha buyurtmalarga yetkazib berish BEPUL!\n\nShoshiling 🛵",
  },
];

export default function Broadcast() {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState(0);

  useEffect(() => {
    api
      .getCustomers()
      .then((rows) => setCustomers(rows.filter((r) => /^\d+$/.test(r.telegramId)).length))
      .catch(() => {});
  }, []);

  const send = async () => {
    if (!text.trim()) return;

    const ok = confirm(
      `Bu xabar ${customers} ta mijozga bot orqali yuboriladi.\n\nDavom etilsinmi?`
    );
    if (!ok) return;

    setSending(true);
    setError("");
    setResult(null);

    try {
      const r = await api.broadcast(text);
      setResult(r);
      setText("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Reklama yuborish</h1>
          <div className="page-sub">
            Barcha mijozlarga bot orqali bitta xabar yuboring
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="success">
          ✓ Yuborildi: {result.sent} ta mijozga
          {result.failed > 0 && ` · Yetib bormadi: ${result.failed} ta`}
        </div>
      )}

      <div className="settings-grid">
        <div className="panel panel--pad">
          <div className="panel__title">✍️ Xabar matni</div>

          <div className="field">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Xabar matnini yozing..."
              style={{ minHeight: 180 }}
            />
          </div>

          <div className="broadcast-foot">
            <span className="cell-muted">
              {text.length} belgi · {customers} ta mijozga boradi
            </span>
            <button
              className="btn"
              onClick={send}
              disabled={sending || !text.trim()}
            >
              {sending ? "Yuborilmoqda..." : "📤 Yuborish"}
            </button>
          </div>

          <div className="hint">
            Xabar botdan oddiy matn sifatida yuboriladi. Yuborish bir necha
            soniya davom etishi mumkin.
          </div>
        </div>

        <div className="panel panel--pad">
          <div className="panel__title">📋 Tayyor shablonlar</div>

          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              className="template"
              onClick={() => setText(t.text)}
            >
              <div className="template__label">{t.label}</div>
              <div className="template__text">{t.text}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { api, formatPrice } from "../api.js";

export default function Settings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .getSettings()
      .then(setForm)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const save = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await api.saveSettings(form);
      setForm(res);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
      </div>
    );
  }

  if (!form) return <div className="error">{error}</div>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Sozlamalar</h1>
          <div className="page-sub">
            Ish vaqti, yetkazib berish narxi va minimal buyurtma
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saved && <span className="saved-badge">✓ Saqlandi</span>}
          <button className="btn" onClick={save} disabled={saving}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="settings-grid">
        <div className="panel panel--pad">
          <div className="panel__title">🕒 Ish vaqti</div>

          <div className="status-line">
            Hozirgi holat:{" "}
            <span className={form.isOpenNow ? "on" : "off"}>
              {form.isOpenNow ? "OCHIQ" : "YOPIQ"}
            </span>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Ochilish vaqti</label>
              <input type="time" value={form.workFrom} onChange={set("workFrom")} />
            </div>

            <div className="field">
              <label>Yopilish vaqti</label>
              <input type="time" value={form.workTo} onChange={set("workTo")} />
            </div>
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.alwaysOpen}
              onChange={set("alwaysOpen")}
            />
            <span>24/7 ishlash (ish vaqtini hisobga olmaslik)</span>
          </label>

          <div className="hint">
            Yopiq paytda mijozlar buyurtma bera olmaydi va ilovada ogohlantirish
            ko'rinadi.
          </div>
        </div>

        <div className="panel panel--pad">
          <div className="panel__title">🛵 Yetkazib berish</div>

          <div className="field">
            <label>Yetkazib berish narxi (so'm)</label>
            <input
              type="number"
              value={form.deliveryFee}
              onChange={set("deliveryFee")}
            />
          </div>

          <div className="field">
            <label>Qaysi summadan yuqorida bepul (so'm)</label>
            <input
              type="number"
              value={form.freeDeliveryFrom}
              onChange={set("freeDeliveryFrom")}
            />
          </div>

          <div className="field">
            <label>Minimal buyurtma summasi (so'm)</label>
            <input
              type="number"
              value={form.minOrderTotal}
              onChange={set("minOrderTotal")}
            />
          </div>

          <div className="hint">
            Hozir: {formatPrice(form.freeDeliveryFrom)} so'mdan yuqori
            buyurtmalarga yetkazish bepul, undan pasti{" "}
            {formatPrice(form.deliveryFee)} so'm.
          </div>
        </div>
      </div>
    </>
  );
}

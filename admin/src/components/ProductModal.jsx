import { useState } from "react";
import { formatPrice } from "../api.js";

const EMPTY = {
  name: "",
  description: "",
  imageUrl: "",
  oldPrice: "",
  newPrice: "",
  category: "Pizza",
  sizes: null,
};

const DEFAULT_SIZES = [
  { label: "25 sm", delta: 0 },
  { label: "30 sm", delta: 15000 },
  { label: "35 sm", delta: 28000 },
];

export default function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    ...EMPTY,
    ...product,
    oldPrice: product.oldPrice ?? "",
    newPrice: product.newPrice ?? "",
  });

  const [sizes, setSizes] = useState(
    Array.isArray(product.sizes) ? product.sizes : []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setSize = (i, field, value) =>
    setSizes((s) =>
      s.map((row, idx) =>
        idx === i
          ? { ...row, [field]: field === "delta" ? Number(value) || 0 : value }
          : row
      )
    );

  const submit = async () => {
    if (!form.name.trim() || !form.newPrice) {
      setError("Nom va yangi narx to'ldirilishi shart");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        oldPrice: form.oldPrice === "" ? null : Number(form.oldPrice),
        newPrice: Number(form.newPrice),
        sizes: sizes.length > 0 ? sizes : null,
      });
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  const base = Number(form.newPrice) || 0;

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">
          {product.id ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
        </h2>

        {error && <div className="error">{error}</div>}

        {form.imageUrl ? (
          <img className="preview" src={form.imageUrl} alt="" />
        ) : null}

        <div className="field">
          <label>Rasm URL manzili</label>
          <input
            value={form.imageUrl}
            onChange={set("imageUrl")}
            placeholder="https://..."
          />
        </div>

        <div className="field">
          <label>Nomi</label>
          <input value={form.name} onChange={set("name")} placeholder="Margarita" />
        </div>

        <div className="field">
          <label>Ta'rifi</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Pizza tarkibi va tavsifi"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Eski narx (ixtiyoriy)</label>
            <input
              type="number"
              value={form.oldPrice}
              onChange={set("oldPrice")}
              placeholder="65000"
            />
          </div>

          <div className="field">
            <label>Asosiy narx</label>
            <input
              type="number"
              value={form.newPrice}
              onChange={set("newPrice")}
              placeholder="49000"
            />
          </div>
        </div>

        <div className="field">
          <label>Kategoriya</label>
          <input
            value={form.category}
            onChange={set("category")}
            placeholder="Pizza"
          />
        </div>

        {/* ---------- O'lchamlar ---------- */}
        <div className="field">
          <label>O'lchamlar</label>

          {sizes.length === 0 ? (
            <div className="sizes-empty">
              <span>Bu mahsulotda o'lcham tanlash yo'q</span>
              <button
                className="btn btn--sm btn--ghost"
                onClick={() => setSizes(DEFAULT_SIZES)}
              >
                + O'lcham qo'shish
              </button>
            </div>
          ) : (
            <>
              <div className="sizes">
                {sizes.map((s, i) => (
                  <div className="size-row" key={i}>
                    <input
                      value={s.label}
                      onChange={(e) => setSize(i, "label", e.target.value)}
                      placeholder="30 sm"
                    />
                    <input
                      type="number"
                      value={s.delta}
                      onChange={(e) => setSize(i, "delta", e.target.value)}
                      placeholder="0"
                    />
                    <span className="size-row__total">
                      = {formatPrice(base + (Number(s.delta) || 0))}
                    </span>
                    <button
                      className="size-row__del"
                      onClick={() =>
                        setSizes((arr) => arr.filter((_, idx) => idx !== i))
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="sizes-actions">
                <button
                  className="btn btn--sm btn--ghost"
                  onClick={() =>
                    setSizes((arr) => [...arr, { label: "", delta: 0 }])
                  }
                >
                  + Qator qo'shish
                </button>
                <button
                  className="btn btn--sm btn--danger"
                  onClick={() => setSizes([])}
                >
                  O'lchamlarni olib tashlash
                </button>
              </div>

              <div className="hint">
                Ikkinchi maydon — asosiy narxga qo'shiladigan summa (qo'shimcha
                narx).
              </div>
            </>
          )}
        </div>

        <div className="modal__foot">
          <button className="btn btn--ghost" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="btn" onClick={submit} disabled={saving}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}

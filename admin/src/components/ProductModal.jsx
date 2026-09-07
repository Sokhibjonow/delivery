import { useState } from "react";

const EMPTY = {
  name: "",
  description: "",
  imageUrl: "",
  oldPrice: "",
  newPrice: "",
  category: "Pizza",
};

export default function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    ...EMPTY,
    ...product,
    oldPrice: product.oldPrice ?? "",
    newPrice: product.newPrice ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

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
      });
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

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
          <input
            value={form.name}
            onChange={set("name")}
            placeholder="Margarita"
          />
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
            <label>Yangi narx</label>
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

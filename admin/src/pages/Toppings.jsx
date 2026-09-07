import { useCallback, useEffect, useState } from "react";
import { api, formatPrice } from "../api.js";

const EMPTY = { name: "", price: "", category: "Pizza", active: true };

export default function Toppings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await api.getToppings());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (t) => {
    if (!confirm(`"${t.name}" o'chirilsinmi?`)) return;
    await api.deleteTopping(t.id);
    load();
  };

  const toggleActive = async (t) => {
    await api.updateTopping(t.id, { ...t, active: !t.active });
    load();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Qo'shimchalar</h1>
          <div className="page-sub">
            Mijoz pizzaga qo'sha oladigan ingredientlar
          </div>
        </div>

        <button className="btn" onClick={() => setEditing({ ...EMPTY })}>
          + Yangi qo'shimcha
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="panel">
        {loading ? (
          <div className="loader">
            <div className="spinner" />
          </div>
        ) : rows.length === 0 ? (
          <div className="empty">
            <div className="empty__emoji">🧀</div>
            <div className="empty__title">Qo'shimchalar yo'q</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nomi</th>
                  <th>Narxi</th>
                  <th>Kategoriya</th>
                  <th>Holati</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td className="cell-strong">{t.name}</td>
                    <td className="cell-price">+{formatPrice(t.price)} so'm</td>
                    <td>
                      <span className="tag">{t.category}</span>
                    </td>
                    <td>
                      <button
                        className={
                          "badge" + (t.active ? " badge--done" : " badge--cancel")
                        }
                        onClick={() => toggleActive(t)}
                      >
                        {t.active ? "Faol" : "Yashirilgan"}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn--sm btn--ghost"
                          onClick={() => setEditing(t)}
                        >
                          Tahrirlash
                        </button>
                        <button
                          className="btn btn--sm btn--danger"
                          onClick={() => remove(t)}
                        >
                          O'chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <ToppingModal
          topping={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}

function ToppingModal({ topping, onClose, onSaved }) {
  const [form, setForm] = useState({
    ...EMPTY,
    ...topping,
    price: topping.price ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const submit = async () => {
    if (!form.name.trim() || !form.price) {
      setError("Nom va narx to'ldirilishi shart");
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        active: form.active,
      };

      if (form.id) await api.updateTopping(form.id, data);
      else await api.createTopping(data);

      onSaved();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">
          {form.id ? "Qo'shimchani tahrirlash" : "Yangi qo'shimcha"}
        </h2>

        {error && <div className="error">{error}</div>}

        <div className="field">
          <label>Nomi</label>
          <input
            value={form.name}
            onChange={set("name")}
            placeholder="Qo'shimcha mozzarella"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Narxi (so'm)</label>
            <input
              type="number"
              value={form.price}
              onChange={set("price")}
              placeholder="8000"
            />
          </div>

          <div className="field">
            <label>Kategoriya</label>
            <input
              value={form.category}
              onChange={set("category")}
              placeholder="Pizza"
            />
          </div>
        </div>

        {form.id && (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.active}
              onChange={set("active")}
            />
            <span>Faol (mijozlarga ko'rinadi)</span>
          </label>
        )}

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

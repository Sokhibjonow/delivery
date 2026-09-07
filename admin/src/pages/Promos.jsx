import { useCallback, useEffect, useState } from "react";
import { api, formatPrice } from "../api.js";

const EMPTY = { code: "", type: "percent", value: "", minTotal: "", active: true };

export default function Promos() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await api.getPromos());
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

  const remove = async (p) => {
    if (!confirm(`"${p.code}" promokodi o'chirilsinmi?`)) return;
    await api.deletePromo(p.id);
    load();
  };

  const toggleActive = async (p) => {
    await api.updatePromo(p.id, { ...p, active: !p.active });
    load();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Promokodlar</h1>
          <div className="page-sub">
            Chegirma kodlarini yarating va boshqaring
          </div>
        </div>

        <button className="btn" onClick={() => setEditing({ ...EMPTY })}>
          + Yangi promokod
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
            <div className="empty__emoji">🎟️</div>
            <div className="empty__title">Promokodlar yo'q</div>
            <div>"Yangi promokod" tugmasi orqali qo'shing</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Turi</th>
                  <th>Qiymati</th>
                  <th>Minimal summa</th>
                  <th>Ishlatilgan</th>
                  <th>Holati</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-strong">
                      <code className="code">{p.code}</code>
                    </td>
                    <td>
                      <span className="tag">
                        {p.type === "percent" ? "Foiz" : "Summa"}
                      </span>
                    </td>
                    <td className="cell-price">
                      {p.type === "percent"
                        ? `${p.value}%`
                        : `${formatPrice(p.value)} so'm`}
                    </td>
                    <td>
                      {p.minTotal > 0 ? `${formatPrice(p.minTotal)} so'm` : "—"}
                    </td>
                    <td className="cell-strong">{p.usedCount} marta</td>
                    <td>
                      <button
                        className={"badge" + (p.active ? " badge--done" : " badge--cancel")}
                        onClick={() => toggleActive(p)}
                      >
                        {p.active ? "Faol" : "O'chirilgan"}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn--sm btn--ghost"
                          onClick={() => setEditing(p)}
                        >
                          Tahrirlash
                        </button>
                        <button
                          className="btn btn--sm btn--danger"
                          onClick={() => remove(p)}
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
        <PromoModal
          promo={editing}
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

function PromoModal({ promo, onClose, onSaved }) {
  const [form, setForm] = useState({
    ...EMPTY,
    ...promo,
    value: promo.value ?? "",
    minTotal: promo.minTotal ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const submit = async () => {
    if (!form.code.trim() || !form.value) {
      setError("Kod va qiymat to'ldirilishi shart");
      return;
    }

    setSaving(true);
    try {
      const data = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minTotal: Number(form.minTotal) || 0,
        active: form.active,
      };

      if (form.id) await api.updatePromo(form.id, data);
      else await api.createPromo(data);

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
          {form.id ? "Promokodni tahrirlash" : "Yangi promokod"}
        </h2>

        {error && <div className="error">{error}</div>}

        <div className="field">
          <label>Kod</label>
          <input
            value={form.code}
            onChange={(e) =>
              setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
            }
            placeholder="PIZZA10"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Turi</label>
            <select value={form.type} onChange={set("type")}>
              <option value="percent">Foiz (%)</option>
              <option value="amount">Summa (so'm)</option>
            </select>
          </div>

          <div className="field">
            <label>{form.type === "percent" ? "Necha foiz" : "Necha so'm"}</label>
            <input
              type="number"
              value={form.value}
              onChange={set("value")}
              placeholder={form.type === "percent" ? "10" : "20000"}
            />
          </div>
        </div>

        <div className="field">
          <label>Minimal buyurtma summasi (0 = cheklovsiz)</label>
          <input
            type="number"
            value={form.minTotal}
            onChange={set("minTotal")}
            placeholder="100000"
          />
        </div>

        {form.id && (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.active}
              onChange={set("active")}
            />
            <span>Faol</span>
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

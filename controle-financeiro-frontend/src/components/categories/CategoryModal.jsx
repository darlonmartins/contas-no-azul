import React, { useState, useEffect } from "react";
import { X, PlusCircle, Trash2 } from "lucide-react";
import api from "../../services/api";

const CategoryModal = ({ onClose, onSave, category }) => {
  const [name, setName]                 = useState("");
  const [icon, setIcon]                 = useState("");
  const [subcategories, setSubcategories] = useState([""]);
  const [iconOptions, setIconOptions]   = useState([]);
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setIcon(category.icon || "");
      setSubcategories(category.children?.map(c => c.name) || [""]);
    } else {
      setName(""); setIcon(""); setSubcategories([""]);
    }
  }, [category]);

  useEffect(() => {
    api.get("/categories/icons")
      .then(r => setIconOptions(r.data))
      .catch(() => {});
  }, []);

  const handleSubChange = (i, v) => {
    const updated = [...subcategories];
    updated[i] = v;
    setSubcategories(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, icon, subcategories: subcategories.filter(s => s.trim() !== "") };
      if (category) {
        await api.put(`/categories/${category.id}`, payload);
      } else {
        await api.post("/categories", payload);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .catm-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.55); backdrop-filter: blur(3px); font-family: 'DM Sans', sans-serif; }
        .catm-modal { background: #fff; border-radius: 18px; width: 95%; max-width: 460px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .catm-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
        .catm-title { font-size: 17px; font-weight: 600; color: #0f172a; letter-spacing: -0.3px; }
        .catm-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: #f1f5f9; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: background 0.15s; }
        .catm-close:hover { background: #e2e8f0; }
        .catm-accent { height: 3px; border-radius: 999px; margin: 14px 24px 0; background: #8b5cf6; }
        .catm-body { padding: 20px 24px 24px; }
        .catm-field { margin-bottom: 16px; }
        .catm-field label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.2px; }
        .catm-input { width: 100%; padding: 10px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .catm-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
        .catm-input::placeholder { color: #94a3b8; }
        .catm-icon-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; }
        .catm-icon-btn { width: 100%; aspect-ratio: 1; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: all 0.1s; }
        .catm-icon-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .catm-icon-btn.selected { background: #f5f3ff; border-color: #8b5cf6; }
        .catm-sub-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
        .catm-sub-remove { width: 30px; height: 30px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: "#ef4444"; transition: background 0.15s; flex-shrink: 0; }
        .catm-sub-remove:hover { background: #fef2f2; }
        .catm-add-sub { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: #8b5cf6; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; padding: 0; transition: color 0.15s; }
        .catm-add-sub:hover { color: #7c3aed; }
        .catm-divider { height: 1px; background: #f1f5f9; margin: 4px 0 16px; }
        .catm-btn-primary { width: 100%; padding: 11px; border-radius: 9px; border: none; background: #0f172a; color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .catm-btn-primary:hover { background: #1e293b; }
        .catm-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="catm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="catm-modal">
          <div className="catm-header">
            <span className="catm-title">{category ? "Editar categoria" : "Nova categoria"}</span>
            <button className="catm-close" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="catm-accent" />

          <div className="catm-body">
            <form onSubmit={handleSubmit}>
              {/* Nome */}
              <div className="catm-field">
                <label>Nome</label>
                <input className="catm-input" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Alimentação, Moradia..." />
              </div>

              {/* Ícone */}
              {iconOptions.length > 0 && (
                <div className="catm-field">
                  <label>Ícone {icon && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— selecionado: {icon}</span>}</label>
                  <div className="catm-icon-grid">
                    {iconOptions.map(ic => (
                      <button
                        key={ic}
                        type="button"
                        className={`catm-icon-btn${icon === ic ? " selected" : ""}`}
                        onClick={() => setIcon(icon === ic ? "" : ic)}
                        title={ic}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="catm-divider" />

              {/* Subcategorias */}
              <div className="catm-field">
                <label>Subcategorias</label>
                {subcategories.map((sub, i) => (
                  <div key={i} className="catm-sub-row">
                    <input
                      className="catm-input"
                      type="text"
                      value={sub}
                      onChange={e => handleSubChange(i, e.target.value)}
                      placeholder={`Subcategoria ${i + 1}`}
                    />
                    <button
                      type="button"
                      className="catm-sub-remove"
                      onClick={() => setSubcategories(prev => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                ))}
                <button type="button" className="catm-add-sub" onClick={() => setSubcategories(p => [...p, ""])}>
                  <PlusCircle size={14} /> Adicionar subcategoria
                </button>
              </div>

              <div className="catm-divider" />

              <button type="submit" className="catm-btn-primary" disabled={loading}>
                {loading ? "Salvando..." : category ? "Salvar alterações" : "Criar categoria"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryModal;

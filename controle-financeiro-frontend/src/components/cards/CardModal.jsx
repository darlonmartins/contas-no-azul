import React, { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";

const brands = ["Visa", "Mastercard", "Elo", "Hipercard", "American Express", "Outro"];

const CardModal = ({ isOpen, onClose, onSubmit, editingCard }) => {
  const [form, setForm] = useState({ name: "", brand: "", limit: "", dueDate: "", fechamento: "" });
  const [success, setSuccess]     = useState(false);
  const [wasEditing, setWasEditing] = useState(false);

  useEffect(() => {
    if (editingCard) {
      setForm({
        name:       editingCard.name,
        brand:      editingCard.brand,
        limit:      editingCard.limit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        dueDate:    editingCard.dueDate.toString(),
        fechamento: editingCard.fechamento?.toString() || "",
      });
    } else if (isOpen) {
      setForm({ name: "", brand: "", limit: "", dueDate: "", fechamento: "" });
    }
  }, [editingCard, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "limit") {
      const numeric = value.replace(/\D/g, "");
      const formatted = (Number(numeric) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      setForm(p => ({ ...p, limit: formatted }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const limit = parseFloat(form.limit.replace(/[^\d,-]/g, "").replace(",", "."));
    setWasEditing(!!editingCard);
    onSubmit({ ...form, limit });
    setSuccess(true);
  };

  const resetForm = () => {
    setForm({ name: "", brand: "", limit: "", dueDate: "", fechamento: "" });
    setSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .cm-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.55); backdrop-filter: blur(3px); font-family: 'DM Sans', sans-serif; }
        .cm-modal { background: #fff; border-radius: 18px; width: 95%; max-width: 440px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .cm-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
        .cm-title { font-size: 17px; font-weight: 600; color: #0f172a; letter-spacing: -0.3px; }
        .cm-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: #f1f5f9; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: background 0.15s; }
        .cm-close:hover { background: #e2e8f0; }
        .cm-accent { height: 3px; border-radius: 999px; margin: 14px 24px 0; background: #7c3aed; }
        .cm-body { padding: 20px 24px 24px; }
        .cm-field { margin-bottom: 14px; }
        .cm-field label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.2px; }
        .cm-input, .cm-select { width: 100%; padding: 10px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .cm-input:focus, .cm-select:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .cm-input::placeholder { color: #94a3b8; }
        .cm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cm-divider { height: 1px; background: #f1f5f9; margin: 4px 0 14px; }
        .cm-hint { font-size: 11px; color: #94a3b8; margin-top: 4px; }
        .cm-btn-primary { width: 100%; padding: 11px; border-radius: 9px; border: none; background: #0f172a; color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .cm-btn-primary:hover { background: #1e293b; }
        .cm-btn-outline { width: 100%; padding: 11px; border-radius: 9px; border: 1.5px solid #e2e8f0; background: #fff; color: #374151; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .cm-btn-outline:hover { background: #f8fafc; }
        .cm-success { display: flex; flex-direction: column; align-items: center; padding: 32px 24px; text-align: center; gap: 10px; }
        .cm-success-icon { width: 56px; height: 56px; border-radius: 16px; background: #f0fdf4; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
      `}</style>

      <div className="cm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="cm-modal">
          <div className="cm-header">
            <span className="cm-title">{editingCard ? "Editar cartão" : "Novo cartão"}</span>
            <button className="cm-close" onClick={() => { setSuccess(false); onClose(); }}><X size={16} /></button>
          </div>
          <div className="cm-accent" />

          <div className="cm-body">
            {success ? (
              <div className="cm-success">
                <div className="cm-success-icon"><CheckCircle2 size={28} color="#16a34a" /></div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                  {wasEditing ? "Cartão atualizado!" : "Cartão cadastrado!"}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px" }}>
                  {wasEditing ? "As informações foram salvas." : "Já pode registrar seus gastos."}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                  {!wasEditing && (
                    <button className="cm-btn-primary" onClick={resetForm}>Adicionar outro cartão</button>
                  )}
                  <button className="cm-btn-outline" onClick={() => { setSuccess(false); onClose(); }}>
                    {wasEditing ? "Fechar" : "Agora não"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="cm-field">
                  <label>Nome do cartão</label>
                  <input className="cm-input" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Ex: Nubank, Itaú Gold..." />
                </div>

                <div className="cm-row">
                  <div className="cm-field">
                    <label>Bandeira</label>
                    <select className="cm-select" name="brand" value={form.brand} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      {brands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="cm-field">
                    <label>Limite (R$)</label>
                    <input className="cm-input" type="text" name="limit" value={form.limit} onChange={handleChange} inputMode="numeric" required placeholder="R$ 0,00" />
                  </div>
                </div>

                <div className="cm-divider" />

                <div className="cm-row">
                  <div className="cm-field">
                    <label>Dia de vencimento</label>
                    <input className="cm-input" type="number" name="dueDate" value={form.dueDate} onChange={handleChange} min="1" max="31" required placeholder="Ex: 15" />
                    <p className="cm-hint">Dia em que a fatura vence</p>
                  </div>
                  <div className="cm-field">
                    <label>Dia de fechamento</label>
                    <input className="cm-input" type="number" name="fechamento" value={form.fechamento} onChange={handleChange} min="1" max="31" required placeholder="Ex: 8" />
                    <p className="cm-hint">Melhor dia de compra</p>
                  </div>
                </div>

                <div className="cm-divider" />

                <button type="submit" className="cm-btn-primary">
                  {editingCard ? "Salvar alterações" : "Adicionar cartão"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CardModal;

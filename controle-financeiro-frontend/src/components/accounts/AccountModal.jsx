import React, { useEffect, useState } from "react";
import { CheckCircle2, X, ChevronDown } from "lucide-react";

const bankOptions = [
  { name: "Carteira",        value: "carteira" },
  { name: "Banco do Brasil", value: "banco-do-brasil" },
  { name: "Caixa Econômica", value: "caixa" },
  { name: "Bradesco",        value: "bradesco" },
  { name: "Itaú",            value: "itau" },
  { name: "Santander",       value: "santander" },
  { name: "Nubank",          value: "nubank" },
  { name: "Inter",           value: "inter" },
  { name: "PicPay",          value: "picpay" },
  { name: "C6 Bank",         value: "c6-bank" },
  { name: "Outro",           value: "outro" },
];

const AccountModal = ({ isOpen, onClose, onSubmit, editingAccount }) => {
  const [form, setForm] = useState({ name: "", bank: "", type: "corrente", isMain: false, saldoAtual: "" });
  const [success, setSuccess]     = useState(false);
  const [showBanks, setShowBanks] = useState(false);
  const [wasEditing, setWasEditing] = useState(false);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (success && !editingAccount) return;
    if (editingAccount) {
      setForm({
        name:       editingAccount.name || "",
        bank:       editingAccount.bank || "",
        type:       editingAccount.type || "corrente",
        isMain:     editingAccount.isMain || false,
        saldoAtual: editingAccount.saldoAtual?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || "",
      });
      setWasEditing(true);
    } else {
      resetForm();
    }
  }, [editingAccount, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "saldoAtual") {
      const raw = value.replace(/\D/g, "");
      const formatted = (Number(raw) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      setForm(p => ({ ...p, saldoAtual: formatted }));
    } else {
      setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bank || !form.type) { alert("Preencha todos os campos."); return; }
    setLoading(true);
    const saldo = form.saldoAtual
  ? parseFloat(form.saldoAtual.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")) || 0
  : 0;
    try {
      await onSubmit({ ...form, saldoAtual: saldo });
      setSuccess(true);
    } catch { alert("Erro ao salvar conta."); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: "", bank: "", type: "corrente", isMain: false, saldoAtual: "" });
    setSuccess(false); setWasEditing(false);
  };

  if (!isOpen) return null;

  const selectedBank = bankOptions.find(b => b.value === form.bank);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .am-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.55); backdrop-filter: blur(3px); font-family: 'DM Sans', sans-serif; }
        .am-modal { background: #fff; border-radius: 18px; width: 95%; max-width: 440px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .am-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
        .am-title { font-size: 17px; font-weight: 600; color: #0f172a; letter-spacing: -0.3px; }
        .am-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: #f1f5f9; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: background 0.15s; }
        .am-close:hover { background: #e2e8f0; }
        .am-body { padding: 20px 24px 24px; }
        .am-field { margin-bottom: 14px; }
        .am-field label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.2px; }
        .am-input, .am-select { width: 100%; padding: 10px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .am-input:focus, .am-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .am-input::placeholder { color: #94a3b8; }
        .am-bank-trigger { width: 100%; padding: 10px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f172a; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .am-bank-trigger:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); outline: none; }
        .am-bank-dropdown { position: absolute; left: 0; right: 0; top: calc(100% + 4px); background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px; max-height: 220px; overflow-y: auto; z-index: 10; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .am-bank-option { display: flex; align-items: center; gap: 10px; padding: 10px 13px; cursor: pointer; transition: background 0.1s; font-size: 14px; }
        .am-bank-option:hover { background: #f8fafc; }
        .am-check-wrap { display: flex; align-items: center; gap: 8px; padding: 8px 0; cursor: pointer; font-size: 13px; color: #374151; font-weight: 500; }
        .am-check-wrap input[type=checkbox] { width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer; }
        .am-divider { height: 1px; background: #f1f5f9; margin: 4px 0 14px; }
        .am-btn-primary { width: 100%; padding: 11px; border-radius: 9px; border: none; background: #0f172a; color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .am-btn-primary:hover { background: #1e293b; }
        .am-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .am-btn-outline { width: 100%; padding: 11px; border-radius: 9px; border: 1.5px solid #e2e8f0; background: #fff; color: #374151; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .am-btn-outline:hover { background: #f8fafc; }
        .am-success { display: flex; flex-direction: column; align-items: center; padding: 32px 24px; text-align: center; gap: 10px; }
        .am-success-icon { width: 56px; height: 56px; border-radius: 16px; background: #f0fdf4; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
      `}</style>

      <div className="am-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="am-modal">
          <div className="am-header">
            <span className="am-title">{editingAccount ? "Editar conta" : "Nova conta"}</span>
            <button className="am-close" onClick={() => { resetForm(); onClose(); }}><X size={16} /></button>
          </div>
          <div className="am-body">
            {success ? (
              <div className="am-success">
                <div className="am-success-icon"><CheckCircle2 size={28} color="#16a34a" /></div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                  {wasEditing ? "Conta atualizada!" : "Conta cadastrada!"}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px" }}>
                  {wasEditing ? "As informações foram salvas." : "Sua nova conta já está disponível."}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                  {!wasEditing && (
                    <button className="am-btn-primary" onClick={resetForm}>Adicionar outra conta</button>
                  )}
                  <button className="am-btn-outline" onClick={() => { resetForm(); onClose(); }}>
                    {wasEditing ? "Fechar" : "Agora não"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="am-field">
                  <label>Nome da conta</label>
                  <input className="am-input" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Ex: Conta Corrente, Carteira..." />
                </div>

                <div className="am-field" style={{ position: "relative" }}>
                  <label>Banco</label>
                  <button type="button" className="am-bank-trigger" onClick={() => setShowBanks(p => !p)}>
                    {selectedBank ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img src={`/banks/${selectedBank.value}.png`} alt={selectedBank.name} style={{ width: 20, height: 20, objectFit: "contain" }} />
                        <span>{selectedBank.name}</span>
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>Selecione um banco</span>
                    )}
                    <ChevronDown size={16} color="#94a3b8" style={{ transform: showBanks ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                  </button>
                  {showBanks && (
                    <div className="am-bank-dropdown">
                      {bankOptions.map(b => (
                        <div key={b.value} className="am-bank-option" onClick={() => { setForm(p => ({ ...p, bank: b.value })); setShowBanks(false); }}>
                          <img src={`/banks/${b.value}.png`} alt={b.name} style={{ width: 20, height: 20, objectFit: "contain" }} />
                          {b.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="am-field">
                  <label>Tipo de conta</label>
                  <select className="am-select" name="type" value={form.type} onChange={handleChange} required>
                    <option value="principal">Carteira</option>
                    <option value="corrente">Conta Corrente</option>
                    <option value="poupança">Poupança</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div className="am-field">
                  <label>Saldo atual (R$)</label>
                  <input className="am-input" type="text" name="saldoAtual" value={form.saldoAtual} onChange={handleChange} inputMode="numeric" placeholder="R$ 0,00" />
                </div>

                <label className="am-check-wrap">
                  <input type="checkbox" name="isMain" checked={form.isMain} onChange={handleChange} />
                  Definir como conta principal
                </label>

                <div className="am-divider" />

                <button type="submit" className="am-btn-primary" disabled={loading}>
                  {loading ? "Salvando..." : editingAccount ? "Salvar alterações" : "Adicionar conta"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountModal;

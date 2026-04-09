import React, { useEffect, useState } from "react";
import api from "../services/api";
import AccountModal from "../components/accounts/AccountModal";
import { PlusCircle, Trash2, Pencil, Wallet, TrendingUp } from "lucide-react";

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const Accounts = () => {
  const [accounts, setAccounts]           = useState([]);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading]             = useState(true);

  const fetchAccounts = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await api.get("/accounts");
      setAccounts(res.data);
    } catch (err) {
      console.error("Erro ao carregar contas:", err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  const handleCreate = async (accountData) => {
    try {
      if (editingAccount) {
        await api.put(`/accounts/${editingAccount.id}`, accountData);
      } else {
        await api.post("/accounts", accountData);
      }
      setTimeout(() => fetchAccounts(), 300);
    } catch (err) {
      console.error("Erro ao salvar conta:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/accounts/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      fetchAccounts();
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
    }
  };

  useEffect(() => { fetchAccounts(true); }, []);

  const mainAccount   = accounts.find(a => a.isMain);
  const otherAccounts = accounts.filter(a => !a.isMain);
  const totalBalance  = accounts.reduce((s, a) => s + parseFloat(a.saldoAtual || 0), 0);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 64, gap: 12, color: "#94a3b8" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14 }}>Carregando contas...</p>
      </div>
    );
  }

  const AccountCard = ({ account }) => {
    const bankLogo = `/banks/${account.bank?.toLowerCase()}.png`;
    const isPositive = parseFloat(account.saldoAtual || 0) >= 0;

    return (
      <div style={{
        background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16,
        padding: "18px 20px", position: "relative",
        transition: "box-shadow 0.15s", cursor: "default",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"}
      >
        {/* Ações */}
        <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 4 }}>
          <button
            onClick={() => { setEditingAccount(account); setIsModalOpen(true); }}
            style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setConfirmDeleteId(account.id)}
            style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Logo + nome */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, paddingRight: 60 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img
              src={bankLogo}
              onError={e => { if (!e.target.dataset.fallback) { e.target.src = "/banks/outro.png"; e.target.dataset.fallback = true; }}}
              alt={account.bank}
              style={{ width: 32, height: 32, objectFit: "contain" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.2px" }}>{account.name}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{account.bank}</div>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {account.isMain && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: "#eff6ff", color: "#2563eb" }}>
              Conta principal
            </span>
          )}
          {account.type && (
            <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 999, background: "#f8fafc", color: "#64748b", border: "1px solid #f1f5f9" }}>
              {account.type}
            </span>
          )}
        </div>

        {/* Saldo */}
        <div style={{ fontSize: 22, fontWeight: 600, color: isPositive ? "#16a34a" : "#dc2626", letterSpacing: "-0.5px" }}>
          {fmt(account.saldoAtual)}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .acc-page { font-family: 'DM Sans', sans-serif; }
        .acc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .acc-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 9px; border: none;
          background: #0f172a; color: #fff; font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s;
        }
        .acc-btn-primary:hover { background: #1e293b; }
        .acc-section-title { font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px; }
      `}</style>

      <div className="acc-page">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.4px", margin: "0 0 4px" }}>Contas</h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Gerencie suas contas bancárias</p>
          </div>
          <button className="acc-btn-primary" onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}>
            <PlusCircle size={16} /> Nova conta
          </button>
        </div>

        {/* Card de saldo total */}
        {accounts.length > 0 && (
          <div style={{
            background: "#0f172a", borderRadius: 16, padding: "20px 24px",
            marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wallet size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500, marginBottom: 2 }}>SALDO TOTAL EM CONTAS</div>
                <div style={{ fontSize: 26, fontWeight: 600, color: "#fff", letterSpacing: "-0.5px" }}>{fmt(totalBalance)}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              <TrendingUp size={14} />
              {accounts.length} conta{accounts.length !== 1 ? "s" : ""} cadastrada{accounts.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Conta principal */}
        {mainAccount && (
          <div style={{ marginBottom: 28 }}>
            <p className="acc-section-title">Conta principal</p>
            <div className="acc-grid">
              <AccountCard account={mainAccount} />
            </div>
          </div>
        )}

        {/* Outras contas */}
        {otherAccounts.length > 0 && (
          <div>
            <p className="acc-section-title">Outras contas</p>
            <div className="acc-grid">
              {otherAccounts.map(acc => <AccountCard key={acc.id} account={acc} />)}
            </div>
          </div>
        )}

        {accounts.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Wallet size={26} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: "0 0 6px" }}>Nenhuma conta cadastrada</h3>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 20px" }}>Adicione sua primeira conta para começar.</p>
            <button className="acc-btn-primary" onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}>
              <PlusCircle size={15} /> Adicionar conta
            </button>
          </div>
        )}
      </div>

      {/* Modal de conta */}
      <AccountModal
        key={editingAccount ? editingAccount.id : "new"}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingAccount(null); }}
        onSubmit={handleCreate}
        editingAccount={editingAccount}
      />

      {/* Modal de confirmação de exclusão */}
      {confirmDeleteId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", margin: "0 0 8px" }}>Excluir conta</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>Deseja realmente excluir esta conta? Esta ação não pode ser desfeita.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{ flex: 1, padding: "10px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Accounts;

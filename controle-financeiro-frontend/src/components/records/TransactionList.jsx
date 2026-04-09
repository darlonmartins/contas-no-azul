import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, CreditCard, Repeat, ListX } from "lucide-react";
import TransactionModal from "./TransactionModal";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import { toast } from "react-toastify";

const typeConfig = {
  income:        { label: "Ganho",         color: "#16a34a", bg: "#f0fdf4", icon: ArrowUpCircle,   prefix: "+" },
  expense:       { label: "Despesa",        color: "#dc2626", bg: "#fef2f2", icon: ArrowDownCircle, prefix: "-" },
  despesa_cartao:{ label: "Cartão",         color: "#7c3aed", bg: "#f5f3ff", icon: CreditCard,      prefix: "-" },
  transfer:      { label: "Transferência",  color: "#2563eb", bg: "#eff6ff", icon: Repeat,          prefix: ""  },
  goal:          { label: "Objetivo",       color: "#0891b2", bg: "#ecfeff", icon: ArrowDownCircle, prefix: "-" },
};

const fmt = (amount, type) => {
  const cfg = typeConfig[type];
  const prefix = cfg?.prefix || '';
  return `${prefix} R$ ${parseFloat(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
};

const fmtDate = (dateStr) => {
  const [y, m, d] = dateStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("pt-BR");
};

const isMonthValid = (month) => new Date(`${month}-01`) <= new Date();

const TransactionList = ({ mode = "month", month, day, type, category, search, refresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTransactions(); }, [mode, month, day, type, category, search, refresh]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = "/transactions";
      if (mode === "month" && month && isMonthValid(month)) url = `/transactions/by-month/${month}`;
      else if (mode === "day" && day && /^\d{4}-\d{2}-\d{2}$/.test(day)) url = `/transactions/by-day/${day}`;

      const res = await api.get(url);
      let data = Array.isArray(res.data) ? res.data : (res.data?.data || []);

      if (type !== "all") data = data.filter(t => t.type === type);
      if (category !== "all") data = data.filter(t => t.Category?.name === category);
      if (search.trim()) data = data.filter(t => t.title.toLowerCase().includes(search.trim().toLowerCase()));

      setTransactions(data);
    } catch (err) {
      console.error("Erro ao buscar transações:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/transactions/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchTransactions();
      toast.success("Transação excluída com sucesso.");
    } catch {
      toast.error("Erro ao excluir transação.");
    }
  };

  return (
    <>
      <style>{`
        .tx-list-title { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0 0 14px; }
        .tx-item {
          background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
          padding: 14px 18px; display: flex; align-items: center; gap: 14px;
          margin-bottom: 8px; transition: box-shadow 0.15s;
        }
        .tx-item:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .tx-icon-wrap {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .tx-body { flex: 1; min-width: 0; }
        .tx-title { font-size: 14px; font-weight: 500; color: #0f172a; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tx-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .tx-date { font-size: 12px; color: #94a3b8; }
        .tx-badge {
          font-size: 11px; font-weight: 500; padding: 2px 7px; border-radius: 999px;
        }
        .tx-cat { font-size: 12px; color: #94a3b8; }
        .tx-amount { font-size: 15px; font-weight: 600; letter-spacing: -0.3px; white-space: nowrap; }
        .tx-actions { display: flex; gap: 4px; }
        .tx-action-btn {
          width: 32px; height: 32px; border-radius: 8px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; background: transparent; transition: background 0.15s;
        }
        .tx-action-btn:hover { background: #f1f5f9; }
        .tx-empty {
          text-align: center; padding: 48px 24px;
          background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
        }
        .tx-empty-icon { width: 48px; height: 48px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
        .tx-empty p { font-size: 14px; color: #94a3b8; margin: 0; }
        .tx-loading { display: flex; flex-direction: column; gap: 8px; }
        .tx-skeleton { height: 66px; border-radius: 12px; background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div>
        <h2 className="tx-list-title">
          Transações {transactions.length > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8' }}>({transactions.length})</span>}
        </h2>

        {loading ? (
          <div className="tx-loading">{[1,2,3].map(i => <div key={i} className="tx-skeleton" />)}</div>
        ) : transactions.length === 0 ? (
          <div className="tx-empty">
            <div className="tx-empty-icon"><ListX size={22} color="#94a3b8" /></div>
            <p>Nenhuma transação encontrada.</p>
          </div>
        ) : (
          <div>
            {transactions.map(tx => {
              const cfg = typeConfig[tx.type] || typeConfig.expense;
              const Icon = cfg.icon;
              return (
                <div key={tx.id} className="tx-item">
                  <div className="tx-icon-wrap" style={{ background: cfg.bg }}>
                    <Icon size={17} color={cfg.color} />
                  </div>
                  <div className="tx-body">
                    <div className="tx-title">{tx.title}</div>
                    <div className="tx-meta">
                      <span className="tx-date">{fmtDate(tx.date)}</span>
                      <span className="tx-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      {tx.isInstallment && tx.totalInstallments > 1 && (
                        <span className="tx-cat">{tx.installmentNumber}/{tx.totalInstallments}x</span>
                      )}
                      {tx.Category && (
                        <span className="tx-cat">
                          {tx.Category.parent ? `${tx.Category.parent.name} › ` : ''}{tx.Category.name}
                        </span>
                      )}
                      {tx.type === "despesa_cartao" && tx.card?.name && (
                        <span className="tx-cat">{tx.card.name}</span>
                      )}
                      {tx.type === "transfer" && tx.fromAccount && tx.toAccount && (
                        <span className="tx-cat">{tx.fromAccount.name} → {tx.toAccount.name}</span>
                      )}
                    </div>
                  </div>
                  <span className="tx-amount" style={{ color: cfg.color }}>
                    {fmt(tx.amount, tx.type)}
                  </span>
                  <div className="tx-actions">
                    <button className="tx-action-btn" onClick={() => setEditTransaction(tx)} title="Editar">
                      <Pencil size={15} color="#64748b" />
                    </button>
                    <button className="tx-action-btn" onClick={() => setDeleteTarget(tx)} title="Excluir">
                      <Trash2 size={15} color="#ef4444" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editTransaction && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 24, position: 'relative' }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 20px' }}>Editar Transação</h2>
            <button onClick={() => setEditTransaction(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8' }}>×</button>
            <TransactionModal
              transaction={editTransaction}
              onClose={() => setEditTransaction(null)}
              onSave={() => { fetchTransactions(); setEditTransaction(null); }}
              initialType={editTransaction.type}
            />
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default TransactionList;

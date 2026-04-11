import React, { useEffect, useState } from "react";
import api from "../services/api";
import CardModal from "../components/cards/CardModal";
import toast from "react-hot-toast";
import { CreditCard, PlusCircle, Pencil, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import visa       from "../assets/visa.png";
import mastercard from "../assets/mastercard.png";
import elo        from "../assets/elo.png";
import hipercard  from "../assets/hipercard.png";
import amex       from "../assets/amex.png";
import outro      from "../assets/outro.png";

const brandLogos = { visa, mastercard, elo, hipercard, amex, outro };

const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const getDaysUntilDue = (dueDay) => {
  const today = new Date();
  const due = new Date();
  due.setDate(dueDay);
  if (due < today) due.setMonth(due.getMonth() + 1);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
};

const Cards = () => {
  const [cards, setCards]                     = useState([]);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [editingCard, setEditingCard]         = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading]                 = useState(true);
  const navigate = useNavigate();

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cards/with-available-limit");
      setCards(res.data);
    } catch (err) {
      console.error("Erro ao carregar cartões:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (cardData) => {
    try {
      if (editingCard) {
        await api.put(`/cards/${editingCard.id}`, cardData);
        toast.success("Cartão atualizado!");
      } else {
        await api.post("/cards", cardData);
        toast.success("Cartão cadastrado!");
        setTimeout(fetchCards, 800);
      }
      setEditingCard(null);
    } catch (err) {
      console.error("Erro ao salvar cartão:", err);
      toast.error("Erro ao salvar cartão.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/cards/${confirmDeleteId}`);
      toast.success("Cartão excluído.");
      setConfirmDeleteId(null);
      fetchCards();
    } catch {
      toast.error("Erro ao excluir cartão.");
    }
  };

  useEffect(() => { fetchCards(); }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 64, gap: 12, color: "#94a3b8" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14 }}>Carregando cartões...</p>
      </div>
    );
  }

  const CardItem = ({ card }) => {
    const used        = card.limit - card.availableLimit;
    const usedPct     = Math.min(100, (used / card.limit) * 100);
    const daysUntilDue = getDaysUntilDue(card.dueDate);
    const brandKey    = card.brand?.toLowerCase();
    const logoSrc     = brandLogos[brandKey] || null;
    const isUrgent    = daysUntilDue <= 5;
    const barColor    = usedPct > 80 ? "#ef4444" : usedPct > 50 ? "#f59e0b" : "#22c55e";

    return (
      <div
        onClick={() => navigate(`/cards/${card.id}`)}
        style={{
          background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16,
          padding: "18px 20px", cursor: "pointer", position: "relative",
          transition: "box-shadow 0.15s, border-color 0.15s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
      >
        {/* Ações */}
        <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setEditingCard(card); setIsModalOpen(true); }}
            style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setConfirmDeleteId(card.id)}
            style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Nome + logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingRight: 60 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.2px" }}>{card.name}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{card.brand}</div>
          </div>
          {logoSrc && <img src={logoSrc} alt={card.brand} style={{ height: 22, objectFit: "contain" }} />}
        </div>

        {/* Limite disponível destaque */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginBottom: 2 }}>DISPONÍVEL</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.5px" }}>
            {fmt(card.availableLimit)}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>de {fmt(card.limit)} de limite</div>
        </div>

        {/* Barra de uso */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
            <div style={{ height: "100%", borderRadius: 99, width: `${usedPct}%`, background: barColor, transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
            <span>Usado: {fmt(used)}</span>
            <span>{usedPct.toFixed(0)}%</span>
          </div>
        </div>

        {/* Vencimento ou fatura paga */}
        {card.invoicePaid ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 12,
            color: "#16a34a", background: "#f0fdf4",
            padding: "6px 10px", borderRadius: 8,
            border: "1px solid #bbf7d0",
          }}>
            <CheckCircle2 size={13} />
            Fatura paga
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 12,
            color: isUrgent ? "#dc2626" : "#64748b",
            background: isUrgent ? "#fef2f2" : "#f8fafc",
            padding: "6px 10px", borderRadius: 8,
          }}>
            {isUrgent && <AlertTriangle size={13} />}
            Vence dia {card.dueDate}
            {isUrgent && <span style={{ fontWeight: 600 }}>· em {daysUntilDue} dia{daysUntilDue !== 1 ? "s" : ""}</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .cards-page { font-family: 'DM Sans', sans-serif; }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
        .cards-btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 9px; border: none; background: #0f172a; color: #fff; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .cards-btn-primary:hover { background: #1e293b; }
      `}</style>

      <div className="cards-page">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.4px", margin: "0 0 4px" }}>Cartões</h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Gerencie seus cartões de crédito</p>
          </div>
          <button className="cards-btn-primary" onClick={() => { setEditingCard(null); setIsModalOpen(true); }}>
            <PlusCircle size={16} /> Novo cartão
          </button>
        </div>

        {/* Lista ou vazio */}
        {cards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CreditCard size={26} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: "0 0 6px" }}>Nenhum cartão cadastrado</h3>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 20px" }}>Adicione seu primeiro cartão para controlar seus gastos.</p>
            <button className="cards-btn-primary" onClick={() => { setEditingCard(null); setIsModalOpen(true); }}>
              <PlusCircle size={15} /> Adicionar cartão
            </button>
          </div>
        ) : (
          <div className="cards-grid">
            {[...cards].sort((a, b) => a.dueDate - b.dueDate).map(card => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>

      <CardModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCard(null); }}
        onSubmit={handleCreate}
        editingCard={editingCard}
      />

      {/* Modal de confirmação de exclusão */}
      {confirmDeleteId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)", fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", margin: "0 0 8px" }}>Excluir cartão</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>Deseja realmente excluir este cartão? Esta ação não pode ser desfeita.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ flex: 1, padding: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                Cancelar
              </button>
              <button onClick={handleDelete} style={{ flex: 1, padding: 10, borderRadius: 9, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cards;

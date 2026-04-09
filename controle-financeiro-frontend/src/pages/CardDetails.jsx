import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import TransactionModal from "../components/records/TransactionModal";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";
import InvoiceModal from "../components/invoices/InvoiceModal";
import ConfirmInvoiceModal from "../components/invoices/ConfirmInvoiceModal";
import PayInvoiceModal from "../components/invoices/PayInvoiceModal";
import AttachInvoiceModal from "../components/invoices/AttachInvoiceModal";
import { toast } from "react-toastify";
import {
  PlusCircle, ArrowLeft, Calendar, CreditCard,
  Pencil, Trash2, CheckCircle2, Paperclip, ListX,
} from "lucide-react";

const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <p style={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#7c3aed" }}>R$ {fmt(payload[0].value)}</p>
    </div>
  );
};

const CardDetails = () => {
  const { cardId } = useParams();
  const [cards, setCards]                   = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(cardId || "");
  const [month, setMonth]                   = useState(() => new Date().toISOString().slice(0, 7));
  const [transactions, setTransactions]     = useState([]);
  const [chartData, setChartData]           = useState([]);
  const [dateRange, setDateRange]           = useState(null);
  const [futureInstallmentsTotal, setFutureInstallmentsTotal] = useState(0);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [totalSpentCard, setTotalSpentCard] = useState(0);
  const [invoice, setInvoice]               = useState(null);
  const [invoiceInfo, setInvoiceInfo]       = useState(null);
  const [isUnmarkModalOpen, setIsUnmarkModalOpen] = useState(false);
  const [selectedCard, setSelectedCard]     = useState({});
  const [totalFuture, setTotalFuture]       = useState(0);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isDeleting, setIsDeleting]         = useState(false);
  const [isAttachOpen, setIsAttachOpen]     = useState(false);

  useEffect(() => { fetchCards(); }, []);

  useEffect(() => {
    if (selectedCardId && month) {
      fetchTransactions();
      fetchFutureChart();
      fetchFutureInstallments();
      checkOrCreateInvoice();
      fetchInvoiceInfo();
    }
  }, [selectedCardId, month]);

  useEffect(() => {
    if (selectedCardId) fetchFutureInstallments();
  }, [selectedCardId]);

  useEffect(() => {
    if (!selectedCard?.id && cards.length > 0) {
      const updated = cards.find(c => String(c.id) === String(selectedCardId));
      if (updated) setSelectedCard(updated);
    }
  }, [cards, selectedCardId, selectedCard?.id]);

  const fetchCards = async () => {
    try {
      const res = await api.get("/cards/with-available-limit", {
        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
        params: { _: Date.now() },
      });
      setCards(res.data);
      return res.data;
    } catch (err) { console.error("Erro ao carregar cartões:", err); return []; }
  };

  const loadSelectedCard = async () => {
    try {
      const updated = await fetchCards();
      const card = updated.find(c => String(c.id) === String(selectedCardId));
      if (card) setSelectedCard(card);
    } catch (err) { console.error("Erro ao atualizar cartão:", err); }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/transactions/by-card/${selectedCardId}?month=${encodeURIComponent(month)}`);
      const { transactions, startDate, endDate } = res.data;
      setTransactions(transactions || []);
      if (startDate && endDate) {
        setDateRange({
          start: format(parseISO(startDate), "dd/MM/yyyy"),
          end: format(subDays(parseISO(endDate), 1), "dd/MM/yyyy"),
        });
      } else { setDateRange(null); }
    } catch (err) { console.error("Erro ao carregar transações:", err); }
  };

  const fetchFutureChart = async () => {
    try {
      const res = await api.get(`/transactions/card/${selectedCardId}/forecast-monthly`);
      setChartData(res.data.map(item => ({
        month: format(parseISO(item.month + "-01"), "MMM yyyy", { locale: ptBR }),
        total: parseFloat(item.total),
      })));
    } catch (err) { console.error("Erro ao buscar gráfico:", err); }
  };

  const fetchFutureInstallments = async () => {
    try {
      const res = await api.get(`/transactions/card/${selectedCardId}/forecast`, { params: { month } });
      const total = parseFloat(res.data?.total || 0);
      setFutureInstallmentsTotal(total);
      setTotalFuture(total);
    } catch (err) { console.error("Erro ao buscar parcelas:", err); }
  };

  const checkOrCreateInvoice = async () => {
    try {
      const res = await api.post("/invoices/create", { cardId: selectedCardId, month });
      setInvoice(res.data.invoice);
    } catch (err) { console.error("Erro ao criar fatura:", err); }
  };

  const fetchInvoiceInfo = async () => {
    try {
      const res = await api.get("/invoices/invoice-info", { params: { cardId: selectedCardId, month } });
      setInvoiceInfo(res.data);
    } catch (err) { console.error("Erro ao carregar info da fatura:", err); }
  };

  const handleUnmarkInvoice = async () => {
    try {
      await api.put(`/invoices/${invoice.id}/unpay`);
      await loadSelectedCard();
      await fetchFutureInstallments();
      await checkOrCreateInvoice();
      await fetchInvoiceInfo();
      setIsUnmarkModalOpen(false);
    } catch (err) { console.error("Erro ao desfazer pagamento:", err); }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/transactions/${confirmDeleteId}`);
      toast.success("Transação excluída com sucesso");
      setConfirmDeleteId(null);
      fetchTransactions(); fetchFutureChart(); fetchFutureInstallments();
      loadSelectedCard(); checkOrCreateInvoice(); fetchInvoiceInfo();
    } catch (err) {
      toast.error("Erro ao excluir transação");
    } finally { setIsDeleting(false); }
  };

  const cardLimit       = selectedCard.limit || 0;
  const cardAvailable   = selectedCard.availableLimit || 0;
  const totalSpentMonth = transactions.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const usedPercentage  = cardLimit > 0 ? Math.round(((cardLimit - cardAvailable) / cardLimit) * 100) : 0;
  const barColor        = usedPercentage > 80 ? "#ef4444" : usedPercentage > 50 ? "#f59e0b" : "#22c55e";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .cd-page { font-family: 'DM Sans', sans-serif; }
        .cd-btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: 9px; border: none; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
        .cd-btn-dark { background: #0f172a; color: #fff; }
        .cd-btn-dark:hover { background: #1e293b; }
        .cd-btn-purple { background: #7c3aed; color: #fff; }
        .cd-btn-purple:hover { background: #6d28d9; }
        .cd-btn-outline { background: #fff; color: #374151; border: 1.5px solid #e2e8f0; }
        .cd-btn-outline:hover { background: #f8fafc; }
        .cd-card { background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px; padding: 20px 22px; margin-bottom: 16px; }
        .cd-select, .cd-month { padding: 9px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s; }
        .cd-select:focus, .cd-month:focus { border-color: #3b82f6; }
        .cd-tx-item { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 13px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 8px; transition: box-shadow 0.15s; }
        .cd-tx-item:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .cd-action-btn { width: 30px; height: 30px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
        .cd-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
        .cd-section-title { font-size: 15px; font-weight: 600; color: '#0f172a'; letter-spacing: '-0.2px'; margin: '0 0 14px'; }
      `}</style>

      <div className="cd-page">
        {/* Voltar */}
        <Link to="/cards" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", textDecoration: "none", marginBottom: 20 }}
          onMouseEnter={e => e.currentTarget.style.color = "#0f172a"}
          onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
        >
          <ArrowLeft size={15} /> Voltar para Cartões
        </Link>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.4px", margin: "0 0 4px" }}>Fatura do Cartão</h1>
            {dateRange && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Período: {dateRange.start} → {dateRange.end}</p>}
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <select className="cd-select" value={selectedCardId} onChange={e => setSelectedCardId(e.target.value)}>
            <option value="">Selecione o cartão</option>
            {cards.map(c => <option key={c.id} value={c.id}>{c.name} — {c.brand}</option>)}
          </select>
          <input className="cd-month" type="month" value={month} onChange={e => setMonth(e.target.value)} />
          <button className="cd-btn cd-btn-dark" onClick={() => { setIsModalOpen(true); setEditingTransaction(null); }}>
            <PlusCircle size={15} /> Nova despesa
          </button>
          <button className="cd-btn cd-btn-purple" onClick={() => setIsAttachOpen(true)}>
            <Paperclip size={15} /> Anexar PDF
          </button>
        </div>

        {selectedCardId && (
          <>
            {/* Card info */}
            <div className="cd-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CreditCard size={20} color="#7c3aed" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>{selectedCard.name || "Cartão"}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{selectedCard.brand}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
                  background: usedPercentage > 80 ? "#fef2f2" : "#f0fdf4",
                  color: usedPercentage > 80 ? "#dc2626" : "#16a34a",
                }}>
                  {usedPercentage}% usado
                </span>
              </div>

              {/* Barra */}
              <div style={{ height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${Math.min(usedPercentage, 100)}%`, background: barColor, transition: "width 0.4s" }} />
              </div>

              {/* Limites + datas */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16, marginBottom: 16 }}>
                <div>
                  <div className="cd-label">Limite total</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>R$ {fmt(cardLimit)}</div>
                </div>
                <div>
                  <div className="cd-label">Disponível</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#16a34a" }}>R$ {fmt(cardAvailable)}</div>
                </div>
                {invoiceInfo?.closingDate && (
                  <div>
                    <div className="cd-label">Fechamento</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#374151" }}>
                      <Calendar size={13} color="#94a3b8" />
                      {format(new Date(invoiceInfo.closingDate), "dd/MM/yyyy")}
                    </div>
                  </div>
                )}
                {invoiceInfo?.dueDate && (
                  <div>
                    <div className="cd-label">Vencimento</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#374151" }}>
                      <Calendar size={13} color="#94a3b8" />
                      {format(new Date(invoiceInfo.dueDate), "dd/MM/yyyy")}
                    </div>
                  </div>
                )}
              </div>

              {/* Botão pagar fatura */}
              {invoice && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {invoice.paid ? (
                    <button
                      onClick={() => setIsUnmarkModalOpen(true)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9, border: "1.5px solid #bbf7d0", background: "#f0fdf4", color: "#16a34a", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      <CheckCircle2 size={15} /> Fatura paga — clique para desfazer
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsPayModalOpen(true)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 9, border: "none", background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      <CheckCircle2 size={15} /> Marcar fatura como paga
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Resumo da fatura */}
            <div className="cd-card">
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>Resumo da fatura</h3>
              <div>
                {[
                  { label: "Fatura atual", value: totalSpentMonth },
                  { label: "Parcelas futuras", value: futureInstallmentsTotal },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>R$ {fmt(row.value)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Total comprometido</span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: "#7c3aed", letterSpacing: "-0.5px" }}>
                    R$ {fmt(totalSpentMonth + futureInstallmentsTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="cd-card">
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>Previsão de gastos futuros</h3>
              {chartData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 14 }}>
                  Nenhuma previsão de gastos futuros.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 30, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} angle={-30} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="total" fill="#7c3aed" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 8 }}>
                    Previsão dos próximos 6 meses, incluindo parcelas futuras.
                  </p>
                </>
              )}
            </div>

            {/* Transações */}
            <div className="cd-card">
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>
                Transações da fatura
                {transactions.length > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 8 }}>({transactions.length})</span>
                )}
              </h3>

              {transactions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <ListX size={22} color="#94a3b8" />
                  </div>
                  <p style={{ fontSize: 14, color: "#94a3b8" }}>Nenhuma transação nesse mês.</p>
                </div>
              ) : (
                <>
                  {transactions.map(t => (
                    <div key={t.id} className="cd-tx-item">
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CreditCard size={16} color="#7c3aed" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", marginBottom: 2 }}>{t.title}</div>
                        <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#94a3b8", flexWrap: "wrap" }}>
                          <span>{format(parseISO(t.date), "dd/MM/yyyy")}</span>
                          {t.Category && (
                            <span>{t.Category.parent ? `${t.Category.parent.name} › ` : ""}{t.Category.name}</span>
                          )}
                          {t.installmentNumber && t.totalInstallments && (
                            <span>{t.installmentNumber}/{t.totalInstallments}x</span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#7c3aed", whiteSpace: "nowrap" }}>
                        R$ {fmt(t.amount)}
                      </span>
                      <div style={{ display: "flex", gap: 2 }}>
                        <button className="cd-action-btn"
                          onClick={() => { setEditingTransaction(t); setIsModalOpen(true); }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <Pencil size={14} color="#64748b" />
                        </button>
                        <button className="cd-action-btn"
                          onClick={() => setConfirmDeleteId(t.id)}
                          onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, marginTop: 6, borderTop: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#64748b" }}>Total do mês</span>
                    <span style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.5px" }}>
                      R$ {fmt(totalSpentMonth)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modais */}
      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
          transaction={editingTransaction}
          initialType="despesa_cartao"
          defaultCardId={selectedCardId}
          onSave={async () => {
            await fetchTransactions(); await fetchFutureChart(); await fetchFutureInstallments();
            const updated = await fetchCards();
            const card = updated.find(c => String(c.id) === String(selectedCardId));
            if (card) setSelectedCard(card);
          }}
          refresh={() => { fetchTransactions(); fetchFutureChart(); fetchFutureInstallments(); }}
        />
      )}

      {confirmDeleteId && (
        <ConfirmDeleteModal
          isOpen={!!confirmDeleteId}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
          loading={isDeleting}
          message="Tem certeza que deseja excluir esta transação?"
        />
      )}

      {isUnmarkModalOpen && (
        <ConfirmInvoiceModal
          isOpen={isUnmarkModalOpen}
          onClose={() => setIsUnmarkModalOpen(false)}
          onConfirm={handleUnmarkInvoice}
          message="Tem certeza que deseja marcar esta fatura como NÃO paga?"
        />
      )}

      {isPayModalOpen && (
        <PayInvoiceModal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          invoice={invoice}
          invoiceValue={totalSpentMonth}
          onSuccess={async () => {
            try {
              await new Promise(r => setTimeout(r, 600));
              const updated = await fetchCards();
              const card = updated.find(c => String(c.id) === String(selectedCardId));
              if (card) setSelectedCard(card);
              await fetchFutureInstallments();
              await checkOrCreateInvoice();
              await fetchInvoiceInfo();
              toast.success("Fatura marcada como paga!");
            } catch (err) { console.error("Erro após pagamento:", err); }
          }}
        />
      )}

      {isAttachOpen && (
        <AttachInvoiceModal
          open={isAttachOpen}
          onClose={() => setIsAttachOpen(false)}
          cardId={Number(selectedCardId)}
          month={month}
          onDone={async () => {
            await fetchTransactions(); await fetchFutureChart(); await fetchFutureInstallments();
            await loadSelectedCard(); await checkOrCreateInvoice(); await fetchInvoiceInfo();
          }}
        />
      )}
    </>
  );
};

export default CardDetails;

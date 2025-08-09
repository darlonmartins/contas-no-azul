import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  PlusCircle, ArrowLeft, Calendar, DollarSign,
  CreditCard, Pencil, Trash2, CheckCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LabelList
} from "recharts";
import TransactionModal from "../components/records/TransactionModal";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";
import InvoiceModal from '../components/invoices/InvoiceModal';
import { motion } from 'framer-motion';
import ConfirmInvoiceModal from "../components/invoices/ConfirmInvoiceModal";
import PayInvoiceModal from "../components/invoices/PayInvoiceModal";
import { toast } from 'react-toastify';

const CardDetails = () => {
  const { cardId } = useParams();
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(cardId || "");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [futureInstallmentsTotal, setFutureInstallmentsTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [totalSpentCard, setTotalSpentCard] = useState(0);
  const [invoice, setInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceInfo, setInvoiceInfo] = useState(null);
  const [isUnmarkModalOpen, setIsUnmarkModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [totalFuture, setTotalFuture] = useState(0);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetchCards(); }, []);

  useEffect(() => {
    if (selectedCardId && month) {
      fetchTransactions();
      fetchFutureChart();
      fetchTotalSpentCard();
      checkOrCreateInvoice();
      fetchInvoiceInfo();
    }
  }, [selectedCardId, month]);

  // 🔓 Abre modal de pagamento com logs e valor correto
const openPayModal = () => {
  console.log("🧭 Abrindo PayInvoiceModal...");
  console.log("📌 invoice:", invoice);
  console.log("📌 invoiceInfo:", invoiceInfo);
  console.log("📌 totalSpentMonth (Fatura Atual):", totalSpentMonth);
  console.log("📌 futureInstallmentsTotal:", futureInstallmentsTotal);
  setIsPayModalOpen(true);
};

  useEffect(() => {
    if (selectedCardId) {
      fetchFutureInstallments(); // ← essa chamada isolada aqui
    }
  }, [selectedCardId]);



  useEffect(() => {
    if (!selectedCard?.id && cards.length > 0) {
      const updated = cards.find(c => String(c.id) === String(selectedCardId));
      if (updated) {
        console.log("🟢 Inicializando selectedCard com dados de cards:", updated);
        setSelectedCard(updated);
      }
    }
  }, [cards, selectedCardId, selectedCard?.id]);



  const fetchCards = async () => {
    try {
      const res = await api.get("/cards/with-available-limit", {
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
        params: {
          _: Date.now(), // força cache bust
        },
      });
      setCards(res.data);
      return res.data;
    } catch (err) {
      console.error("Erro ao carregar cartões com limite:", err);
      return [];
    }
  };


  const loadSelectedCard = async () => {
    try {
      const cardsAtualizados = await fetchCards();
      const atualizado = cardsAtualizados.find(c => String(c.id) === String(selectedCardId));
      if (atualizado) {
        setSelectedCard(atualizado);
        console.log("💳 Cartão atualizado após pagamento:", atualizado);
      }
    } catch (err) {
      console.error("Erro ao carregar cartão atualizado:", err);
    }
  };


  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/transactions/by-card/${selectedCardId}?month=${month}`);
      const { transactions, startDate, endDate } = res.data;
      setTransactions(transactions || []);
      if (startDate && endDate) {
        setDateRange({
          start: format(parseISO(startDate), "dd/MM/yyyy"),
          end: format(subDays(parseISO(endDate), 1), "dd/MM/yyyy"),
        });
      } else {
        setDateRange(null);
      }
    } catch (err) {
      console.error("Erro ao carregar transações:", err);
    }
  };

  const fetchFutureChart = async () => {
    try {
      const res = await api.get(`/transactions/card/${selectedCardId}/forecast-monthly`);
      const data = res.data.map(item => ({
        month: format(parseISO(item.month + "-01"), "MMM yyyy", { locale: ptBR }),
        total: parseFloat(item.total),
      }));
      setChartData(data);
    } catch (err) {
      console.error("Erro ao buscar gráfico futuro:", err);
    }
  };

  const fetchFutureInstallments = async () => {
    try {
      const res = await api.get(`/transactions/card/${selectedCardId}/forecast`, {
        params: { month }
      });
      setFutureInstallmentsTotal(parseFloat(res.data.total || 0));
    } catch (err) {
      console.error("Erro ao buscar parcelas futuras:", err);
    }
  };



const fetchTotalSpentCard = async () => {
  try {
    if (!selectedCardId) return;

    // garante formato YYYY-MM
    let safeMonth = month;
    if (!/^\d{4}-\d{2}$/.test(safeMonth)) {
      safeMonth = new Date().toISOString().slice(0, 7);
      console.warn("⚠️ month inválido, usando mês atual:", safeMonth);
    }

    console.log("📡 Forecast ->", { cardId: selectedCardId, month: safeMonth });

    const res = await api.get(`/transactions/card/${selectedCardId}/forecast`, {
      params: { month: safeMonth }, // ✅ AGORA VAI COM QUERYSTRING
    });

    console.log("✅ Forecast OK:", res.data);
    setTotalFuture(res.data.total || 0);
  } catch (err) {
    console.error("❌ Erro ao buscar total gasto do cartão (forecast):", err);
  }
};



const checkOrCreateInvoice = async () => {
  try {
    console.log("🧾 checkOrCreateInvoice ->", { cardId: selectedCardId, month });
    const res = await api.post('/invoices/create', { cardId: selectedCardId, month });
    setInvoice(res.data.invoice);
  } catch (err) {
    console.error('❌ Erro ao criar/verificar fatura:', err);
  }
};


  const fetchInvoiceInfo = async () => {
    try {
      const res = await api.get('/invoices/invoice-info', {
        params: { cardId: selectedCardId, month },
      });
      setInvoiceInfo(res.data);
    } catch (err) {
      console.error("Erro ao carregar informações da fatura:", err);
    }
  };

  const handleUnmarkInvoice = async () => {
    try {
      await api.put(`/invoices/${invoice.id}/unpay`);
      await loadSelectedCard();
      await fetchTotalSpentCard();
      await checkOrCreateInvoice();
      await fetchInvoiceInfo();
      setIsUnmarkModalOpen(false);
    } catch (err) {
      console.error("Erro ao desfazer pagamento da fatura:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;

    setIsDeleting(true);

    try {
      await api.delete(`/transactions/${confirmDeleteId}`);
      toast.success("Transação excluída com sucesso");

      // ✅ Fecha a modal imediatamente
      setConfirmDeleteId(null);
      setIsDeleting(false);

      // 🔄 Atualizações em segundo plano
      fetchTransactions();
      fetchFutureChart();
      fetchFutureInstallments();
      fetchTotalSpentCard();
      loadSelectedCard();
      checkOrCreateInvoice();
      fetchInvoiceInfo();
    } catch (err) {
      console.error("Erro ao excluir transação:", err);
      toast.error("Erro ao excluir transação");
      setIsDeleting(false); // fallback
    }
  };


  const cardLimit = selectedCard.limit || 0;
  const cardAvailable = selectedCard.availableLimit || 0;
  const totalSpentMonth = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalSpentCardReal = transactions.reduce((sum, t) => {
    return sum + (t.totalInstallments > 1 && t.currentInstallment === 1
      ? parseFloat(t.amount || 0) * t.totalInstallments
      : parseFloat(t.amount || 0));
  }, 0);
  const usedPercentage = cardLimit > 0 ? Math.round((totalSpentCardReal / cardLimit) * 100) : 0;

  return (
    <div className="p-6">
      {/* navegação */}
      <div className="mb-6">
        <Link to="/cards" className="flex items-center text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Cartões
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-6">Fatura do Cartão</h2>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <select
          className="border rounded px-3 py-2"
          value={selectedCardId}
          onChange={(e) => setSelectedCardId(e.target.value)}
        >
          <option value="">Selecione o cartão</option>
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.name} - {card.brand}
            </option>
          ))}
        </select>

        <input
          type="month"
          className="border rounded px-3 py-2"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        <button
          onClick={() => {
            setIsModalOpen(true);
            setEditTransaction(null);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          Registrar despesa com cartão
        </button>
      </div>

      {/* Cabeçalho do Cartão */}
      {selectedCardId && (
        <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">
                {selectedCard.name || 'Cartão'}
              </h2>
            </div>
            <div
              className={`px-3 py-1 rounded-full ${usedPercentage > 80
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
                }`}
            >
              {usedPercentage}% usado
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Limite Total</p>
              <p className="text-lg font-semibold">
                R$ {cardLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Limite Disponível</p>
              <p className="text-lg font-semibold">
                R$ {cardAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Fechamento</p>
                <p className="text-sm font-medium">
                  {invoiceInfo?.closingDate
                    ? format(new Date(invoiceInfo.closingDate), "dd/MM/yyyy")
                    : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Vencimento</p>
                <p className="text-sm font-medium">
                  {invoiceInfo?.dueDate
                    ? format(new Date(invoiceInfo.dueDate), "dd/MM/yyyy")
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          <div
            className="h-2 rounded-full mt-4 mb-6"
            style={{
              backgroundColor: usedPercentage > 80 ? '#f87171' : '#34d399',
              width: `${Math.min(usedPercentage, 100)}%`,
            }}
          />

          {invoice && (
            <div className="flex justify-center mt-4">
              {invoice.paid ? (
                <div
                  onClick={() => setIsUnmarkModalOpen(true)}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded shadow text-sm font-semibold hover:bg-green-200 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  Fatura paga
                </div>
              ) : (
                <button
                  onClick={openPayModal} // ⬅️ antes: setIsPayModalOpen(true)
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded shadow-md transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar Fatura como Paga
                </button>


              )}
            </div>
          )}
        </div> // ← ✅ FECHAMENTO CORRETO do <div className="bg-blue-50">
      )}


      {/* Resumo da Fatura */}
      {selectedCardId && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Resumo da Fatura
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-600">Fatura Atual</span>
              <span className="font-semibold">
                R$ {totalSpentMonth.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}

              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-600">Parcelas Futuras</span>
              <span className="font-semibold">
                R$ {futureInstallmentsTotal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-700 font-medium">Total Comprometido</span>
              <span className="font-bold text-lg">
                R$ {(totalSpentMonth + futureInstallmentsTotal).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      )}


      {/* Gráfico de Gastos Futuros */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Previsão de Gastos Futuros</h3>

        {chartData.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Nenhuma previsão de gastos futuros encontrada.</p>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 30, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    tickFormatter={(month) => month.replace('de ', '')}
                  />
                  <YAxis />
                  <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="total"
                      position="top"
                      formatter={(v) => `R$ ${Number(v).toFixed(2)}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Explicação abaixo do gráfico */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 leading-relaxed">
                Previsão de gastos para os próximos 6 meses, considerando também parcelas futuras superiores a este prazo.
              </p>
            </div>
          </>
        )}
      </div>


      {/* Transações da Fatura */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Transações da Fatura</h3>

        {transactions.length === 0 ? (
          <p className="text-gray-500">Nenhuma transação encontrada para esse cartão nesse mês.</p>
        ) : (
          <>
            <div className="space-y-4">
              {transactions.map((t) => (
                <div key={t.id} className="border rounded-lg p-3 flex justify-between items-center shadow-sm hover:shadow-md transition">
                  <div>
                    <p className="font-semibold text-gray-800">{t.title}</p>
                    <div className="text-xs text-gray-500 flex gap-2 mt-1">
                      <span>{format(parseISO(t.date), "dd/MM/yyyy")}</span>
                      {t.Category?.parent && (
                        <span>• {t.Category.parent.name} &gt; {t.Category.name}</span>
                      )}
                      {!t.Category?.parent && t.Category?.name && (
                        <span>• {t.Category.name}</span>
                      )}
                      {t.installmentNumber && t.totalInstallments && (
                        <span>• {t.installmentNumber}/{t.totalInstallments}</span>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação */}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setEditingTransaction(t); // ⚡ usar setEditingTransaction corretamente
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(t.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="text-right font-bold text-gray-800 text-base">
                      R$ {parseFloat(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ➡️ Totalizador depois da lista */}
            <div className="flex justify-between items-center pt-4 mt-6 border-t">
              <span className="text-gray-700 font-semibold">Total do mês:</span>
              <span className="text-lg font-bold text-green-700">
                R$ {totalSpentMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          transaction={editingTransaction}
          initialType="despesa_cartao"
          defaultCardId={selectedCardId}
          onSave={async () => {
            await fetchTransactions();
            await fetchFutureChart();
            await fetchFutureInstallments();
            await fetchTotalSpentCard();

            const cardsAtualizados = await fetchCards();
            const atualizado = cardsAtualizados.find(c => String(c.id) === String(selectedCardId));
            if (atualizado) setSelectedCard(atualizado);
          }}
          refresh={() => {
            fetchTransactions();
            fetchFutureChart();
            fetchFutureInstallments();
          }}
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
    invoiceValue={totalSpentMonth}  // ✅ passa o valor que a UI exibe como “Fatura Atual”
    onSuccess={async () => {
      try {
        await new Promise(r => setTimeout(r, 600));
        const cardsAtualizados = await fetchCards();
        const atualizado = cardsAtualizados.find(c => String(c.id) === String(selectedCardId));
        if (atualizado) {
          console.log("💳 Cartão atualizado após pagamento:", atualizado);
          setSelectedCard(atualizado);
        } else {
          console.warn("⚠️ Cartão não encontrado após pagamento.");
        }
        await fetchTotalSpentCard();
        await checkOrCreateInvoice();
        await fetchInvoiceInfo();
        toast.success("Fatura marcada como paga!");
      } catch (err) {
        console.error("❌ Erro ao atualizar dados após pagamento da fatura:", err);
      }
    }}
  />
)}




    </div>
  );
};

export default CardDetails;

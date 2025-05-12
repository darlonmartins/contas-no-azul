import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Pencil, Trash2, ArrowDownCircle, ArrowUpCircle, CreditCard, Repeat } from "lucide-react";
import TransactionModal from "./TransactionModal";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import { toast } from "react-toastify";

const TransactionList = ({ mode = "month", month, day, type, category, search, refresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [mode, month, day, type, category, search, refresh]);

  const fetchTransactions = async () => {
    try {
      let baseUrl = "/transactions";

      if (mode === "month" && month && isMonthValid(month)) {
        baseUrl = `/transactions/by-month/${month}`;
      } else if (mode === "day" && day && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
        baseUrl = `/transactions/by-day/${day}`;
      }

      const res = await api.get(baseUrl);
      let data = Array.isArray(res.data) ? res.data : [];

      if (type !== "all") {
        data = data.filter((t) => t.type === type);
      }

      if (category !== "all") {
        data = data.filter((t) => t.Category && t.Category.name === category);
      }

      if (search.trim() !== "") {
        const query = search.trim().toLowerCase();
        data = data.filter((t) => t.title.toLowerCase().includes(query));
      }

      setTransactions(data);
    } catch (err) {
      console.error("Erro ao buscar transações:", err);
      setTransactions([]);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/transactions/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchTransactions();
      toast.success("Transação excluída com sucesso.");
    } catch (err) {
      console.error("Erro ao excluir transação:", err);
      toast.error("Erro ao excluir transação.");
    }
  };

  const isMonthValid = (month) => {
    const selected = new Date(`${month}-01`);
    const today = new Date();
    return selected <= today;
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("pt-BR");
  };

  const formatAmount = (amount, type) => {
    const prefix = type === "income" ? "+ R$" : type === "expense" || type === "despesa_cartao" ? "- R$" : "R$";
    return `${prefix}${parseFloat(amount).toFixed(2).replace(".", ",")}`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "income":
        return <ArrowUpCircle size={14} className="text-green-600 inline" />;
      case "expense":
        return <ArrowDownCircle size={14} className="text-red-600 inline" />;
      case "despesa_cartao":
        return <CreditCard size={14} className="text-purple-600 inline" />;
      case "transfer":
        return <Repeat size={14} className="text-indigo-600 inline" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "income":
        return "Ganho";
      case "expense":
        return "Despesa";
      case "despesa_cartao":
        return "Cartão";
      case "transfer":
        return "Transferência";
      default:
        return "";
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Transações Registradas</h2>

      {transactions.length === 0 ? (
        <p className="text-gray-500">Nenhuma transação encontrada.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((tx) => (
            <li key={tx.id} className="p-4 rounded shadow flex justify-between items-center border bg-white">
              <div>
                <p className="text-sm text-gray-600">{formatDate(tx.date)}</p>
                <p className="text-base font-medium">{tx.title}</p>

                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  {getTypeIcon(tx.type)} {getTypeLabel(tx.type)}
                  {tx.isInstallment && tx.totalInstallments > 1 && (
  <span className="ml-1">(parcela {tx.installmentNumber}/{tx.totalInstallments})</span>
)}

                </p>

                {tx.type === "despesa_cartao" && tx.card?.name && (
                  <p className="text-xs text-purple-600">Cartão: {tx.card.name}</p>
                )}
{tx.Category && (
  <div className="text-xs text-gray-400">
    {tx.Category.parent?.name && (
      <p>Categoria: {tx.Category.parent.name}</p>
    )}
    <p>
      Subcategoria: {tx.Category.name}
    </p>
  </div>
)}


                {tx.type === "transfer" && tx.fromAccount && tx.toAccount && (
                  <p className="text-xs text-gray-400">
                    {tx.fromAccount.name} → {tx.toAccount.name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`text-lg font-semibold ${
                    tx.type === "income"
                      ? "text-green-600"
                      : tx.type === "expense" || tx.type === "despesa_cartao"
                      ? "text-red-600"
                      : "text-indigo-600"
                  }`}
                >
                  {formatAmount(tx.amount, tx.type)}
                </span>

                <button
                  onClick={() => setDeleteTarget(tx)}
                  className="text-red-600 hover:text-red-800"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>

                <button
                  onClick={() => setEditTransaction(tx)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold mb-4">Editar Transação</h2>
            <button
              onClick={() => setEditTransaction(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
            <TransactionModal
              transaction={editTransaction}
              onClose={() => setEditTransaction(null)}
              onSave={fetchTransactions}
              initialType={editTransaction.type}
            />
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default TransactionList;

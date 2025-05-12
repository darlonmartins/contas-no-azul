// frontend/src/components/records/ResumoFinanceiro.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";

const ResumoFinanceiro = ({ month, category }) => {
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    despesa_cartao: 0,
    transfer: 0,
    balance: 0,
  });

  useEffect(() => {
    fetchSummary();
  }, [month, category]);

  const fetchSummary = async () => {
    try {
      const params = {};

      if (month && /^\d{4}-\d{2}$/.test(month)) {
        params.month = month;
      }

      if (category && category !== "all") {
        params.category = category;
      }

      const res = await api.get("/transactions/summary", { params });
      setSummary(res.data);
    } catch (err) {
      console.error("Erro ao carregar resumo financeiro:", err);
    }
  };

  const format = (value) => {
    const floatValue = parseFloat(value || 0);
    return `R$ ${floatValue.toFixed(2).replace(".", ",")}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div className="bg-green-100 text-green-700 p-4 rounded shadow text-center">
        <p className="text-sm">Ganhos</p>
        <p className="text-lg font-bold">{format(summary.income)}</p>
      </div>
      <div className="bg-red-100 text-red-700 p-4 rounded shadow text-center">
        <p className="text-sm">Despesas</p>
        <p className="text-lg font-bold">{format(summary.expense)}</p>
      </div>
      <div className="bg-purple-100 text-purple-700 p-4 rounded shadow text-center">
        <p className="text-sm">Cartão</p>
        <p className="text-lg font-bold">{format(summary.despesa_cartao)}</p>
      </div>
      <div className="bg-indigo-100 text-indigo-700 p-4 rounded shadow text-center">
        <p className="text-sm">Transferências</p>
        <p className="text-lg font-bold">{format(summary.transfer)}</p>
      </div>
      <div
        className={`p-4 rounded shadow text-center ${
          summary.balance >= 0
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
        }`}
      >
        <p className="text-sm">Saldo</p>
        <p className="text-lg font-bold">{format(summary.balance)}</p>
      </div>
    </div>
  );
};

export default ResumoFinanceiro;

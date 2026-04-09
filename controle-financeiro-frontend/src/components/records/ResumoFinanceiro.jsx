import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { TrendingUp, TrendingDown, CreditCard, Repeat2, Wallet } from "lucide-react";

const fmt = (v) => `R$ ${parseFloat(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const SummaryCard = ({ label, value, icon: Icon, iconBg, iconColor, valueColor }) => (
  <div style={{
    background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12,
    padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }}>
    <div style={{ width: 36, height: 36, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={17} color={iconColor} />
    </div>
    <div>
      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: valueColor || '#0f172a', letterSpacing: '-0.3px' }}>{fmt(value)}</div>
    </div>
  </div>
);

const ResumoFinanceiro = ({ month, category }) => {
  const [summary, setSummary] = useState({ income: 0, expense: 0, despesa_cartao: 0, transfer: 0, balance: 0 });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = {};
        if (month && /^\d{4}-\d{2}$/.test(month)) params.month = month;
        if (category && category !== "all") params.category = category;
        const res = await api.get("/transactions/summary", { params });
        setSummary(res.data);
      } catch (err) {
        console.error("Erro ao carregar resumo:", err);
      }
    };
    fetchSummary();
  }, [month, category]);

  const isPositive = summary.balance >= 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
      <SummaryCard label="Ganhos"         value={summary.income}          icon={TrendingUp}  iconBg="#f0fdf4" iconColor="#16a34a" valueColor="#16a34a" />
      <SummaryCard label="Despesas"       value={summary.expense}         icon={TrendingDown} iconBg="#fef2f2" iconColor="#dc2626" valueColor="#dc2626" />
      <SummaryCard label="Cartão"         value={summary.despesa_cartao}  icon={CreditCard}  iconBg="#f5f3ff" iconColor="#7c3aed" valueColor="#7c3aed" />
      <SummaryCard label="Transferências" value={summary.transfer}        icon={Repeat2}     iconBg="#eff6ff" iconColor="#2563eb" valueColor="#2563eb" />
      <SummaryCard label="Saldo"          value={summary.balance}         icon={Wallet}      iconBg={isPositive ? '#f0fdf4' : '#fef2f2'} iconColor={isPositive ? '#16a34a' : '#dc2626'} valueColor={isPositive ? '#16a34a' : '#dc2626'} />
    </div>
  );
};

export default ResumoFinanceiro;

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import MonthSelector from '../components/dashboard/MonthSelector';
import CategorySelectorCompact from '../components/dashboard/CategorySelector.compact';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, CreditCard, Repeat2,
  Wallet, Target, Download, Plus, ArrowRight,
  AlertTriangle, AlertCircle, Info,
} from 'lucide-react';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const fmtShort = (v) => {
  const n = Number(v || 0);
  if (n >= 1000) return `R$ ${(n / 1000).toFixed(1)}k`;
  return `R$ ${n.toFixed(0)}`;
};

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, trend, trendLabel }) => (
  <div style={{
    background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16,
    padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>{label}</span>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={iconColor} />
      </div>
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1 }}>
        R$ {fmt(value)}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
    </div>
    {trendLabel && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: trend >= 0 ? '#16a34a' : '#dc2626' }}>
        {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {trendLabel}
      </div>
    )}
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.2px', margin: '0 0 16px' }}>
    {children}
  </h3>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16,
    padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', ...style
  }}>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          {p.name}: <strong style={{ color: '#0f172a' }}>R$ {fmt(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [monthFilter, setMonthFilter] = useState(() => dayjs().format('YYYY-MM'));
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const handleDownloadPdf = async () => {
    try {
      const params = new URLSearchParams();
      if (monthFilter) params.set('month', monthFilter);
      if (typeof categoryFilter === 'object' && categoryFilter?.id) params.set('categoryId', categoryFilter.id);
      const res = await api.get(`/pdf/monthly-report?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `relatorio-${monthFilter || 'atual'}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { console.error('Erro ao baixar PDF', e); }
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('dashFilters') || '{}');
    if (saved.month) setMonthFilter(saved.month);
    if (saved.category) setCategoryFilter(saved.category);
  }, []);

  useEffect(() => {
    localStorage.setItem('dashFilters', JSON.stringify({ month: monthFilter, category: categoryFilter }));
  }, [monthFilter, categoryFilter]);

  const buildParams = () => {
    const p = {};
    if (monthFilter) p.month = monthFilter;
    if (categoryFilter) {
      if (typeof categoryFilter === 'object' && categoryFilter?.id) p.categoryId = categoryFilter.id;
      else if (typeof categoryFilter === 'string') p.category = categoryFilter;
    }
    return p;
  };

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard', { params: buildParams() });
      setData(res.data);
    } catch (err) { console.error('Erro ao buscar dashboard:', err); }
  };

  useEffect(() => { fetchDashboard(); api.get('/categories').then(r => setCategories(r.data)).catch(() => {}); }, []);
  useEffect(() => { fetchDashboard(); }, [monthFilter, categoryFilter]);

  if (!data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12, color: '#94a3b8' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 14 }}>Carregando dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const {
    summary = {}, chart = [], topCategories = [], goals = [],
    accounts = [], cards = [], monthlyGoals = [],
    cardSummaryChart = [], incomeExpenseTrend = [], monthlyBalanceTrend = [],
    alerts = [],
  } = data;

  const metaFromMonthlyGoals = monthlyGoals.reduce((acc, g) => acc + (g?.amount || 0), 0);
  const usedFromMonthlyGoals = monthlyGoals.reduce((acc, g) => acc + (g?.usedAmount || 0), 0);
  const meta = metaFromMonthlyGoals > 0 ? metaFromMonthlyGoals : (summary.totalGoals ?? 0);
  const usado = metaFromMonthlyGoals > 0 ? usedFromMonthlyGoals : (summary.totalExpenses ?? 0);
  const percentual = meta > 0 ? Math.round((usado / meta) * 100) : 0;

  const alertIcon = { warning: AlertTriangle, danger: AlertCircle, info: Info };
  const alertColor = { warning: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }, danger: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' }, info: { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' } };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .dash { font-family: 'DM Sans', sans-serif; }
        .dash-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 8px; border: 1.5px solid #e2e8f0;
          font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; background: #fff; color: #374151;
          transition: all 0.15s; text-decoration: none;
        }
        .dash-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .dash-btn-primary { background: #0f172a; color: #fff; border-color: #0f172a; }
        .dash-btn-primary:hover { background: #1e293b; }
        .dash-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
        .dash-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
        .dash-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
        @media (max-width: 900px) {
          .dash-grid-3, .dash-grid-4 { grid-template-columns: 1fr 1fr; }
          .dash-grid-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .dash-grid-3, .dash-grid-4, .dash-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash">

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.4px', margin: 0 }}>Dashboard</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '2px 0 0' }}>
              {dayjs(monthFilter + '-01').format('MMMM [de] YYYY')}
            </p>
          </div>
          <MonthSelector value={monthFilter} onChange={setMonthFilter} hideLabel className="!h-9 min-w-[200px]" />
          <CategorySelectorCompact value={categoryFilter} onChange={setCategoryFilter} categories={categories} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="dash-btn" onClick={() => navigate('/registros', { state: { preset: 'expense' } })}>
              <Plus size={13} /> Despesa
            </button>
            <button className="dash-btn" onClick={() => navigate('/registros', { state: { preset: 'income' } })}>
              <Plus size={13} /> Ganho
            </button>
            <button className="dash-btn dash-btn-primary" onClick={handleDownloadPdf}>
              <Download size={13} /> PDF
            </button>
          </div>
        </div>

        {/* ── Alertas ── */}
        {alerts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {alerts.map((alert, i) => {
              const cfg = alertColor[alert.type] || alertColor.info;
              const Icon = alertIcon[alert.type] || Info;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 10,
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                }}>
                  <Icon size={15} color={cfg.color} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: cfg.color, fontWeight: 500 }}>{alert.message}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Cards de resumo ── */}
        <div className="dash-grid-4">
          <StatCard label="Ganhos" value={summary.income} icon={TrendingUp} iconBg="#f0fdf4" iconColor="#16a34a" />
          <StatCard label="Despesas" value={summary.expense} icon={TrendingDown} iconBg="#fef2f2" iconColor="#dc2626" />
          <StatCard label="Cartão" value={summary.despesa_cartao} icon={CreditCard} iconBg="#f5f3ff" iconColor="#8b5cf6" />
          <StatCard label="Transferências" value={summary.transfer} icon={Repeat2} iconBg="#eff6ff" iconColor="#3b82f6" />
        </div>

        {/* ── Saldo + Gastos + Cartões ── */}
        <div className="dash-grid-3">
          {/* Saldo */}
          <Card>
            <SectionTitle>Saldo em contas</SectionTitle>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 16 }}>
              R$ {fmt(summary.balance)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {accounts.map(acc => (
                <div key={acc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                    <span style={{ fontSize: 13, color: '#64748b' }}>{acc.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>R$ {fmt(acc.saldoAtual)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Gastos vs Meta */}
          <Card>
            <SectionTitle>Gastos do mês</SectionTitle>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 6 }}>
              R$ {fmt(usado)}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
              Meta: R$ {fmt(meta)} · {percentual}% utilizado
            </div>
            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${Math.min(percentual, 100)}%`,
                background: percentual > 100 ? '#ef4444' : percentual > 80 ? '#f59e0b' : '#22c55e',
                transition: 'width 0.4s',
              }} />
            </div>
            {monthlyGoals.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {monthlyGoals.slice(0, 3).map(g => {
                  const pct = Math.min(Math.round(g.percentageUsed || 0), 100);
                  return (
                    <div key={g.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 3 }}>
                        <span>{g.Category?.name}</span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: pct > 80 ? '#ef4444' : '#3b82f6' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Cartões */}
          <Card>
            <SectionTitle>Cartões de crédito</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cards.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhum cartão cadastrado.</p>}
              {cards.map(card => {
                const limit = Number(card.limit || 0);
                const used = Number(card.used || 0);
                const available = typeof card.availableLimit === 'number' ? card.availableLimit : Math.max(limit - used, 0);
                const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
                return (
                  <div key={card.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{card.name}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                        background: pct > 80 ? '#fef2f2' : '#f0fdf4',
                        color: pct > 80 ? '#dc2626' : '#16a34a',
                      }}>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ height: '100%', borderRadius: 99, width: `${Math.min(pct, 100)}%`, background: pct > 80 ? '#ef4444' : '#22c55e' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                      <span>Usado: R$ {fmt(used)}</span>
                      <span>Disponível: R$ {fmt(available)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── Gráficos ── */}
        <div className="dash-grid-2">
          {/* Receitas vs Despesas */}
          <Card>
            <SectionTitle>Receitas vs Despesas</SectionTitle>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={incomeExpenseTrend} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => { const [a, m] = v.split('-'); return new Date(a, m-1).toLocaleDateString('pt-BR', { month: 'short' }); }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={fmtShort} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="receitas" fill="#22c55e" name="Receitas" radius={[4,4,0,0]} />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Evolução do saldo */}
          <Card>
            <SectionTitle>Evolução do saldo</SectionTitle>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyBalanceTrend} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => { const [a, m] = v.split('-'); return new Date(a, m-1).toLocaleDateString('pt-BR', { month: 'short' }); }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={fmtShort} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="saldo" stroke="#3b82f6" name="Saldo" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="dash-grid-2">
          {/* Categorias - Pizza */}
          <Card>
            <SectionTitle>Gastos por categoria</SectionTitle>
            {topCategories.length === 0
              ? <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhuma despesa no período.</p>
              : <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={topCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={48}>
                      {topCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => `R$ ${fmt(v)}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {topCategories.map((cat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#64748b', flex: 1 }}>{cat.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>R$ {fmt(cat.value)}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 32, textAlign: 'right' }}>{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            }
          </Card>

          {/* Gastos com cartões */}
          <Card>
            <SectionTitle>Gastos com cartões</SectionTitle>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cardSummaryChart} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => { const [a, m] = v.split('-'); return new Date(a, m-1).toLocaleDateString('pt-BR', { month: 'short' }); }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={fmtShort} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#8b5cf6" name="Total cartões" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Metas mensais ── */}
        {monthlyGoals.length > 0 && (
          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Metas mensais</h3>
              <button className="dash-btn" onClick={() => navigate('/metas')} style={{ fontSize: 12, padding: '6px 12px' }}>
                Ver todas <ArrowRight size={12} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {monthlyGoals.map(goal => {
                const pct = Math.min(Math.round(goal.percentageUsed || 0), 100);
                const over = (goal.percentageUsed || 0) > 100;
                return (
                  <div key={goal.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{goal.Category?.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: over ? '#fef2f2' : '#f0fdf4', color: over ? '#dc2626' : '#16a34a' }}>
                        {Math.round(goal.percentageUsed || 0)}%
                      </span>
                    </div>
                    <div style={{ height: 4, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: over ? '#ef4444' : pct > 80 ? '#f59e0b' : '#22c55e' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                      <span>R$ {fmt(goal.usedAmount)}</span>
                      <span>R$ {fmt(goal.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ── Objetivos ── */}
        {goals.length > 0 && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Objetivos financeiros</h3>
              <button className="dash-btn" onClick={() => navigate('/goals')} style={{ fontSize: 12, padding: '6px 12px' }}>
                Ver todos <ArrowRight size={12} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {goals.map((goal, i) => {
                const pct = Math.min(Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100), 100);
                const done = goal.currentAmount >= goal.targetAmount;
                return (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{goal.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: done ? '#f0fdf4' : '#eff6ff', color: done ? '#16a34a' : '#2563eb' }}>
                        {done ? 'Concluído' : `${pct}%`}
                      </span>
                    </div>
                    <div style={{ height: 4, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: done ? '#22c55e' : '#3b82f6' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                      <span>R$ {fmt(goal.currentAmount)}</span>
                      <span>R$ {fmt(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </>
  );
};

export default Dashboard;

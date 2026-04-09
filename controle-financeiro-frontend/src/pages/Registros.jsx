import React, { useEffect, useState } from "react";
import { PlusCircle, Search, SlidersHorizontal, X } from "lucide-react";
import api from "../services/api";
import TransactionList from "../components/records/TransactionList";
import TransactionModal from "../components/records/TransactionModal";
import ResumoFinanceiro from "../components/records/ResumoFinanceiro";

const TABS = [
  { key: "ganho",         label: "Ganho",          color: "#16a34a", bg: "#f0fdf4" },
  { key: "despesa",       label: "Despesa",         color: "#dc2626", bg: "#fef2f2" },
  { key: "despesa_cartao",label: "Cartão",          color: "#7c3aed", bg: "#f5f3ff" },
  { key: "transferencia", label: "Transferência",   color: "#2563eb", bg: "#eff6ff" },
];

const Registros = () => {
  const [activeTab, setActiveTab]       = useState("ganho");
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [filterMode, setFilterMode]     = useState("month");
  const [monthFilter, setMonthFilter]   = useState(() => new Date().toISOString().slice(0, 7));
  const [dayFilter, setDayFilter]       = useState(new Date().toISOString().slice(0, 10));
  const [filterType, setFilterType]     = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories]     = useState([]);
  const [searchTerm, setSearchTerm]     = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFilters, setShowFilters]   = useState(false);

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const getTransactionType = () => {
    if (activeTab === "ganho") return "income";
    if (activeTab === "despesa") return "expense";
    if (activeTab === "transferencia") return "transfer";
    if (activeTab === "despesa_cartao") return "despesa_cartao";
    return "expense";
  };

  const activeTabConfig = TABS.find(t => t.key === activeTab);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .reg-page { font-family: 'DM Sans', sans-serif; }
        .reg-tabs { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
        .reg-tab {
          padding: 8px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0;
          font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; background: #fff; color: #64748b; transition: all 0.15s;
        }
        .reg-tab:hover { border-color: #cbd5e1; background: #f8fafc; }
        .reg-tab.active { border-color: currentColor; }
        .reg-actions { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .reg-btn-add {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 9px; border: none;
          font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.15s; color: #fff;
        }
        .reg-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 14px; border-radius: 8px; border: 1.5px solid #e2e8f0;
          font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; background: #fff; color: #374151; transition: all 0.15s;
        }
        .reg-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .reg-btn.active { background: #0f172a; color: #fff; border-color: #0f172a; }
        .reg-search-wrap {
          flex: 1; position: relative; min-width: 200px;
        }
        .reg-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .reg-search {
          width: 100%; padding: 9px 12px 9px 36px;
          border: 1.5px solid #e2e8f0; border-radius: 9px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f172a;
          background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .reg-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .reg-search::placeholder { color: #94a3b8; }
        .reg-filters {
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 14px;
          padding: 18px 20px; margin-bottom: 20px;
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px;
        }
        .reg-field label { font-size: 12px; font-weight: 500; color: #64748b; display: block; margin-bottom: 5px; }
        .reg-field select, .reg-field input {
          width: 100%; padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f172a;
          background: #fff; outline: none; transition: border-color 0.15s; box-sizing: border-box;
        }
        .reg-field select:focus, .reg-field input:focus { border-color: #3b82f6; }
        .reg-page-title { font-size: 22px; font-weight: 600; color: #0f172a; letter-spacing: -0.4px; margin: 0 0 6px; }
        .reg-page-sub { font-size: 13px; color: #94a3b8; margin: 0 0 20px; }
      `}</style>

      <div className="reg-page">
        <h1 className="reg-page-title">Registros</h1>
        <p className="reg-page-sub">Gerencie suas transações financeiras</p>

        {/* Tabs */}
        <div className="reg-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`reg-tab${activeTab === tab.key ? ' active' : ''}`}
              style={activeTab === tab.key ? { color: tab.color, background: tab.bg, borderColor: tab.color } : {}}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ações */}
        <div className="reg-actions">
          <button
            className="reg-btn-add"
            style={{ background: activeTabConfig?.color }}
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={16} />
            Registrar {activeTabConfig?.label}
          </button>

          <div className="reg-search-wrap">
            <Search size={15} className="reg-search-icon" />
            <input
              className="reg-search"
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            className={`reg-btn${showFilters ? ' active' : ''}`}
            onClick={() => setShowFilters(f => !f)}
          >
            <SlidersHorizontal size={14} />
            Filtros
          </button>
        </div>

        {/* Filtros expandíveis */}
        {showFilters && (
          <div className="reg-filters">
            <div className="reg-field">
              <label>Período</label>
              <select value={filterMode} onChange={e => setFilterMode(e.target.value)}>
                <option value="month">Por mês</option>
                <option value="day">Por dia</option>
              </select>
            </div>
            <div className="reg-field">
              <label>{filterMode === 'month' ? 'Mês' : 'Dia'}</label>
              {filterMode === 'month'
                ? <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} />
                : <input type="date" value={dayFilter} onChange={e => setDayFilter(e.target.value)} />
              }
            </div>
            <div className="reg-field">
              <label>Tipo</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">Todos</option>
                <option value="income">Ganho</option>
                <option value="expense">Despesa</option>
                <option value="despesa_cartao">Cartão</option>
                <option value="transfer">Transferência</option>
              </select>
            </div>
            <div className="reg-field">
              <label>Categoria</label>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="all">Todas</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Resumo */}
        <ResumoFinanceiro month={monthFilter} category={categoryFilter} />

        {/* Lista */}
        <TransactionList
          mode={filterMode}
          month={monthFilter}
          day={dayFilter}
          type={filterType}
          category={categoryFilter}
          search={searchTerm}
          refresh={refreshTrigger}
        />

        {/* Modal */}
        {isModalOpen && (
          <TransactionModal
            onClose={() => setIsModalOpen(false)}
            onSave={() => { setRefreshTrigger(p => p + 1); setIsModalOpen(false); }}
            transaction={null}
            initialType={getTransactionType()}
          />
        )}
      </div>
    </>
  );
};

export default Registros;

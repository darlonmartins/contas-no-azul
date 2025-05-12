// frontend/src/pages/Registros.jsx
import React, { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import api from "../services/api";
import TransactionList from "../components/records/TransactionList";
import TransactionModal from "../components/records/TransactionModal";
import ResumoFinanceiro from "../components/records/ResumoFinanceiro";

const Registros = () => {
  const [activeTab, setActiveTab] = useState("ganho");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const [filterMode, setFilterMode] = useState("month"); // "month" ou "day"
  const [monthFilter, setMonthFilter] = useState(() => new Date().toISOString().slice(0, 7));
  const [dayFilter, setDayFilter] = useState(today);

  const [filterType, setFilterType] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
      }
    };

    fetchCategories();
  }, []);

  const openModal = () => setIsModalOpen(true);

  const renderTabLabel = (tab) => {
    switch (tab) {
      case "ganho":
        return "Registrar Ganho";
      case "despesa":
        return "Registrar Despesa";
      case "despesa_cartao":
        return "Registrar Despesa com Cartão";
      case "transferencia":
        return "Registrar Transferência";
      default:
        return "Registrar";
    }
  };

  const getTransactionType = () => {
    if (activeTab === "ganho") return "income";
    if (activeTab === "despesa") return "expense";
    if (activeTab === "transferencia") return "transfer";
    if (activeTab === "despesa_cartao") return "despesa_cartao";
    return "expense";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Registros Financeiros</h1>

      {/* Abas */}
      <div className="flex space-x-4 mb-6">
        {[
          { key: "ganho", label: "Ganho" },
          { key: "despesa", label: "Despesa" },
          { key: "despesa_cartao", label: "Despesa com Cartão" },
          { key: "transferencia", label: "Transferência" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded ${
              activeTab === tab.key ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Botão Registrar + */}
      <div className="mb-6">
        <button
          onClick={openModal}
          className={`flex items-center gap-2 px-4 py-2 rounded text-white ${
            activeTab === "ganho"
              ? "bg-green-600 hover:bg-green-700"
              : activeTab === "despesa"
              ? "bg-red-600 hover:bg-red-700"
              : activeTab === "despesa_cartao"
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          <PlusCircle size={18} />
          {renderTabLabel(activeTab)}
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por:</label>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="month">Mês</option>
            <option value="day">Dia</option>
          </select>
        </div>

        {filterMode === "month" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês:</label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dia:</label>
            <input
              type="date"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por tipo:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="all">Todos</option>
            <option value="income">Ganho</option>
            <option value="expense">Despesa</option>
            <option value="despesa_cartao">Despesa com Cartão</option>
            <option value="transfer">Transferência</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por categoria:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="all">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtro por título */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buscar por título:
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ex: Salário, Aluguel..."
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {/* Resumo financeiro */}
      <ResumoFinanceiro month={monthFilter} category={categoryFilter} />

      {/* Lista de transações */}
      <TransactionList
        mode={filterMode}
        month={monthFilter}
        day={dayFilter}
        type={filterType}
        category={categoryFilter}
        search={searchTerm}
        refresh={refreshTrigger}
      />

      {/* Modal unificado */}
      {isModalOpen && (
        <TransactionModal
          onClose={() => setIsModalOpen(false)}
          onSave={() => setRefreshTrigger((prev) => prev + 1)}
          transaction={null}
          initialType={getTransactionType()}
        />
      )}
    </div>
  );
};

export default Registros;
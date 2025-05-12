import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const formatCurrencyInput = (value) => {
  const numeric = value.replace(/\D/g, "");
  if (!numeric) return "";
  const formatted = (Number(numeric) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return formatted;
};

const ObjectiveForm = ({ onCancel, onObjectiveSaved, initialData = null }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [targetValue, setTargetValue] = useState(
    initialData?.targetAmount?.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }) || ''
  );

  const [goalDate, setGoalDate] = useState(
    initialData?.dueDate?.slice(0, 10) || ''
  );
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const payload = {
      name,
      targetValue: parseFloat(
        targetValue.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")
      ),
      goalDate,
      categoryId,
    };

    try {
      if (initialData?.id) {
        await axios.put(
          `http://localhost:3001/api/goals/${initialData.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Objetivo atualizado com sucesso!');
      } else {
        await axios.post('http://localhost:3001/api/goals', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Objetivo cadastrado com sucesso!');
      }

      if (onObjectiveSaved) onObjectiveSaved();
    } catch (err) {
      toast.error('Erro ao salvar objetivo');
      console.error(err);
    }
  };

  const OBJECTIVE_TEMPLATES = [
    { label: "🚗 Novo Carro", name: "Novo Carro", category: "Transporte" },
    { label: "🏠 Nova Casa", name: "Nova Casa", category: "Moradia" },
    { label: "✈️ Viagem de Férias", name: "Viagem de Férias", category: "Lazer" },
    { label: "🎓 Educação", name: "Educação", category: "Educação" },
    { label: "💰 Fundo de Emergência", name: "Fundo de emergência", category: "Reserva" },
    { label: "❤️ Saúde", name: "Saúde", category: "Saúde" },
    { label: "🎉 Festa", name: "Festa", category: "Eventos" },
    { label: "👶 Filhos", name: "Filhos", category: "Família" },
    { label: "🏖️ Aposentadoria", name: "Aposentadoria", category: "Investimentos" },
    { label: "💳 Quitar uma dívida", name: "Quitar uma dívida", category: "Dívidas" },
  ];

  const handleTemplateChange = (e) => {
    const selected = OBJECTIVE_TEMPLATES.find((m) => m.label === e.target.value);
    if (selected) {
      setName(selected.name);
      const match = categories.find((c) => c.name.toLowerCase() === selected.category.toLowerCase());
      if (match) setCategoryId(match.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initialData && (
        <div>
          <label className="block text-gray-700">Tipo de Objetivo</label>
          <select
            className="w-full border px-3 py-2 rounded"
            defaultValue=""
            onChange={handleTemplateChange}
          >
            <option value="">Selecione um modelo sugerido</option>
            {OBJECTIVE_TEMPLATES.map((opt) => (
              <option key={opt.label} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-gray-700">Nome do Objetivo</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-gray-700">Valor do Objetivo (R$)</label>
        <input
          type="text"
          inputMode="numeric"
          className="w-full border px-3 py-2 rounded"
          value={targetValue}
          onChange={(e) => setTargetValue(formatCurrencyInput(e.target.value))}
          required
          placeholder="Ex: 8000,00"
        />
      </div>

      <div>
        <label className="block text-gray-700">Data Limite</label>
        <input
          type="date"
          className="w-full border px-3 py-2 rounded"
          value={goalDate}
          onChange={(e) => setGoalDate(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {initialData ? 'Atualizar Objetivo' : 'Salvar Objetivo'}
        </button>
      </div>
    </form>
  );
};

export default ObjectiveForm;

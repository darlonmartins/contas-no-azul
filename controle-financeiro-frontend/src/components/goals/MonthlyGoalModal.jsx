import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const formatCurrencyInput = (value) => {
  const numeric = value.replace(/\D/g, '');
  if (!numeric) return '';
  const formatted = (Number(numeric) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  return formatted;
};

const MonthlyGoalModal = ({ goal, onClose, onSaved }) => {
  const [month, setMonth] = useState(
    goal?.month ? goal.month.slice(0, 7) : dayjs().format("YYYY-MM")
  );

  const [amount, setAmount] = useState(
    goal?.amount
      ? Number(goal.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : ''
  );
  const [categoryId, setCategoryId] = useState(goal?.categoryId || '');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!month || !amount || !categoryId) {
      toast.error('Preencha todos os campos.');
      return;
    }

    const payload = {
      month,
      amount: parseFloat(
        amount.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')
      ),
      categoryId,
    };

    try {
      if (goal) {
        await api.put(`/monthly-goals/${goal.id}`, payload);
        toast.success('Meta atualizada com sucesso!');
      } else {
        await api.post('/monthly-goals', payload);
        toast.success('Meta criada com sucesso!');
      }
      onClose();
      onSaved();
    } catch (err) {
      toast.error('Erro ao salvar meta.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{goal ? 'Editar Meta' : 'Nova Meta'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Mês</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">Valor (R$)</label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: R$ 800,00"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {goal ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonthlyGoalModal;

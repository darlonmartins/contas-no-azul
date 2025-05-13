import React, { useState } from 'react';
import api from '../services/api';
import axios from 'axios';

const ExpenseForm = ({ onExpenseSaved }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    categoryId: '',
    installments: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'installments' ? parseInt(value) : value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await api.post('/expenses', formData);
    onExpenseSaved(); // callback para recarregar lista
    setFormData({
      description: '',
      amount: '',
      date: '',
      categoryId: '',
      installments: 1,
    });
  } catch (err) {
    console.error('Erro ao salvar despesa:', err);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-10">
      <div>
        <label className="block">Descrição</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block">Valor</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block">Data</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block">Categoria</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Selecione...</option>
          <option value="1">Alimentação</option>
          <option value="2">Transporte</option>
          <option value="3">Saúde</option>
        </select>
      </div>

      <div>
        <label className="block">Parcelas</label>
        <input
          type="number"
          name="installments"
          value={formData.installments}
          onChange={handleChange}
          min="1"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Salvar Despesa
      </button>
    </form>
  );
};

export default ExpenseForm;

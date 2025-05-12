import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/expenses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Despesas</h1>
      <ExpenseForm onExpenseSaved={fetchExpenses} />
      <h2 className="text-xl font-semibold mb-2">Lista de Despesas</h2>
      <ExpenseList expenses={expenses} />
    </div>
  );
};

export default Expenses;

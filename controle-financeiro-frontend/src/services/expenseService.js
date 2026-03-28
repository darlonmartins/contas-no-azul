import api from './api';

/**
 * Busca transações do tipo despesa.
 * Usa o endpoint correto /transactions (o antigo /expenses não existe no backend).
 */
export const getExpenses = async (params = {}) => {
  const response = await api.get('/transactions', { params: { ...params, type: 'expense' } });
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post('/transactions', data);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id) => {
  await api.delete(`/transactions/${id}`);
};

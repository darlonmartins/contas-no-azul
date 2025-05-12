import api from './api';

export const getGoals = async () => {
  const response = await api.get('/goals');
  return response.data;
};

export const createGoal = async (data) => {
  const response = await api.post('/goals', data);
  return response.data;
};

import api from './api';

export const getDashboardData = async (params = {}) => {
  const response = await api.get('/dashboard', { params });
  return response.data;
};

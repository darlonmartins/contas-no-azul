import api from './api';

export const getFixedExpenses = () => api.get('/fixed-expenses');

export const cancelFutureFixed = (fixedGroupId) =>
  api.delete(`/fixed-expenses/${fixedGroupId}/future`);

export const deleteAllFixed = (fixedGroupId) =>
  api.delete(`/fixed-expenses/${fixedGroupId}/all`);

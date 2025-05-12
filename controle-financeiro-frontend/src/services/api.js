import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// ✅ Interceptor que adiciona o token automaticamente a cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token adicionado ao header:', token);
    } else {
      console.warn('⚠️ Nenhum token encontrado no localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

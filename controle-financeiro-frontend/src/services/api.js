import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ variável de ambiente usada
});

// ✅ Interceptor para adicionar token automaticamente em cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token adicionado ao header:', token);
    } else {
      console.warn('⚠️ Nenhum token encontrado no localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

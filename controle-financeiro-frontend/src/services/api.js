import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    // 🔍 LOGA URL e PARAMS antes de enviar
    console.log("🛰️ REQUEST:", config.method?.toUpperCase(), config.url, "params:", config.params);

    // 🔑 Token
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token adicionado ao header:', token);
    } else {
      console.warn('⚠️ Nenhum token encontrado no sessionStorage nem localStorage');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

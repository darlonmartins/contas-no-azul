/**
 * services/auth.js
 *
 * Serviço de autenticação do frontend.
 * Centraliza login, registro, logout e leitura do usuário logado.
 *
 * ATENÇÃO: authService.js era duplicata deste arquivo e foi removido.
 * Todos os imports devem apontar para './auth' ou '../services/auth'.
 */

import api from './api';

/**
 * Realiza o login e armazena o token conforme a preferência do usuário.
 * @param {string} email
 * @param {string} password
 * @param {boolean} remember - true = localStorage, false = sessionStorage
 */
export const login = async (email, password, remember = false) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data;

  if (token) {
    if (remember) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    if (user?.name) {
      localStorage.setItem('userName', user.name);
    }
  }

  return response.data;
};

/**
 * Registra um novo usuário. Não armazena token automaticamente —
 * redirecione para /login após o cadastro.
 */
export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

/**
 * Limpa todos os dados de sessão e redireciona para /login.
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  sessionStorage.removeItem('token');
  window.location.href = '/login';
};

/**
 * Retorna o token armazenado (sessionStorage tem prioridade).
 */
export const getToken = () =>
  sessionStorage.getItem('token') || localStorage.getItem('token');

/**
 * Retorna true se houver token armazenado.
 */
export const isAuthenticated = () => !!getToken();

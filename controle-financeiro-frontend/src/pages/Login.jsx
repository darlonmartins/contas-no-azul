import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import PublicHeader from '../components/layout/PublicHeader';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token;

      if (!token) {
        setError('Erro ao fazer login. Tente novamente.');
        return;
      }

      if (remember) {
        localStorage.setItem('token', token); 
      } else {
        sessionStorage.setItem('token', token); 
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Erro no login:', err);
      const mensagem = err.response?.data?.message || 'Erro ao fazer login.';
      setError(mensagem);
    }
  };

  const handleGoogleLogin = () => {
    const fakeToken = 'token-google';
    localStorage.setItem('token', fakeToken);
    navigate('/dashboard');
  };

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md mt-8">
          <h2 className="text-3xl font-bold text-center mb-2">Entrar</h2>
          <p className="text-center text-gray-600 mb-6 text-base">
            Acesse sua conta para gerenciar suas finanças
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 text-base">
            <div>
              <label className="block font-medium text-gray-800 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full border rounded-lg py-2 px-3 focus:border-blue-500 placeholder-gray-400 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="relative">
                <label className="block font-medium text-gray-800 mb-1">Senha</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  className="w-full border rounded-lg py-2 px-3 pr-10 focus:border-blue-500 placeholder-gray-400 text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div
                  className="absolute top-9 right-3 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-blue-500 text-sm hover:underline"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </div>

            <div className="flex items-center text-base">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="remember" className="text-gray-700">Lembrar-me</label>
            </div>

            {error && <p className="text-base text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold flex justify-center items-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Entrar
            </button>
          </form>

          <button
            onClick={handleGoogleLogin}
            className="mt-4 w-full border border-gray-300 hover:bg-gray-100 text-gray-800 py-2 rounded-lg font-medium flex justify-center items-center gap-2"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Entrar com Google
          </button>

          <p className="mt-6 text-center text-base text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-blue-500 hover:underline">Criar conta</Link>
          </p>

          <div className="mt-6 text-xs text-center text-gray-400 border-t pt-4">
            © 2025 Controle Financeiro. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-center">Recuperar Senha</h3>
            <p className="text-gray-600 text-sm mb-4 text-center">
              Informe seu e-mail cadastrado para enviarmos instruções.
            </p>

            <input
              type="email"
              placeholder="Seu e-mail"
              className="w-full border rounded-lg py-2 px-3 focus:border-blue-500 placeholder-gray-400 text-base mb-4"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />

            {forgotMessage && (
              <p className="text-green-600 text-sm mb-2 text-center">{forgotMessage}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
                onClick={() => {
                  if (forgotEmail.trim() === '') {
                    alert('Por favor, preencha seu e-mail.');
                    return;
                  }
                  setForgotMessage('E-mail de recuperação enviado!');
                  setTimeout(() => {
                    setShowForgotModal(false);
                    setForgotMessage('');
                    setForgotEmail('');
                  }, 2000);
                }}
              >
                Enviar
              </button>

              <button
                type="button"
                className="w-full border border-gray-300 hover:bg-gray-100 text-gray-800 py-2 rounded-lg font-semibold"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotEmail('');
                  setForgotMessage('');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;

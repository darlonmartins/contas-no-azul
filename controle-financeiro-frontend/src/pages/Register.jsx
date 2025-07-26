import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import PublicHeader from '../components/layout/PublicHeader';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Você precisa aceitar os termos para continuar.');
      return;
    }

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      alert('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (err) {
      console.error('Erro no cadastro:', err);
      const mensagem = err.response?.data?.message || 'Erro ao cadastrar. Verifique os dados.';
      setError(mensagem);
    }
  };

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md mt-8">
          <h2 className="text-3xl font-bold text-center mb-2">Criar Conta</h2>
          <p className="text-center text-gray-600 mb-6 text-base">
            Comece a controlar suas finanças hoje mesmo
          </p>

          {error && <p className="text-base text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5 text-base">
            <div>
              <label className="block font-medium text-gray-800 mb-1">Nome Completo</label>
              <input
                type="text"
                name="name"
                placeholder="Digite seu nome completo"
                className="w-full border rounded-lg py-2 px-3 focus:border-blue-500 placeholder-gray-400 text-base"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block font-medium text-gray-800 mb-1">E-mail</label>
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
                className="w-full border rounded-lg py-2 px-3 focus:border-blue-500 placeholder-gray-400 text-base"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <label className="block font-medium text-gray-800 mb-1">Senha</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Crie uma senha segura"
                className="w-full border rounded-lg py-2 px-3 pr-10 focus:border-blue-500 placeholder-gray-400 text-base"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div
                className="absolute top-9 right-3 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </div>
            </div>

            <div className="relative">
              <label className="block font-medium text-gray-800 mb-1">Confirmar Senha</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirme sua senha"
                className="w-full border rounded-lg py-2 px-3 pr-10 focus:border-blue-500 placeholder-gray-400 text-base"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <div
                className="absolute top-9 right-3 cursor-pointer text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </div>
            </div>

            <div className="flex items-start text-base">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mr-2 mt-1"
              />
              <label htmlFor="termsAccepted" className="text-gray-700">
                Concordo com os{' '}
                <Link to="#" className="text-blue-500 hover:underline">Termos de Uso</Link> e{' '}
                <Link to="#" className="text-blue-500 hover:underline">Política de Privacidade</Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold flex justify-center items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Criar Conta
            </button>

            <div className="relative my-4">
              <hr className="border-t border-gray-300" />
              <span className="absolute bg-white px-2 text-sm text-gray-500 left-1/2 transform -translate-x-1/2 -top-3">ou</span>
            </div>

            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <div className="flex justify-center">
                <GoogleLogin
                  text="signup_with"
                  onSuccess={async (credentialResponse) => {
                    try {
                      const credential = credentialResponse.credential;
                      const response = await api.post('/auth/google-login', { credential });
                      const { token, user } = response.data;

                      localStorage.setItem('token', token);
                      localStorage.setItem('userName', user.name);

                      navigate('/dashboard');
                    } catch (err) {
                      console.error('Erro no login com Google:', err);
                      alert('Erro ao autenticar com Google');
                    }
                  }}
                  onError={() => {
                    alert('Erro ao autenticar com Google');
                  }}
                />
              </div>
            </GoogleOAuthProvider>


            <p className="text-center text-base text-gray-600 mt-2">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-500 hover:underline">Fazer login</Link>
            </p>
          </form>

          <div className="mt-6 text-xs text-center text-gray-400 border-t pt-4">
            Ao criar uma conta, você terá acesso gratuito por 7 dias a todas as funcionalidades do sistema.
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

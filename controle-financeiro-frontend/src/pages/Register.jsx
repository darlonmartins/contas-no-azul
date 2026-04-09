import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, LayoutDashboard, CheckCircle2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/login');
    } catch (err) {
      const mensagem = err.response?.data?.message || 'Erro ao cadastrar. Verifique os dados.';
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

        .reg-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
        }

        /* ── Painel esquerdo ── */
        .reg-panel {
          width: 42%;
          background: #0f172a;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }
        .reg-panel::before {
          content: '';
          position: absolute;
          width: 480px; height: 480px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 70%);
          top: -120px; left: -120px; pointer-events: none;
        }
        .reg-panel::after {
          content: '';
          position: absolute;
          width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
          bottom: -80px; right: -80px; pointer-events: none;
        }
        .reg-logo {
          display: flex; align-items: center; gap: 10px;
          color: #fff; font-size: 16px; font-weight: 500;
          letter-spacing: -0.3px; position: relative; z-index: 1;
          text-decoration: none;
        }
        .reg-hero { position: relative; z-index: 1; }
        .reg-hero h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 38px; line-height: 1.15; color: #fff;
          margin: 0 0 16px; font-weight: 400;
        }
        .reg-hero h1 em { font-style: italic; color: #6ee7b7; }
        .reg-hero p { color: #94a3b8; font-size: 15px; line-height: 1.65; margin: 0 0 32px; max-width: 300px; }

        .reg-trial {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 20px 22px;
          position: relative; z-index: 1; margin-bottom: 0;
        }
        .reg-trial-title {
          font-size: 13px; font-weight: 600; color: #6ee7b7;
          letter-spacing: 0.5px; margin-bottom: 14px;
          text-transform: uppercase;
        }
        .reg-trial-items { display: flex; flex-direction: column; gap: 10px; }
        .reg-trial-item {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: #cbd5e1;
        }

        .reg-bottom { position: relative; z-index: 1; }
        .reg-bottom p { font-size: 13px; color: #475569; }

        /* ── Painel direito ── */
        .reg-form-panel {
          flex: 1; background: #f8fafc;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 40px; overflow-y: auto;
        }
        .reg-form-card { width: 100%; max-width: 400px; }
        .reg-form-header { margin-bottom: 28px; }
        .reg-form-header h2 {
          font-size: 24px; font-weight: 600; color: #0f172a;
          margin: 0 0 6px; letter-spacing: -0.4px;
        }
        .reg-form-header p { color: #64748b; font-size: 14px; margin: 0; }
        .reg-form-header p a { color: #3b82f6; text-decoration: none; font-weight: 500; }
        .reg-form-header p a:hover { text-decoration: underline; }

        .reg-field { margin-bottom: 16px; }
        .reg-field label {
          display: block; font-size: 13px; font-weight: 500;
          color: #374151; margin-bottom: 6px;
        }
        .reg-field-wrap { position: relative; }
        .reg-field input[type=text],
        .reg-field input[type=email],
        .reg-field input[type=password] {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #0f172a; background: #fff; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .reg-field input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .reg-field input::placeholder { color: #94a3b8; }
        .reg-field input.has-toggle { padding-right: 44px; }
        .reg-toggle {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%); background: none;
          border: none; cursor: pointer; color: #94a3b8;
          display: flex; align-items: center; padding: 0;
        }
        .reg-toggle:hover { color: #64748b; }

        .reg-strength { margin-top: 6px; }
        .reg-strength-bar {
          height: 3px; border-radius: 99px; background: #f1f5f9;
          overflow: hidden; margin-bottom: 4px;
        }
        .reg-strength-fill {
          height: 100%; border-radius: 99px;
          transition: width 0.3s, background 0.3s;
        }
        .reg-strength-label { font-size: 11px; }

        .reg-terms {
          display: flex; align-items: flex-start; gap: 8px;
          margin-bottom: 20px;
        }
        .reg-terms input[type=checkbox] {
          width: 15px; height: 15px; accent-color: #3b82f6;
          cursor: pointer; margin-top: 2px; flex-shrink: 0;
        }
        .reg-terms label { font-size: 13px; color: #64748b; cursor: pointer; line-height: 1.5; }
        .reg-terms label a { color: #3b82f6; text-decoration: none; font-weight: 500; }
        .reg-terms label a:hover { text-decoration: underline; }

        .reg-error {
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; font-size: 13px; padding: 10px 14px;
          border-radius: 8px; margin-bottom: 16px;
        }

        .reg-submit {
          width: 100%; padding: 12px; background: #0f172a; color: #fff;
          border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, transform 0.1s; letter-spacing: 0.1px;
        }
        .reg-submit:hover { background: #1e293b; }
        .reg-submit:active { transform: scale(0.99); }
        .reg-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .reg-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0; color: #cbd5e1; font-size: 12px;
        }
        .reg-divider::before, .reg-divider::after {
          content: ''; flex: 1; height: 1px; background: #e2e8f0;
        }

        .reg-google { display: flex; justify-content: center; }

        .reg-footer {
          text-align: center; font-size: 12px; color: #94a3b8; margin-top: 28px;
          padding-top: 20px; border-top: 1px solid #e2e8f0;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .reg-panel { display: none; }
          .reg-form-panel { padding: 32px 24px; }
        }
      `}</style>

      <div className="reg-root">
        {/* Painel esquerdo */}
        <div className="reg-panel">
          <Link to="/" className="reg-logo">
            <LayoutDashboard size={18} color="#93c5fd" />
            Contas no Azul
          </Link>

          <div className="reg-hero">
            <h1>Comece <em>grátis,</em><br />sem compromisso.</h1>
            <p>7 dias de acesso completo a todas as funcionalidades. Sem cartão de crédito.</p>

            <div className="reg-trial">
              <div className="reg-trial-title">O que você ganha</div>
              <div className="reg-trial-items">
                {[
                  'Dashboard com visão financeira completa',
                  'Controle de cartões e faturas',
                  'Objetivos e metas financeiras',
                  'Alertas inteligentes',
                  'Relatórios em PDF',
                ].map(item => (
                  <div className="reg-trial-item" key={item}>
                    <CheckCircle2 size={15} color="#6ee7b7" style={{ flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="reg-bottom">
            <p>© 2025 Contas no Azul · Todos os direitos reservados</p>
          </div>
        </div>

        {/* Painel direito */}
        <div className="reg-form-panel">
          <div className="reg-form-card">
            <div className="reg-form-header">
              <h2>Criar sua conta</h2>
              <p>Já tem conta? <Link to="/login">Fazer login</Link></p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="reg-field">
                <label>Nome completo</label>
                <div className="reg-field-wrap">
                  <input
                    type="text" name="name" id="input-name"
                    placeholder="Seu nome completo"
                    value={formData.name} onChange={handleChange} required
                  />
                </div>
              </div>

              <div className="reg-field">
                <label>E-mail</label>
                <div className="reg-field-wrap">
                  <input
                    type="email" name="email" id="input-email"
                    placeholder="seu@email.com"
                    value={formData.email} onChange={handleChange} required
                  />
                </div>
              </div>

              <div className="reg-field">
                <label>Senha</label>
                <div className="reg-field-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" id="input-password"
                    placeholder="Mínimo 8 caracteres"
                    className="has-toggle"
                    value={formData.password} onChange={handleChange} required
                  />
                  <button type="button" className="reg-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="reg-strength">
                    <div className="reg-strength-bar">
                      <div className="reg-strength-fill" style={{
                        width: formData.password.length < 6 ? '25%' : formData.password.length < 10 ? '60%' : '100%',
                        background: formData.password.length < 6 ? '#ef4444' : formData.password.length < 10 ? '#f59e0b' : '#22c55e',
                      }} />
                    </div>
                    <span className="reg-strength-label" style={{
                      color: formData.password.length < 6 ? '#ef4444' : formData.password.length < 10 ? '#f59e0b' : '#22c55e'
                    }}>
                      {formData.password.length < 6 ? 'Senha fraca' : formData.password.length < 10 ? 'Senha média' : 'Senha forte'}
                    </span>
                  </div>
                )}
              </div>

              <div className="reg-field">
                <label>Confirmar senha</label>
                <div className="reg-field-wrap">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword" id="input-confirm-password"
                    placeholder="Repita sua senha"
                    className="has-toggle"
                    value={formData.confirmPassword} onChange={handleChange} required
                  />
                  <button type="button" className="reg-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>As senhas não coincidem</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>✓ Senhas coincidem</p>
                )}
              </div>

              <div className="reg-terms">
                <input
                  type="checkbox" id="checkbox-terms" name="termsAccepted"
                  checked={formData.termsAccepted} onChange={handleChange}
                />
                <label htmlFor="checkbox-terms">
                  Concordo com os <a href="#">Termos de Uso</a> e a <a href="#">Política de Privacidade</a>
                </label>
              </div>

              {error && <div className="reg-error">{error}</div>}

              <button type="submit" className="reg-submit" disabled={loading}>
                {loading ? 'Criando conta...' : (<>Criar conta grátis <ArrowRight size={15} /></>)}
              </button>
            </form>

            <div className="reg-divider">ou cadastre-se com</div>

            <div className="reg-google">
              <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  text="signup_with"
                  data-testid="google-register"
                  onSuccess={async (credentialResponse) => {
                    try {
                      const response = await api.post('/auth/google-login', { credential: credentialResponse.credential });
                      const { token, user } = response.data;
                      localStorage.setItem('token', token);
                      localStorage.setItem('userName', user.name);
                      navigate('/dashboard');
                    } catch {
                      setError('Erro ao autenticar com Google.');
                    }
                  }}
                  onError={() => setError('Erro ao autenticar com Google.')}
                />
              </GoogleOAuthProvider>
            </div>

            <div className="reg-footer">
              Ao criar uma conta você terá acesso gratuito por 7 dias a todas as funcionalidades.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

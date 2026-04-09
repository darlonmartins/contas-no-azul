import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { LayoutDashboard } from 'lucide-react';


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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token;
      if (!token) { setError('Erro ao fazer login. Tente novamente.'); setLoading(false); return; }
      if (remember) { localStorage.setItem('token', token); } else { sessionStorage.setItem('token', token); }
      const user = response.data.user;
      localStorage.setItem('userName', user?.name || 'Usuário');
      navigate('/dashboard');
    } catch (err) {
      const mensagem = err.response?.data?.message || 'E-mail ou senha incorretos.';
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        .login-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
        }

        /* ── Painel esquerdo ── */
        .login-panel {
          width: 45%;
          background: #0f172a;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }
        .login-panel::before {
          content: '';
          position: absolute;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
          top: -120px;
          left: -120px;
          pointer-events: none;
        }
        .login-panel::after {
          content: '';
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%);
          bottom: -80px;
          right: -80px;
          pointer-events: none;
        }
        .panel-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: -0.3px;
          position: relative;
          z-index: 1;
        }
        .panel-logo-dot {
          width: 28px;
          height: 28px;
          background: #3b82f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .panel-logo-dot svg {
          width: 16px;
          height: 16px;
          fill: none;
          stroke: #fff;
          stroke-width: 2;
          stroke-linecap: round;
        }
        .panel-hero {
          position: relative;
          z-index: 1;
        }
        .panel-hero h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 42px;
          line-height: 1.15;
          color: #fff;
          margin: 0 0 16px;
          font-weight: 400;
        }
        .panel-hero h1 em {
          font-style: italic;
          color: #93c5fd;
        }
        .panel-hero p {
          color: #94a3b8;
          font-size: 15px;
          line-height: 1.65;
          margin: 0;
          max-width: 320px;
        }
        .panel-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .panel-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #cbd5e1;
          font-size: 14px;
        }
        .panel-feature-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Painel direito ── */
        .form-panel {
          flex: 1;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }
        .form-card {
          width: 100%;
          max-width: 400px;
        }
        .form-header {
          margin-bottom: 36px;
        }
        .form-header h2 {
          font-size: 26px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }
        .form-header p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }
        .form-header p a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }
        .form-header p a:hover { text-decoration: underline; }

        .field { margin-bottom: 18px; }
        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
          letter-spacing: 0.1px;
        }
        .field-wrap { position: relative; }
        .field input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #0f172a;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .field input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .field input::placeholder { color: #94a3b8; }
        .field input.has-toggle { padding-right: 44px; }
        .toggle-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          padding: 0;
        }
        .toggle-btn:hover { color: #64748b; }

        .field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }
        .remember-wrap {
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
        }
        .remember-wrap input[type=checkbox] {
          width: 15px;
          height: 15px;
          accent-color: #3b82f6;
          cursor: pointer;
        }
        .remember-wrap span {
          font-size: 13px;
          color: #64748b;
        }
        .forgot-btn {
          background: none;
          border: none;
          font-size: 13px;
          color: #3b82f6;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
          font-weight: 500;
        }
        .forgot-btn:hover { text-decoration: underline; }

        .error-msg {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background: #0f172a;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s;
          letter-spacing: 0.1px;
        }
        .submit-btn:hover { background: #1e293b; }
        .submit-btn:active { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: #cbd5e1;
          font-size: 12px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .google-wrap {
          display: flex;
          justify-content: center;
        }

        .loading-hint {
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          margin-top: 12px;
        }

        .footer-note {
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          margin-top: 32px;
        }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          backdrop-filter: blur(2px);
        }
        .modal-card {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .modal-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.3px;
        }
        .modal-card p {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 20px;
          line-height: 1.5;
        }
        .modal-actions { display: flex; gap: 10px; margin-top: 4px; }
        .modal-btn-primary {
          flex: 1;
          padding: 11px;
          background: #0f172a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s;
        }
        .modal-btn-primary:hover { background: #1e293b; }
        .modal-btn-secondary {
          flex: 1;
          padding: 11px;
          background: #fff;
          color: #374151;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s;
        }
        .modal-btn-secondary:hover { background: #f8fafc; }
        .success-msg {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        /* ── Responsivo ── */
        @media (max-width: 768px) {
          .login-panel { display: none; }
          .form-panel { padding: 32px 24px; }
        }
      `}</style>

      <div className="login-root">
        {/* Painel esquerdo */}
        <div className="login-panel">
<Link to="/" className="panel-logo">
  <LayoutDashboard size={20} style={{ color: '#93c5fd' }} />
  Contas no Azul
</Link>

          <div className="panel-hero">
            <h1>Suas finanças,<br /><em>sob controle.</em></h1>
            <p>Registre receitas, despesas e transferências. Acompanhe seus objetivos e mantenha o saldo sempre no azul.</p>
          </div>

          <div className="panel-features">
            {[
              { icon: '💳', text: 'Controle de cartões e faturas' },
              { icon: '📊', text: 'Dashboard com visão mensal' },
              { icon: '🎯', text: 'Metas e objetivos financeiros' },
            ].map((f) => (
              <div className="panel-feature" key={f.text}>
                <div className="panel-feature-icon">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Painel direito */}
        <div className="form-panel">
          <div className="form-card">
            <div className="form-header">
              <h2>Bem-vindo de volta</h2>
              <p>Não tem conta? <Link to="/register">Criar gratuitamente</Link></p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>E-mail</label>
                <div className="field-wrap">
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Senha</label>
                <div className="field-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    className="has-toggle"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="field-row">
                <label className="remember-wrap">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Lembrar-me</span>
                </label>
                <button type="button" className="forgot-btn" onClick={() => setShowForgotModal(true)}>
                  Esqueceu sua senha?
                </button>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Entrando...' : (<>Entrar <ArrowRight size={15} /></>)}
              </button>

              {loading && (
                <p className="loading-hint">⏳ Aguarde, conectando ao servidor...</p>
              )}
            </form>

            <div className="divider">ou continue com</div>

            <div className="google-wrap">
              <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      setLoading(true);
                      const response = await api.post('/auth/google-login', { credential: credentialResponse.credential });
                      const { token, user } = response.data;
                      if (remember) { localStorage.setItem('token', token); } else { sessionStorage.setItem('token', token); }
                      localStorage.setItem('userName', user?.name || 'Usuário');
                      navigate('/dashboard');
                    } catch (err) {
                      setError('Erro ao autenticar com Google.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={() => setError('Erro ao autenticar com Google.')}
                />
              </GoogleOAuthProvider>
            </div>

            <div className="footer-note">© 2025 Contas no Azul · Todos os direitos reservados</div>
          </div>
        </div>
      </div>

      {/* Modal recuperação de senha */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Recuperar senha</h3>
            <p>Informe seu e-mail cadastrado e enviaremos as instruções de recuperação.</p>

            <div className="field">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {forgotMessage && <div className="success-msg">{forgotMessage}</div>}

            <div className="modal-actions">
              <button
                className="modal-btn-primary"
                onClick={() => {
                  if (!forgotEmail.trim()) { alert('Preencha seu e-mail.'); return; }
                  setForgotMessage('E-mail de recuperação enviado!');
                  setTimeout(() => { setShowForgotModal(false); setForgotMessage(''); setForgotEmail(''); }, 2000);
                }}
              >
                Enviar
              </button>
              <button className="modal-btn-secondary" onClick={() => { setShowForgotModal(false); setForgotEmail(''); setForgotMessage(''); }}>
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

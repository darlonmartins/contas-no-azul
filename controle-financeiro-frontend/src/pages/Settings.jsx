import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Sun, Moon, Monitor, Lock, Bell, User, Download,
  CheckCircle2, AlertCircle, Eye, EyeOff, ChevronRight,
} from 'lucide-react';

// ── Dark mode helper ──────────────────────────────────────────
const getTheme = () => localStorage.getItem('theme') || 'system';
const applyTheme = (theme) => {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (theme === 'dark' || (theme === 'system' && prefersDark)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
};

const Settings = () => {
  const [theme, setTheme] = useState(getTheme());
  const [frequency, setFrequency] = useState('mensal');
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  const [loading, setLoading] = useState({});

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const setLoad = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

  // ── Fetch inicial ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, userRes] = await Promise.all([
          api.get('/settings'),
          api.get('/users/me'),
        ]);
        if (settingsRes.data?.notificationFrequency) {
          setFrequency(settingsRes.data.notificationFrequency);
        }
        if (userRes.data) {
          setProfile({ name: userRes.data.name || '', email: userRes.data.email || '' });
        }
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
      }
    };
    fetchData();
  }, []);

  // ── Tema ──
  const handleTheme = (t) => {
    setTheme(t);
    applyTheme(t);
    showToast('success', 'Tema atualizado!');
  };

  // ── Notificações ──
  const handleNotifications = async () => {
    setLoad('notif', true);
    try {
      await api.put('/settings', { notificationFrequency: frequency });
      showToast('success', 'Frequência de notificações atualizada!');
    } catch {
      showToast('error', 'Erro ao atualizar notificações.');
    } finally {
      setLoad('notif', false);
    }
  };

  // ── Perfil ──
  const handleProfile = async (e) => {
    e.preventDefault();
    setLoad('profile', true);
    try {
      await api.put('/users/me', { name: profile.name });
      localStorage.setItem('userName', profile.name);
      window.dispatchEvent(new Event('userNameUpdated'));
      showToast('success', 'Perfil atualizado!');
    } catch {
      showToast('error', 'Erro ao atualizar perfil.');
    } finally {
      setLoad('profile', false);
    }
  };

  // ── Senha ──
  const handlePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      showToast('error', 'As novas senhas não coincidem.');
      return;
    }
    if (passwords.next.length < 6) {
      showToast('error', 'A nova senha deve ter ao menos 6 caracteres.');
      return;
    }
    setLoad('password', true);
    try {
      await api.put('/users/password', {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPasswords({ current: '', next: '', confirm: '' });
      showToast('success', 'Senha alterada com sucesso!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Erro ao alterar senha.');
    } finally {
      setLoad('password', false);
    }
  };

  // ── Export PDF ──
  const handleExport = async () => {
    setLoad('export', true);
    try {
      const res = await api.get('/pdf/monthly-report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'relatorio.pdf'; a.click();
      window.URL.revokeObjectURL(url);
      showToast('success', 'PDF exportado!');
    } catch {
      showToast('error', 'Erro ao exportar PDF.');
    } finally {
      setLoad('export', false);
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark',  label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ];

  const freqOptions = [
    { value: 'diaria',  label: 'Diária' },
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensal',  label: 'Mensal' },
    { value: 'nenhuma', label: 'Nenhuma' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .st { font-family: 'DM Sans', sans-serif; max-width: 680px; }
        .st-section {
          background: #fff; border: 1px solid #f1f5f9;
          border-radius: 16px; margin-bottom: 20px; overflow: hidden;
        }
        .st-section-header {
          display: flex; align-items: center; gap: 10px;
          padding: 18px 24px; border-bottom: 1px solid #f8fafc;
        }
        .st-section-icon {
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .st-section-title { font-size: 15px; font-weight: 600; color: #0f172a; letter-spacing: -0.2px; }
        .st-section-desc { font-size: 13px; color: #94a3b8; margin-top: 1px; }
        .st-section-body { padding: 20px 24px; }

        .st-label { font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; display: block; }
        .st-input {
          width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0;
          border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #0f172a; background: #fff; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
        }
        .st-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .st-input::placeholder { color: #94a3b8; }
        .st-input.has-toggle { padding-right: 44px; }
        .st-pw-wrap { position: relative; }
        .st-pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0;
          display: flex; align-items: center;
        }
        .st-pw-toggle:hover { color: #64748b; }

        .st-field { margin-bottom: 14px; }
        .st-field:last-child { margin-bottom: 0; }

        .st-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .st-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 20px; border-radius: 9px; border: none;
          font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .st-btn-primary { background: #0f172a; color: #fff; }
        .st-btn-primary:hover { background: #1e293b; }
        .st-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .st-btn-outline { background: #fff; color: #374151; border: 1.5px solid #e2e8f0; }
        .st-btn-outline:hover { background: #f8fafc; }
        .st-btn-outline:disabled { opacity: 0.6; cursor: not-allowed; }

        .st-theme-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .st-theme-option {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 14px 10px; border-radius: 10px; border: 1.5px solid #e2e8f0;
          cursor: pointer; transition: all 0.15s; background: #fff;
          font-size: 13px; font-weight: 500; color: #374151; font-family: 'DM Sans', sans-serif;
        }
        .st-theme-option:hover { border-color: #cbd5e1; background: #f8fafc; }
        .st-theme-option.active { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }

        .st-freq-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px; }
        .st-freq-option {
          padding: 9px 8px; border-radius: 8px; border: 1.5px solid #e2e8f0;
          text-align: center; font-size: 13px; font-weight: 500; color: #374151;
          cursor: pointer; transition: all 0.15s; background: #fff; font-family: 'DM Sans', sans-serif;
        }
        .st-freq-option:hover { border-color: #cbd5e1; background: #f8fafc; }
        .st-freq-option.active { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }

        .st-divider { height: 1px; background: #f8fafc; margin: 16px 0; }

        .st-toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 999;
          display: flex; align-items: center; gap: 10px;
          padding: 12px 18px; border-radius: 10px;
          font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          animation: slideUp 0.2s ease;
        }
        .st-toast.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .st-toast.error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .st-page-title { font-size: 22px; font-weight: 600; color: #0f172a; letter-spacing: -0.4px; margin-bottom: 24px; }

        @media (max-width: 600px) {
          .st-row { grid-template-columns: 1fr; }
          .st-freq-grid { grid-template-columns: repeat(2, 1fr); }
          .st-theme-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <div className="st">
        <h1 className="st-page-title">Configurações</h1>

        {/* ── Aparência ── */}
        <div className="st-section">
          <div className="st-section-header">
            <div className="st-section-icon" style={{ background: '#eff6ff' }}>
              <Sun size={17} color="#3b82f6" />
            </div>
            <div>
              <div className="st-section-title">Aparência</div>
              <div className="st-section-desc">Escolha o tema da interface</div>
            </div>
          </div>
          <div className="st-section-body">
            <div className="st-theme-grid">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  className={`st-theme-option${theme === value ? ' active' : ''}`}
                  onClick={() => handleTheme(value)}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>
              O modo "Sistema" acompanha a preferência do seu dispositivo automaticamente.
            </p>
          </div>
        </div>

        {/* ── Perfil ── */}
        <div className="st-section">
          <div className="st-section-header">
            <div className="st-section-icon" style={{ background: '#f5f3ff' }}>
              <User size={17} color="#8b5cf6" />
            </div>
            <div>
              <div className="st-section-title">Perfil</div>
              <div className="st-section-desc">Atualize suas informações pessoais</div>
            </div>
          </div>
          <form className="st-section-body" onSubmit={handleProfile}>
            <div className="st-row">
              <div className="st-field">
                <label className="st-label">Nome</label>
                <input
                  className="st-input"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Seu nome"
                />
              </div>
              <div className="st-field">
                <label className="st-label">E-mail</label>
                <input
                  className="st-input"
                  value={profile.email}
                  disabled
                  style={{ background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}
                  title="O e-mail não pode ser alterado"
                />
              </div>
            </div>
            <button type="submit" className="st-btn st-btn-primary" disabled={loading.profile}>
              {loading.profile ? 'Salvando...' : 'Salvar perfil'}
            </button>
          </form>
        </div>

        {/* ── Senha ── */}
        <div className="st-section">
          <div className="st-section-header">
            <div className="st-section-icon" style={{ background: '#fef2f2' }}>
              <Lock size={17} color="#ef4444" />
            </div>
            <div>
              <div className="st-section-title">Alterar senha</div>
              <div className="st-section-desc">Use uma senha forte com ao menos 8 caracteres</div>
            </div>
          </div>
          <form className="st-section-body" onSubmit={handlePassword}>
            <div className="st-field">
              <label className="st-label">Senha atual</label>
              <div className="st-pw-wrap">
                <input
                  className={`st-input has-toggle`}
                  type={showPw.current ? 'text' : 'password'}
                  placeholder="Digite sua senha atual"
                  value={passwords.current}
                  onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                  required
                />
                <button type="button" className="st-pw-toggle" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
                  {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="st-row">
              <div className="st-field">
                <label className="st-label">Nova senha</label>
                <div className="st-pw-wrap">
                  <input
                    className="st-input has-toggle"
                    type={showPw.next ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={passwords.next}
                    onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                    required
                  />
                  <button type="button" className="st-pw-toggle" onClick={() => setShowPw(p => ({ ...p, next: !p.next }))}>
                    {showPw.next ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="st-field">
                <label className="st-label">Confirmar nova senha</label>
                <div className="st-pw-wrap">
                  <input
                    className="st-input has-toggle"
                    type={showPw.confirm ? 'text' : 'password'}
                    placeholder="Repita a nova senha"
                    value={passwords.confirm}
                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                    required
                  />
                  <button type="button" className="st-pw-toggle" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                    {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passwords.confirm && passwords.next !== passwords.confirm && (
                  <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>As senhas não coincidem</p>
                )}
                {passwords.confirm && passwords.next === passwords.confirm && passwords.next && (
                  <p style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>✓ Senhas coincidem</p>
                )}
              </div>
            </div>
            <button type="submit" className="st-btn st-btn-primary" disabled={loading.password}>
              {loading.password ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </div>

        {/* ── Notificações ── */}
        <div className="st-section">
          <div className="st-section-header">
            <div className="st-section-icon" style={{ background: '#fffbeb' }}>
              <Bell size={17} color="#f59e0b" />
            </div>
            <div>
              <div className="st-section-title">Notificações</div>
              <div className="st-section-desc">Com que frequência deseja receber alertas</div>
            </div>
          </div>
          <div className="st-section-body">
            <div className="st-freq-grid">
              {freqOptions.map(({ value, label }) => (
                <button
                  key={value}
                  className={`st-freq-option${frequency === value ? ' active' : ''}`}
                  onClick={() => setFrequency(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="st-btn st-btn-primary" onClick={handleNotifications} disabled={loading.notif}>
              {loading.notif ? 'Salvando...' : 'Salvar preferência'}
            </button>
          </div>
        </div>

        {/* ── Exportar ── */}
        <div className="st-section">
          <div className="st-section-header">
            <div className="st-section-icon" style={{ background: '#f0fdf4' }}>
              <Download size={17} color="#22c55e" />
            </div>
            <div>
              <div className="st-section-title">Exportar dados</div>
              <div className="st-section-desc">Baixe um relatório do mês atual em PDF</div>
            </div>
          </div>
          <div className="st-section-body">
            <button className="st-btn st-btn-outline" onClick={handleExport} disabled={loading.export}>
              <Download size={15} />
              {loading.export ? 'Gerando PDF...' : 'Exportar relatório em PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`st-toast ${toast.type}`}>
          {toast.type === 'success'
            ? <CheckCircle2 size={16} />
            : <AlertCircle size={16} />
          }
          {toast.message}
        </div>
      )}
    </>
  );
};

export default Settings;

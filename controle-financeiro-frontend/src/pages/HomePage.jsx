import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  BellRing,
  Target,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hp { font-family: 'DM Sans', sans-serif; color: #0f172a; background: #fff; }

        .hp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 56px; height: 66px;
          display: flex; align-items: center; justify-content: space-between;
          transition: all 0.25s;
        }
        .hp-nav.scrolled {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .hp-logo {
          display: flex; align-items: center; gap: 10px;
          font-size: 15px; font-weight: 600; color: #0f172a;
          text-decoration: none; letter-spacing: -0.3px;
        }
        .hp-logo-mark {
          width: 32px; height: 32px; background: #0f172a;
          border-radius: 9px; display: flex; align-items: center; justify-content: center;
        }
        .hp-nav-links { display: flex; align-items: center; gap: 4px; }
        .hp-nav-link {
          padding: 7px 15px; font-size: 14px; color: #64748b;
          text-decoration: none; border-radius: 8px; font-weight: 500;
          transition: color 0.15s, background 0.15s;
        }
        .hp-nav-link:hover { color: #0f172a; background: #f1f5f9; }
        .hp-nav-cta {
          padding: 8px 20px; background: #0f172a; color: #fff;
          font-size: 14px; font-weight: 500; border-radius: 9px;
          text-decoration: none; transition: all 0.15s; margin-left: 6px;
        }
        .hp-nav-cta:hover { background: #1e293b; }

        .hp-hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 130px 24px 100px;
          position: relative; overflow: hidden; background: #fafafa;
        }
        .hp-hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 85% 80%, rgba(99,102,241,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 15% 70%, rgba(16,185,129,0.04) 0%, transparent 60%);
        }
        .hp-hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 75%);
        }
        .hp-badge {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #374151; font-size: 13px; font-weight: 500;
          padding: 7px 16px; border-radius: 999px; margin-bottom: 32px;
          border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .hp-badge-pulse {
          width: 7px; height: 7px; background: #22c55e;
          border-radius: 50%; position: relative;
        }
        .hp-badge-pulse::after {
          content: ''; position: absolute; inset: -3px;
          border-radius: 50%; background: rgba(34,197,94,0.3);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0} }

        .hp-hero h1 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(48px, 7vw, 80px);
          line-height: 1.05; letter-spacing: -2px;
          color: #0f172a; max-width: 820px;
          margin-bottom: 24px; position: relative; z-index: 1; font-weight: 400;
        }
        .hp-hero h1 em {
          font-style: italic;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hp-hero-sub {
          font-size: 18px; color: #64748b; max-width: 460px;
          line-height: 1.75; margin-bottom: 44px; position: relative; z-index: 1;
        }
        .hp-hero-actions {
          display: flex; gap: 12px; align-items: center;
          position: relative; z-index: 1; flex-wrap: wrap; justify-content: center; margin-bottom: 20px;
        }
        .hp-btn-dark {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: #0f172a; color: #fff;
          font-size: 15px; font-weight: 500; border-radius: 10px;
          text-decoration: none; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(15,23,42,0.25);
        }
        .hp-btn-dark:hover { background: #1e293b; transform: translateY(-2px); }
        .hp-btn-light {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: #fff; color: #374151;
          font-size: 15px; font-weight: 500; border-radius: 10px;
          text-decoration: none; border: 1.5px solid #e2e8f0; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .hp-btn-light:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
        .hp-hero-note { font-size: 13px; color: #94a3b8; position: relative; z-index: 1; }
        .hp-scroll-hint {
          position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
          color: #cbd5e1; animation: floatY 2.5s ease-in-out infinite;
        }
        @keyframes floatY {
          0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)}
        }

        .hp-mockup-strip {
          padding: 0 48px 80px; display: flex; justify-content: center;
          background: #fafafa; border-bottom: 1px solid #f1f5f9;
        }
        .hp-mockup {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 20px;
          padding: 28px 32px; width: 100%; max-width: 860px;
          box-shadow: 0 8px 48px rgba(0,0,0,0.08);
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
        }
        .hp-mock-card { background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #f1f5f9; }
        .hp-mock-label { font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.5px; text-transform: uppercase; }
        .hp-mock-value { font-size: 24px; font-weight: 600; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 8px; }
        .hp-mock-tag {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px;
        }
        .tag-g { background: #f0fdf4; color: #16a34a; }
        .tag-r { background: #fef2f2; color: #dc2626; }
        .tag-b { background: #eff6ff; color: #2563eb; }
        .hp-mock-bar { margin-top: 12px; height: 4px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
        .hp-mock-bar-fill { height: 100%; border-radius: 99px; }
        .hp-mock-bar-note { font-size: 11px; color: #94a3b8; margin-top: 5px; }

        .hp-stats { display: flex; justify-content: center; border-bottom: 1px solid #f1f5f9; }
        .hp-stat { text-align: center; padding: 44px 56px; border-right: 1px solid #f1f5f9; }
        .hp-stat:last-child { border-right: none; }
        .hp-stat-num { font-family: 'Instrument Serif', serif; font-size: 40px; color: #0f172a; line-height: 1; margin-bottom: 8px; }
        .hp-stat-lbl { font-size: 13px; color: #94a3b8; font-weight: 500; }

        .hp-feat-wrap { padding: 100px 56px; max-width: 1140px; margin: 0 auto; }
        .hp-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #3b82f6; margin-bottom: 14px; }
        .hp-feat-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(30px, 4vw, 46px); line-height: 1.1;
          color: #0f172a; max-width: 500px; font-weight: 400;
          letter-spacing: -1px; margin-bottom: 16px;
        }
        .hp-feat-desc { font-size: 16px; color: #64748b; max-width: 440px; line-height: 1.75; margin-bottom: 56px; }
        .hp-feat-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
          background: #f1f5f9; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9;
        }
        .hp-feat-item { background: #fff; padding: 32px 28px; transition: background 0.2s; }
        .hp-feat-item:hover { background: #fafafa; }
        .hp-feat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
        .hp-feat-item h3 { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 8px; letter-spacing: -0.2px; }
        .hp-feat-item p { font-size: 14px; color: #64748b; line-height: 1.65; }

        .hp-check-wrap {
          background: #f8fafc; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;
          padding: 80px 56px; display: flex; align-items: center; justify-content: center;
          gap: 80px; flex-wrap: wrap;
        }
        .hp-check-text h2 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(28px, 3.5vw, 40px); line-height: 1.15;
          color: #0f172a; font-weight: 400; letter-spacing: -0.8px; margin-bottom: 14px; max-width: 360px;
        }
        .hp-check-text p { font-size: 15px; color: #64748b; line-height: 1.7; max-width: 340px; margin-bottom: 28px; }
        .hp-checklist { display: flex; flex-direction: column; gap: 12px; }
        .hp-check-item { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #374151; font-weight: 500; }

        .hp-cta-wrap { padding: 80px 56px; }
        .hp-cta {
          background: #0f172a; border-radius: 24px; padding: 80px 56px;
          text-align: center; position: relative; overflow: hidden;
        }
        .hp-cta-glow {
          position: absolute; pointer-events: none; width: 600px; height: 600px;
          border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%);
          top: -200px; right: -150px;
        }
        .hp-cta-glow2 {
          position: absolute; pointer-events: none; width: 400px; height: 400px;
          border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%);
          bottom: -150px; left: -100px;
        }
        .hp-cta-pill {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.07); color: #93c5fd;
          font-size: 11px; font-weight: 700; padding: 5px 14px;
          border-radius: 999px; margin-bottom: 24px;
          border: 1px solid rgba(255,255,255,0.1); letter-spacing: 1px; text-transform: uppercase;
        }
        .hp-cta h2 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(30px, 5vw, 52px); color: #fff;
          margin-bottom: 16px; line-height: 1.1; font-weight: 400;
          letter-spacing: -1px; position: relative; z-index: 1;
        }
        .hp-cta h2 em { font-style: italic; color: #93c5fd; }
        .hp-cta p { font-size: 16px; color: #94a3b8; margin-bottom: 40px; position: relative; z-index: 1; }
        .hp-cta-btn {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 15px 34px; background: #fff; color: #0f172a;
          font-size: 15px; font-weight: 600; border-radius: 10px;
          text-decoration: none; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 20px rgba(255,255,255,0.15);
        }
        .hp-cta-btn:hover { background: #f1f5f9; transform: translateY(-2px); }

        .hp-footer {
          border-top: 1px solid #f1f5f9; padding: 56px;
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px;
          max-width: 1140px; margin: 0 auto;
        }
        .hp-footer-brand-logo {
          display: flex; align-items: center; gap: 8px;
          font-weight: 600; font-size: 15px; margin-bottom: 14px; letter-spacing: -0.3px;
        }
        .hp-footer-logo-icon {
          width: 28px; height: 28px; background: #0f172a;
          border-radius: 7px; display: flex; align-items: center; justify-content: center;
        }
        .hp-footer-brand p { font-size: 14px; color: #94a3b8; line-height: 1.7; max-width: 240px; }
        .hp-footer-col h4 { font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 16px; letter-spacing: 1px; text-transform: uppercase; }
        .hp-footer-col a { display: block; font-size: 14px; color: #64748b; text-decoration: none; margin-bottom: 10px; transition: color 0.15s; }
        .hp-footer-col a:hover { color: #0f172a; }
        .hp-footer-bottom {
          border-top: 1px solid #f1f5f9; padding: 20px 56px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12px; color: #94a3b8; max-width: 1140px; margin: 0 auto; width: 100%;
        }

        @media (max-width: 900px) {
          .hp-nav { padding: 0 24px; }
          .hp-mockup { grid-template-columns: 1fr; }
          .hp-mockup-strip { padding: 0 24px 64px; }
          .hp-stats { flex-direction: column; }
          .hp-stat { border-right: none; border-bottom: 1px solid #f1f5f9; padding: 32px; }
          .hp-stat:last-child { border-bottom: none; }
          .hp-feat-wrap { padding: 64px 24px; }
          .hp-feat-grid { grid-template-columns: 1fr; }
          .hp-check-wrap { padding: 64px 24px; gap: 40px; }
          .hp-cta-wrap { padding: 48px 24px; }
          .hp-cta { padding: 56px 28px; }
          .hp-footer { grid-template-columns: 1fr 1fr; gap: 32px; padding: 48px 24px; }
          .hp-footer-bottom { padding: 20px 24px; flex-direction: column; gap: 8px; }
        }
      `}</style>

      <div className="hp">
        <nav className={`hp-nav${scrolled ? ' scrolled' : ''}`}>
          <a href="/" className="hp-logo">
            <div className="hp-logo-mark"><LayoutDashboard size={16} color="#fff" /></div>
            Contas no Azul
          </a>
          <div className="hp-nav-links">
            <Link to="/" className="hp-nav-link">Início</Link>
            <Link to="/register" className="hp-nav-link">Registrar</Link>
            <Link to="/login" className="hp-nav-cta">Entrar</Link>
          </div>
        </nav>

        <section className="hp-hero">
          <div className="hp-hero-bg" />
          <div className="hp-hero-grid" />
          <div className="hp-badge">
            <div className="hp-badge-pulse" />
            7 dias grátis · Sem cartão de crédito
          </div>
          <h1>Dinheiro sob controle,<br /><em>vida sem estresse.</em></h1>
          <p className="hp-hero-sub">Registre, analise e organize suas finanças pessoais com um painel claro e intuitivo.</p>
          <div className="hp-hero-actions">
            <Link to="/register" className="hp-btn-dark">Começar agora <ArrowRight size={15} /></Link>
            <Link to="/login" className="hp-btn-light">Já tenho conta</Link>
          </div>
          <p className="hp-hero-note">Sem cartão. Sem compromisso. Cancele quando quiser.</p>
          <div className="hp-scroll-hint"><ChevronDown size={20} /></div>
        </section>

        <div className="hp-mockup-strip">
          <div className="hp-mockup">
            <div className="hp-mock-card">
              <div className="hp-mock-label">Saldo total</div>
              <div className="hp-mock-value">R$ 12.430</div>
              <span className="hp-mock-tag tag-g">↑ +8,2% este mês</span>
            </div>
            <div className="hp-mock-card">
              <div className="hp-mock-label">Gastos do mês</div>
              <div className="hp-mock-value">R$ 3.850</div>
              <span className="hp-mock-tag tag-r">↑ +12% vs anterior</span>
              <div className="hp-mock-bar"><div className="hp-mock-bar-fill" style={{ width: '64%', background: '#3b82f6' }} /></div>
              <div className="hp-mock-bar-note">64% da meta mensal</div>
            </div>
            <div className="hp-mock-card">
              <div className="hp-mock-label">Cartão Nubank</div>
              <div className="hp-mock-value">R$ 1.240</div>
              <span className="hp-mock-tag tag-b">Vence em 8 dias</span>
              <div className="hp-mock-bar"><div className="hp-mock-bar-fill" style={{ width: '25%', background: '#22c55e' }} /></div>
              <div className="hp-mock-bar-note">25% do limite usado</div>
            </div>
          </div>
        </div>

        <div className="hp-stats">
          {[
            { num: '7 dias', lbl: 'Período de teste gratuito' },
            { num: '5 min', lbl: 'Para configurar tudo' },
            { num: '100%', lbl: 'Dados protegidos' },
          ].map(s => (
            <div className="hp-stat" key={s.lbl}>
              <div className="hp-stat-num">{s.num}</div>
              <div className="hp-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        <div className="hp-feat-wrap">
          <div className="hp-eyebrow">Funcionalidades</div>
          <h2 className="hp-feat-title">Tudo que você precisa, nada que você não precisa.</h2>
          <p className="hp-feat-desc">Uma interface limpa construída para quem quer controle sem complicação.</p>
          <div className="hp-feat-grid">
            {[
              { icon: <LayoutDashboard size={18} color="#3b82f6" />, bg: '#eff6ff', title: 'Dashboard visual', desc: 'Gráficos de receitas e despesas com filtros por mês e categoria.' },
              { icon: <CreditCard size={18} color="#8b5cf6" />, bg: '#f5f3ff', title: 'Cartões e faturas', desc: 'Acompanhe limites, parcelas e datas de vencimento em um só lugar.' },
              { icon: <Target size={18} color="#10b981" />, bg: '#f0fdf4', title: 'Objetivos', desc: 'Defina metas financeiras e visualize o progresso mês a mês.' },
              { icon: <BellRing size={18} color="#f59e0b" />, bg: '#fffbeb', title: 'Alertas', desc: 'Notificações sobre gastos, faturas e metas próximas do limite.' },
              { icon: <TrendingUp size={18} color="#ef4444" />, bg: '#fef2f2', title: 'Análise por categoria', desc: 'Veja exatamente onde seu dinheiro vai a cada mês.' },
              { icon: <Shield size={18} color="#0f172a" />, bg: '#f8fafc', title: 'Seguro e privado', desc: 'Autenticação JWT e login com Google. Seus dados, só seus.' },
            ].map(f => (
              <div className="hp-feat-item" key={f.title}>
                <div className="hp-feat-icon" style={{ background: f.bg }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hp-check-wrap">
          <div className="hp-check-text">
            <h2>Por que o Contas no Azul?</h2>
            <p>Criado para quem quer praticidade e clareza, sem as complexidades de ferramentas corporativas.</p>
            <Link to="/register" className="hp-btn-dark" style={{ display: 'inline-flex' }}>
              Experimentar grátis <ArrowRight size={15} />
            </Link>
          </div>
          <div className="hp-checklist">
            {[
              'Interface limpa e fácil de usar',
              'Suporte a múltiplas contas e cartões',
              'Relatórios mensais em PDF',
              'Login seguro com Google',
              'Funciona em qualquer dispositivo',
              'Integração com WhatsApp',
            ].map(item => (
              <div className="hp-check-item" key={item}>
                <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="hp-cta-wrap">
          <div className="hp-cta">
            <div className="hp-cta-glow" /><div className="hp-cta-glow2" />
            <div className="hp-cta-pill"><Zap size={11} /> Comece hoje</div>
            <h2>Pare de perder dinheiro<br /><em>sem saber por quê.</em></h2>
            <p>Crie sua conta em menos de 2 minutos. Grátis por 7 dias.</p>
            <Link to="/register" className="hp-cta-btn">Criar conta gratuita <ArrowRight size={15} /></Link>
          </div>
        </div>

        <footer>
          <div className="hp-footer">
            <div className="hp-footer-brand">
              <div className="hp-footer-brand-logo">
                <div className="hp-footer-logo-icon"><LayoutDashboard size={14} color="#fff" /></div>
                Contas no Azul
              </div>
              <p>Sistema completo para gerenciamento de finanças pessoais. Simples, seguro e gratuito para começar.</p>
            </div>
            <div className="hp-footer-col">
              <h4>Produto</h4>
              <Link to="/">Início</Link>
              <Link to="/register">Criar conta</Link>
              <Link to="/login">Entrar</Link>
            </div>
            <div className="hp-footer-col">
              <h4>Recursos</h4>
              <a href="#">Dashboard</a>
              <a href="#">Cartões</a>
              <a href="#">Objetivos</a>
              <a href="#">Relatórios PDF</a>
            </div>
            <div className="hp-footer-col">
              <h4>Contato</h4>
              <a href="mailto:contato@contasnoazul.com.br">contato@contasnoazul.com.br</a>
              <a href="tel:+5561982705434">(61) 98270-5434</a>
            </div>
          </div>
          <div className="hp-footer-bottom">
            <span>© 2025 Contas no Azul · Todos os direitos reservados</span>
            <span>Feito com ❤️ no Brasil</span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;

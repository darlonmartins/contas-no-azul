import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Landmark,
  ListChecks,
  Flag,
  DollarSign,
  FolderKanban,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Repeat2,
} from "lucide-react";
import logo from "@/assets/logo.png";

const sections = [
  {
    title: "Principal",
    items: [
      { path: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
      { path: "/accounts",   label: "Contas",        icon: Landmark },
      { path: "/cards",      label: "Cartões",       icon: CreditCard },
    ],
  },
  {
    title: "Gestão Financeira",
    items: [
      { path: "/registros",   label: "Registros",   icon: ListChecks },
      { path: "/goals",       label: "Objetivos",   icon: Flag },
      { path: "/metas",       label: "Metas",       icon: DollarSign },
      { path: "/categories",  label: "Categorias",  icon: FolderKanban },
      { path: '/fixed-expenses', label: 'Despesas Fixas', icon: Repeat2 }
    ],
  },
  {
    title: "Sistema",
    items: [
      { path: "/notifications", label: "Notificações",  icon: Bell },
      { path: "/settings",      label: "Configurações", icon: Settings },
    ],
  },
];

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Usuário");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setUserName(localStorage.getItem("userName") || "Usuário");
    window.addEventListener("userNameUpdated", handleUpdate);
    return () => window.removeEventListener("userNameUpdated", handleUpdate);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(data.filter(n => !n.read).length);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Logo — igual ao original: box branco, largura total, max 180px */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          background: "#fff", borderRadius: 10, padding: "8px 12px",
          width: "100%", maxWidth: 180,
        }}>
          <img
            src={logo}
            alt="Logo Contas no Azul"
            style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
          />
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 10, paddingLeft: 2 }}>
          {userName}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "1.2px",
              textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
              padding: "0 8px", marginBottom: 6,
            }}>
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px", borderRadius: 8, marginBottom: 2,
                    textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
                    color: active ? "#fff" : "rgba(255,255,255,0.55)",
                    background: active ? "rgba(255,255,255,0.1)" : "transparent",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}}
                >
                  <Icon size={16} />
                  {item.label}
                  {item.path === "/notifications" && unreadCount > 0 && (
                    <span style={{
                      marginLeft: "auto",
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 999,
                      minWidth: 18,
                      textAlign: "center",
                    }}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {active && item.path !== "/notifications" && (
                    <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.5 }} />
                  )}
                  {active && item.path === "/notifications" && unreadCount === 0 && (
                    <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.5 }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 10px", borderRadius: 8,
          background: "rgba(255,255,255,0.05)", marginBottom: 8,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Conta ativa</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "9px 10px", borderRadius: 8, border: "none",
            background: "transparent", cursor: "pointer",
            fontSize: 14, color: "rgba(255,255,255,0.45)",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#fca5a5"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
        >
          <LogOut size={15} />
          Sair da conta
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .layout-root { font-family: 'DM Sans', sans-serif; display: flex; min-height: 100vh; background: #f1f5f9; }

        .layout-sidebar {
          width: 240px; flex-shrink: 0;
          background: #0f172a;
          position: fixed; top: 0; left: 0; bottom: 0;
          z-index: 40; display: flex; flex-direction: column; overflow: hidden;
        }

        .layout-sidebar nav::-webkit-scrollbar { width: 3px; }
        .layout-sidebar nav::-webkit-scrollbar-track { background: transparent; }
        .layout-sidebar nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

        .layout-main { margin-left: 240px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

        .layout-topbar {
          background: #fff; border-bottom: 1px solid #f1f5f9;
          padding: 0 28px; height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 30;
        }
        .layout-page-title { font-size: 15px; font-weight: 600; color: #0f172a; letter-spacing: -0.2px; }
        .layout-topbar-right { display: flex; align-items: center; gap: 12px; }
        .layout-greeting { font-size: 14px; color: #64748b; }
        .layout-content { flex: 1; padding: 28px; overflow-y: auto; }

        .layout-mobile-toggle {
          display: none; background: none; border: none; cursor: pointer;
          color: #64748b; padding: 4px;
        }
        .layout-mobile-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.5); z-index: 39; backdrop-filter: blur(2px);
        }

        @media (max-width: 768px) {
          .layout-sidebar { transform: translateX(-100%); transition: transform 0.25s; }
          .layout-sidebar.open { transform: translateX(0); }
          .layout-main { margin-left: 0; }
          .layout-mobile-toggle { display: flex; }
          .layout-mobile-overlay.open { display: block; }
          .layout-content { padding: 20px 16px; }
        }
      `}</style>

      <div className="layout-root">
        <aside className={`layout-sidebar${mobileOpen ? " open" : ""}`}>
          <SidebarContent />
        </aside>

        <div
          className={`layout-mobile-overlay${mobileOpen ? " open" : ""}`}
          onClick={() => setMobileOpen(false)}
        />

        <div className="layout-main">
          <header className="layout-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="layout-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <span className="layout-page-title">
                {sections.flatMap(s => s.items).find(i => i.path === location.pathname)?.label || "Contas no Azul"}
              </span>
            </div>
            <div className="layout-topbar-right">
              {unreadCount > 0 && (
                <Link to="/notifications" style={{ position: "relative", display: "flex", alignItems: "center", color: "#64748b", textDecoration: "none" }}>
                  <Bell size={20} />
                  <span style={{
                    position: "absolute", top: -6, right: -6,
                    background: "#ef4444", color: "#fff",
                    fontSize: 9, fontWeight: 700,
                    padding: "1px 5px", borderRadius: 999,
                    minWidth: 16, textAlign: "center",
                  }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </Link>
              )}
              <span className="layout-greeting">Olá, {userName.split(" ")[0]} 👋</span>
            </div>
          </header>

          <main className="layout-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Home,
  CreditCard,
  DollarSign,
  Flag,
  Bell,
  Settings,
  LogOut,
  Landmark,
  ListChecks,
  FolderKanban,
} from "lucide-react";
import logo from "@/assets/logo.png";

const Layout = () => {
  const location = useLocation();
  const userName = localStorage.getItem("userName") || "Usuário";

  const sections = [
    {
      title: "Principal",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
        { path: "/accounts", label: "Contas", icon: <Landmark size={20} /> },
        { path: "/cards", label: "Cartões", icon: <CreditCard size={20} /> },
      ],
    },
    {
      title: "Gestão Financeira",
      items: [
        { path: "/registros", label: "Registros", icon: <ListChecks size={20} /> },
        { path: "/goals", label: "Objetivos", icon: <Flag size={20} /> },
        { path: "/metas", label: "Metas", icon: <DollarSign size={20} /> },
        { path: "/categories", label: "Categorias", icon: <FolderKanban size={20} /> },
      ],
    },
    {
      title: "Sistema",
      items: [
        { path: "/notifications", label: "Notificações", icon: <Bell size={20} /> },
        { path: "/settings", label: "Configurações", icon: <Settings size={20} /> },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar refinada */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between px-5 py-6 shadow-lg">
        <div>
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white rounded-lg p-2 shadow-md w-full max-w-[180px]">
              <img
                src={logo}
                alt="Logo Contas no Azul"
                className="w-full h-auto object-contain"
              />
            </div>
            <span className="mt-2 text-sm text-gray-300 font-medium">{userName}</span>
          </div>

          {/* Menu agrupado */}
          <nav className="flex flex-col gap-6">
            {sections.map((section) => (
              <div key={section.title}>
                <h4 className="text-xs uppercase text-gray-400 px-4 mb-1 tracking-wide">
                  {section.title}
                </h4>
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                        location.pathname === item.path
                          ? "bg-gray-800 font-semibold"
                          : "hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Área principal: Header + Outlet */}
      <div className="flex-1 flex flex-col">
        {/* Topbar fixa */}
        <header className="flex items-center justify-end gap-4 px-6 py-4 bg-white shadow-sm">
          <span className="text-gray-700 font-medium hidden sm:inline">
            Olá, {userName} 👋
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow text-sm font-medium"
          >
            <LogOut size={16} />
            Sair
          </button>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

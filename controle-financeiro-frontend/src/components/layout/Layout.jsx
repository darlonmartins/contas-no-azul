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
  FolderKanban, // ✅ novo ícone para Categorias
} from "lucide-react";
import logo from "@/assets/logo.png";

const Layout = () => {
  const location = useLocation();

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
    }
    ,
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
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="Logo Contas no Azul"
              className="h-40 w-64 object-contain bg-white rounded-lg p-2 shadow-md"
            />
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
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${location.pathname === item.path
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

        {/* Sair */}
        <div className="mt-6">
          <h4 className="text-xs uppercase text-gray-400 px-4 mb-1 tracking-wide">Ações</h4>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition w-full"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

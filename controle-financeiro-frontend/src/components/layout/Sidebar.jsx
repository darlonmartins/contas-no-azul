import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  CreditCard,
  DollarSign,
  Flag,
  Bell,
  Settings,
  Landmark,
  ListChecks,
  LogOut,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const sections = [
    {
      title: 'Principal',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
        { path: '/accounts', label: 'Contas', icon: <Landmark size={18} /> },
        { path: '/cards', label: 'Cartões', icon: <CreditCard size={18} /> },
      ],
    },
    {
      title: 'Gestão Financeira',
      items: [
        { path: '/registros', label: 'Registros', icon: <ListChecks size={18} /> },
        { path: '/goals', label: 'Objetivos', icon: <Flag size={18} /> },
        { path: '/metas', label: 'Metas', icon: <DollarSign size={18} /> },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { path: '/notifications', label: 'Notificações', icon: <Bell size={18} /> },
        { path: '/settings', label: 'Configurações', icon: <Settings size={18} /> },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed flex flex-col justify-between">
      <div>
        <div className="p-6 text-center text-2xl font-bold border-b border-gray-700">
          Finanças
        </div>
        <nav className="mt-4 px-4">
          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              <h4 className="text-xs uppercase text-gray-400 px-1 mb-2 tracking-wider">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all ${isActive(item.path)
                        ? 'bg-gray-700 font-semibold'
                        : 'hover:bg-gray-700'
                      }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>


    </div>
  );
};

export default Sidebar;

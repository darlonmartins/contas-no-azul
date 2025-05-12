import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Home, UserPlus, LogIn } from 'lucide-react';

const PublicHeader = () => {
  return (
    <header className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow">
      <div className="flex items-center gap-2 font-semibold text-lg">
        <LayoutDashboard className="w-5 h-5" />
        Controle Financeiro
      </div>
      <nav className="flex gap-4 items-center text-sm">
        <Link to="/" className="flex items-center gap-1 hover:underline">
          <Home className="w-4 h-4" /> Início
        </Link>
        <Link to="/register" className="flex items-center gap-1 hover:underline">
          <UserPlus className="w-4 h-4" /> Registrar
        </Link>
        <Link to="/login">
          <button className="bg-white text-blue-600 px-3 py-1.5 rounded-md font-medium hover:bg-gray-100">
            Entrar
          </button>
        </Link>
      </nav>
    </header>
  );
};

export default PublicHeader;

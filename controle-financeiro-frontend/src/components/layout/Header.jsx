import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow">
      <h1 className="text-xl font-bold">Contas no Azul</h1>
      <nav className="space-x-4">
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/expenses" className="hover:underline">Despesas</Link>
        <Link to="/goals" className="hover:underline">Metas</Link>
        <Link to="/notifications" className="hover:underline">Notificações</Link>
        <Link to="/settings" className="hover:underline">Configurações</Link>
      </nav>
    </header>
  );
};

export default Header;

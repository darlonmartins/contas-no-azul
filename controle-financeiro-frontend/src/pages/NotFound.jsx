import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-xl mb-6">Página não encontrada.</p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Voltar para o início
      </Link>
    </div>
  );
};

export default NotFound;

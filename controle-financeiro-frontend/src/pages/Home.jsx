import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!token) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
      <h1 className="text-3xl font-bold mb-4">Bem-vindo à Home!</h1>
      <p className="mb-6">Você está logado.</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Home;

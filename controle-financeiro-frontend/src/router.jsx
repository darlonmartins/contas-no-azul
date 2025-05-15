import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Objectives from "./pages/Objectives";
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Cards from './pages/Cards';
import Accounts from './pages/Accounts';
import NotFound from './pages/NotFound';
import Registros from './pages/Registros';
import Categories from './pages/Categories';
import CardDetails from './pages/CardDetails';
import PaymentPage from './pages/PaymentPage';
import HomePage from './pages/HomePage';
import ObjectiveDetails from './pages/ObjectiveDetails';
import Metas from "./pages/MonthlyGoals";

import Layout from './components/layout/Layout';
import { useTrial } from './context/TrialContext';

const isAuthenticated = () => {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
};


const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const TrialProtectedRoute = ({ children }) => {
  const { isActive, hasPaid, status } = useTrial();

  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (!isActive && !hasPaid && status === 'expired') return <Navigate to="/payment" />;

  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Rota raiz ajustada corretamente */}
      <Route
        path="/"
        element={isAuthenticated() ? <Navigate to="/registros" /> : <HomePage />}
      />

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Página de pagamento - precisa estar logado, mas não exige trial */}
      <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />

      {/* Página fora do layout, mas protegida por trial */}
      <Route path="/home" element={<TrialProtectedRoute><Home /></TrialProtectedRoute>} />

      {/* Rotas com layout principal e proteção por trial */}
      <Route
        element={
          <TrialProtectedRoute>
            <Layout />
          </TrialProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/objectives" element={<Objectives />} />
        <Route path="/objectives/:id" element={<ObjectiveDetails />} />
        <Route path="/metas" element={<Metas />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/registros" element={<Registros />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/cards/:cardId" element={<CardDetails />} />
        <Route path="/goals" element={<Navigate to="/objectives" />} /> {/* 🔁 Redirecionamento corrigido */}
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;

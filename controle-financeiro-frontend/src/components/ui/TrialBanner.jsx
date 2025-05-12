import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';
import { useTrial } from "../../context/TrialContext";

const TrialBanner = () => {
  const { isActive, hasPaid, daysLeft, status, loading } = useTrial();

  if (loading) return null;
  
  // Se já pagou, não mostrar banner
  if (hasPaid) return null;
  
  // Se o trial expirou
  if (status === 'expired') {
    return (
      <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <div>
              <h3 className="font-semibold">Período de Avaliação Expirado</h3>
              <p className="text-sm">Seu período de avaliação gratuita expirou. Assine agora para continuar usando o sistema.</p>
            </div>
          </div>
          <Link 
            to="/payment"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Assinar agora
          </Link>
        </div>
      </div>
    );
  }
  
  // Se o trial está próximo de expirar (2 dias ou menos)
  if (status === 'expiring') {
    return (
      <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <div>
              <h3 className="font-semibold">Período de Avaliação Acabando</h3>
              <p className="text-sm">Restam apenas {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} de avaliação gratuita.</p>
            </div>
          </div>
          <Link 
            to="/payment"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Assinar agora
          </Link>
        </div>
      </div>
    );
  }
  
  // Trial ativo normal
  return (
    <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-lg mb-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <div>
            <h3 className="font-semibold">Período de Avaliação</h3>
            <p className="text-sm">Você está no período de avaliação gratuita. Restam {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}.</p>
          </div>
        </div>
        <Link 
          to="/payment"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Assinar agora
        </Link>
      </div>
    </div>
  );
};

export default TrialBanner;

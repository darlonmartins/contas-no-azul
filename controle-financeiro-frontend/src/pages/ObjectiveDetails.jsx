import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import ObjectiveDepositModal from '../components/goals/ObjectiveDepositModal';
import api from '../../services/api';

const ObjectiveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [objective, setObjective] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);

const fetchObjective = async () => {
  try {
    const res = await api.get(`/goals/${id}`);
    setObjective(res.data);
  } catch (err) {
    console.error('Erro ao buscar objetivo:', err);
  }
};

  useEffect(() => {
    fetchObjective();
  }, []);

  const getProgressPercent = () => {
    if (!objective) return 0;
    return Math.min((objective.currentAmount / objective.targetAmount) * 100, 100);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/objectives')}
        className="mb-4 text-indigo-600 hover:underline flex items-center gap-1"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      {objective ? (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {objective.name}
          </h2>

          <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full"
              style={{ width: `${getProgressPercent()}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-700">
            Progresso: R${objective.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R${objective.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>

          <p className="text-sm text-gray-600">
            Data limite: {new Date(objective.dueDate).toLocaleDateString('pt-BR')}
          </p>

          <button
            onClick={() => setShowDepositModal(true)}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700"
          >
            <PlusCircle size={18} />
            Registrar depósito
          </button>
        </div>
      ) : (
        <p>Carregando...</p>
      )}

      {showDepositModal && (
        <ObjectiveDepositModal
          objective={objective}
          onClose={() => setShowDepositModal(false)}
          onDepositSuccess={() => {
            setShowDepositModal(false);
            fetchObjective();
          }}
        />
      )}
    </div>
  );
};

export default ObjectiveDetails;

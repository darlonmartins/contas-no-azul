import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusCircle, CalendarRange } from 'lucide-react';
import MonthlyGoalCard from '../components/goals/MonthlyGoalCard';
import MonthlyGoalModal from '../components/goals/MonthlyGoalModal';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

const MonthlyGoals = () => {
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/monthly-goals');
      setGoals(res.data);
    } catch (err) {
      console.error('Erro ao buscar metas mensais:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/monthly-goals/${deleteTarget}`);
      setDeleteTarget(null);
      fetchGoals();
    } catch (err) {
      console.error('Erro ao excluir meta mensal:', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarRange className="w-6 h-6 text-indigo-600" />
          Metas Mensais
        </h1>
        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusCircle size={18} />
          Cadastrar nova meta
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando metas mensais...</p>
      ) : goals.length === 0 ? (
        <p className="text-gray-600">Nenhuma meta mensal cadastrada.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <MonthlyGoalCard
              key={goal.id}
              goal={goal}
              onEdit={(g) => {
                setEditingGoal(g);
                setIsModalOpen(true);
              }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <MonthlyGoalModal
          goal={editingGoal}
          onClose={() => setIsModalOpen(false)}
          onSaved={fetchGoals}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Deseja excluir esta meta?"
          message="Essa ação não poderá ser desfeita."
          confirmText="Excluir"
        />
      )}
    </div>
  );
};

export default MonthlyGoals;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ObjectiveForm from '../components/goals/ObjectiveForm';
import ObjectiveList from '../components/goals/ObjectiveList';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';
import { PlusCircle, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Objectives = () => {
  const [objectives, setObjectives] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchObjectives = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/goals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setObjectives(res.data);
    } catch (err) {
      console.error('Erro ao buscar objetivos:', err);
    }
  };

  useEffect(() => {
    fetchObjectives();
  }, []);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/goals/${deleteTarget}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteTarget(null);
      fetchObjectives();
    } catch (err) {
      console.error('Erro ao excluir objetivo:', err);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-600" />
          Meus Objetivos Financeiros
        </h1>
        <button
          onClick={() => {
            setEditingObjective(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Cadastrar novo objetivo
        </button>
      </div>

      <ObjectiveList
        objectives={objectives}
        onEdit={(obj) => {
          setEditingObjective(obj);
          setIsModalOpen(true);
        }}
        onDelete={(id) => setDeleteTarget(id)}
      />

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg"
            >
              <ObjectiveForm
                initialData={editingObjective}
                onCancel={() => setIsModalOpen(false)}
                onObjectiveSaved={() => {
                  setIsModalOpen(false);
                  fetchObjectives();
                }}
              />

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Deseja realmente excluir este objetivo?"
          message="Esta ação não poderá ser desfeita."
          confirmText="Excluir"
        />
      )}
    </div>
  );
};

export default Objectives;

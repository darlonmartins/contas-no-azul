import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ObjectiveForm from '../components/goals/ObjectiveForm';
import ObjectiveList from '../components/goals/ObjectiveList';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';
import { PlusCircle, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';

const Objectives = () => {
  const [objectives, setObjectives] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);


  const fetchObjectives = async () => {
  try {
    setLoading(true);
    const res = await api.get('/goals');
    setObjectives(res.data);
  } catch (err) {
    console.error('Erro ao buscar objetivos:', err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchObjectives();
  }, []);
  
  if (loading) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-gray-600 text-sm animate-fade-in">
      <svg className="animate-spin h-6 w-6 text-indigo-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 00-10 10h4z" />
      </svg>
      <p>Carregando seus objetivos financeiros... aguarde um instante.</p>
    </div>
  );
}
  const handleDelete = async () => {
    try {
      await api.delete(`/goals/${deleteTarget}`);
      setDeleteTarget(null);
      fetchObjectives();
    } catch (err) {
      console.error('Erro ao excluir objetivo:', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-600" />
          Meus Objetivos Financeiros
        </h1>

        {/* ✅ Exibir botão somente se já houver objetivos */}
        {objectives.length > 0 && (
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
        )}
      </div>

      {objectives.length === 0 ? (
        <div className="text-center text-gray-600 py-12 flex flex-col items-center">
          <Target size={48} className="text-indigo-600 mb-4" />
          <p className="text-xl font-semibold">Nenhum objetivo cadastrado</p>
          <p className="text-sm text-gray-500 mt-2 mb-4">
            Comece adicionando uma meta financeira para acompanhar seu progresso.
          </p>
          <button
            onClick={() => {
              setEditingObjective(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium"
          >
            Adicionar Objetivo
          </button>
        </div>
      ) : (
        <ObjectiveList
          objectives={objectives}
          onEdit={(obj) => {
            setEditingObjective(obj);
            setIsModalOpen(true);
          }}
          onDelete={(id) => setDeleteTarget(id)}
        />
      )}

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

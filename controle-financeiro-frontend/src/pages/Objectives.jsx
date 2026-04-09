import React, { useEffect, useState } from 'react';
import { PlusCircle, Target, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import ObjectiveForm from '../components/goals/ObjectiveForm';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const ICON_MAP = {
  'novo carro': '🚗', 'nova casa': '🏠', 'viagem de férias': '✈️',
  'educação': '🎓', 'fundo de emergência': '💰', 'saúde': '❤️',
  'festa': '🎉', 'filhos': '👶', 'aposentadoria': '🏖️', 'quitar uma dívida': '💳',
};
const getIcon = (name) => ICON_MAP[name?.toLowerCase()?.trim()] || '🎯';

const Objectives = () => {
  const [objectives, setObjectives]       = useState([]);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [loading, setLoading]             = useState(true);
  const navigate = useNavigate();

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

  useEffect(() => { fetchObjectives(); }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/goals/${deleteTarget}`);
      setDeleteTarget(null);
      fetchObjectives();
    } catch (err) {
      console.error('Erro ao excluir objetivo:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12, color: '#94a3b8' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14 }}>Carregando objetivos...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .obj-page { font-family: 'DM Sans', sans-serif; }
        .obj-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .obj-btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 9px; border: none; background: #0f172a; color: #fff; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .obj-btn-primary:hover { background: #1e293b; }
        .obj-card { background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px; padding: 18px 20px; cursor: pointer; transition: box-shadow 0.15s, border-color 0.15s; }
        .obj-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: #e2e8f0; }
        .obj-action-btn { width: 30px; height: 30px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
      `}</style>

      <div className="obj-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.4px', margin: '0 0 4px' }}>Objetivos</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Acompanhe suas metas financeiras</p>
          </div>
          <button className="obj-btn-primary" onClick={() => { setEditingObjective(null); setIsModalOpen(true); }}>
            <PlusCircle size={16} /> Novo objetivo
          </button>
        </div>

        {objectives.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26 }}>🎯</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 6px' }}>Nenhum objetivo cadastrado</h3>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 20px' }}>Defina uma meta financeira e acompanhe seu progresso.</p>
            <button className="obj-btn-primary" onClick={() => { setEditingObjective(null); setIsModalOpen(true); }}>
              <PlusCircle size={15} /> Adicionar objetivo
            </button>
          </div>
        ) : (
          <div className="obj-grid">
            {objectives.map(obj => {
              const pct = Math.min(Math.round((obj.currentAmount / (obj.targetAmount || 1)) * 100), 100);
              const done = obj.currentAmount >= obj.targetAmount;
              const daysLeft = obj.dueDate ? Math.ceil((new Date(obj.dueDate) - new Date()) / 86400000) : null;

              return (
                <div key={obj.id} className="obj-card" onClick={() => navigate(`/objectives/${obj.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {getIcon(obj.name)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{obj.name}</div>
                        {daysLeft !== null && (
                          <div style={{ fontSize: 11, color: daysLeft < 30 ? '#ef4444' : '#94a3b8', marginTop: 1 }}>
                            {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo encerrado'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
                      <button className="obj-action-btn"
                        onClick={() => { setEditingObjective(obj); setIsModalOpen(true); }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Pencil size={14} color="#64748b" />
                      </button>
                      <button className="obj-action-btn"
                        onClick={() => setDeleteTarget(obj.id)}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                      <span>R$ {fmt(obj.currentAmount)}</span>
                      <span>R$ {fmt(obj.targetAmount)}</span>
                    </div>
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: done ? '#22c55e' : '#3b82f6', transition: 'width 0.4s' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: done ? '#f0fdf4' : '#eff6ff', color: done ? '#16a34a' : '#2563eb' }}>
                      {done ? 'Concluído ✓' : `${pct}% concluído`}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                      Ver detalhes <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de objetivo */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)', fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 18, width: '95%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', margin: '0 0 20px' }}>
              {editingObjective ? 'Editar objetivo' : 'Novo objetivo'}
            </h2>
            <ObjectiveForm
              initialData={editingObjective}
              onCancel={() => setIsModalOpen(false)}
              onObjectiveSaved={() => { setIsModalOpen(false); fetchObjectives(); }}
            />
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir objetivo"
        message="Deseja realmente excluir este objetivo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
      />
    </>
  );
};

export default Objectives;

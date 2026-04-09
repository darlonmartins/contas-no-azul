import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusCircle, DollarSign, Pencil, Trash2 } from 'lucide-react';
import MonthlyGoalModal from '../components/goals/MonthlyGoalModal';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const MonthlyGoals = () => {
  const [goals, setGoals]               = useState([]);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingGoal, setEditingGoal]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading]           = useState(true);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/monthly-goals');
      setGoals(res.data);
    } catch (err) {
      console.error('Erro ao buscar metas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/monthly-goals/${deleteTarget}`);
      setDeleteTarget(null);
      fetchGoals();
    } catch (err) {
      console.error('Erro ao excluir meta:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12, color: '#94a3b8' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14 }}>Carregando metas...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .mg-page { font-family: 'DM Sans', sans-serif; }
        .mg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
        .mg-btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 9px; border: none; background: #0f172a; color: #fff; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .mg-btn-primary:hover { background: #1e293b; }
        .mg-card { background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px; padding: 18px 20px; transition: box-shadow 0.15s; }
        .mg-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .mg-action-btn { width: 30px; height: 30px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
      `}</style>

      <div className="mg-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.4px', margin: '0 0 4px' }}>Metas Mensais</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Defina limites de gasto por categoria</p>
          </div>
          <button className="mg-btn-primary" onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}>
            <PlusCircle size={16} /> Nova meta
          </button>
        </div>

        {goals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <DollarSign size={26} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 6px' }}>Nenhuma meta cadastrada</h3>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 20px' }}>Defina metas mensais por categoria para controlar seus gastos.</p>
            <button className="mg-btn-primary" onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}>
              <PlusCircle size={15} /> Adicionar meta
            </button>
          </div>
        ) : (
          <div className="mg-grid">
            {goals.map(goal => {
              const pct = goal.percentageUsed ?? 0;
              const rounded = Math.min(Math.round(pct), 100);
              const over = pct > 100;
              const warn = pct > 80;
              const barColor = over ? '#ef4444' : warn ? '#f59e0b' : '#22c55e';
              const badgeBg = over ? '#fef2f2' : warn ? '#fffbeb' : '#f0fdf4';
              const badgeColor = over ? '#dc2626' : warn ? '#d97706' : '#16a34a';
              const status = over ? 'Meta extrapolada' : warn ? 'Quase no limite' : 'Dentro da meta';

              return (
                <div key={goal.id} className="mg-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {goal.Category?.icon || '📊'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{goal.Category?.name || 'Categoria'}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                          {dayjs(goal.month + '-01').format('MMMM [de] YYYY')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button className="mg-action-btn"
                        onClick={() => { setEditingGoal(goal); setIsModalOpen(true); }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Pencil size={14} color="#64748b" />
                      </button>
                      <button className="mg-action-btn"
                        onClick={() => setDeleteTarget(goal.id)}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: 22, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 4 }}>
                    R$ {fmt(goal.amount)}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>meta mensal</div>

                  <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${rounded}%`, background: barColor, transition: 'width 0.4s' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Usado: R$ {fmt(goal.usedAmount)}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: badgeBg, color: badgeColor }}>
                      {status} · {Math.round(pct)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <MonthlyGoalModal
          goal={editingGoal}
          onClose={() => setIsModalOpen(false)}
          onSaved={fetchGoals}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir meta"
        message="Deseja realmente excluir esta meta mensal?"
        confirmText="Excluir"
      />
    </>
  );
};

export default MonthlyGoals;

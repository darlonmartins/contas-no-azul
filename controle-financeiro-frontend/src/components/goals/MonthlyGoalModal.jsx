import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

const formatCurrencyInput = (value) => {
  const numeric = value.replace(/\D/g, '');
  if (!numeric) return '';
  return (Number(numeric) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const MonthlyGoalModal = ({ goal, onClose, onSaved }) => {
  const [month, setMonth]         = useState(goal?.month ? goal.month.slice(0, 7) : dayjs().format('YYYY-MM'));
  const [amount, setAmount]       = useState(goal?.amount ? Number(goal.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '');
  const [categoryId, setCategoryId] = useState(goal?.categoryId || '');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!month || !amount || !categoryId) { toast.error('Preencha todos os campos.'); return; }
    setLoading(true);
    const payload = {
      month,
      amount: parseFloat(amount.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')),
      categoryId,
    };
    try {
      if (goal) {
        await api.put(`/monthly-goals/${goal.id}`, payload);
        toast.success('Meta atualizada!');
      } else {
        await api.post('/monthly-goals', payload);
        toast.success('Meta criada!');
      }
      onClose();
      onSaved();
    } catch (err) {
      toast.error('Erro ao salvar meta.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .mgm-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.55); backdrop-filter: blur(3px); font-family: 'DM Sans', sans-serif; }
        .mgm-modal { background: #fff; border-radius: 18px; width: 95%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .mgm-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
        .mgm-title { font-size: 17px; font-weight: 600; color: #0f172a; letter-spacing: -0.3px; }
        .mgm-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: #f1f5f9; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: background 0.15s; }
        .mgm-close:hover { background: #e2e8f0; }
        .mgm-accent { height: 3px; border-radius: 999px; margin: 14px 24px 0; background: #10b981; }
        .mgm-body { padding: 20px 24px 24px; }
        .mgm-field { margin-bottom: 14px; }
        .mgm-field label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.2px; }
        .mgm-input, .mgm-select { width: 100%; padding: 10px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .mgm-input:focus, .mgm-select:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .mgm-input::placeholder { color: #94a3b8; }
        .mgm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .mgm-divider { height: 1px; background: #f1f5f9; margin: 4px 0 14px; }
        .mgm-btn-primary { width: 100%; padding: 11px; border-radius: 9px; border: none; background: #0f172a; color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .mgm-btn-primary:hover { background: #1e293b; }
        .mgm-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="mgm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="mgm-modal">
          <div className="mgm-header">
            <span className="mgm-title">{goal ? 'Editar meta' : 'Nova meta mensal'}</span>
            <button className="mgm-close" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="mgm-accent" />
          <div className="mgm-body">
            <form onSubmit={handleSubmit}>
              <div className="mgm-row">
                <div className="mgm-field">
                  <label>Mês</label>
                  <input className="mgm-input" type="month" value={month} onChange={e => setMonth(e.target.value)} required />
                </div>
                <div className="mgm-field">
                  <label>Valor (R$)</label>
                  <input className="mgm-input" type="text" inputMode="numeric" value={amount}
                    onChange={e => setAmount(formatCurrencyInput(e.target.value))} required placeholder="R$ 0,00" />
                </div>
              </div>
              <div className="mgm-field">
                <label>Categoria</label>
                <select className="mgm-select" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="mgm-divider" />
              <button type="submit" className="mgm-btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : goal ? 'Salvar alterações' : 'Criar meta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default MonthlyGoalModal;

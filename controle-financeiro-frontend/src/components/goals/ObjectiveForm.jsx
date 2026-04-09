import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '@/services/api';

const formatCurrencyInput = (value) => {
  const numeric = value.replace(/\D/g, '');
  if (!numeric) return '';
  return (Number(numeric) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const TEMPLATES = [
  { label: '🚗 Novo Carro',        name: 'Novo Carro',        category: 'Transporte' },
  { label: '🏠 Nova Casa',         name: 'Nova Casa',         category: 'Moradia' },
  { label: '✈️ Viagem de Férias',  name: 'Viagem de Férias',  category: 'Lazer' },
  { label: '🎓 Educação',          name: 'Educação',          category: 'Educação' },
  { label: '💰 Fundo de Emergência', name: 'Fundo de emergência', category: 'Reserva' },
  { label: '❤️ Saúde',            name: 'Saúde',             category: 'Saúde' },
  { label: '🎉 Festa',             name: 'Festa',             category: 'Eventos' },
  { label: '👶 Filhos',            name: 'Filhos',            category: 'Família' },
  { label: '🏖️ Aposentadoria',    name: 'Aposentadoria',     category: 'Investimentos' },
  { label: '💳 Quitar uma dívida', name: 'Quitar uma dívida', category: 'Dívidas' },
];

const ObjectiveForm = ({ onCancel, onObjectiveSaved, initialData = null }) => {
  const [name, setName]           = useState(initialData?.name || '');
  const [targetValue, setTargetValue] = useState(
    initialData?.targetAmount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || ''
  );
  const [goalDate, setGoalDate]   = useState(initialData?.dueDate?.slice(0, 10) || '');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const handleTemplateChange = (e) => {
    const selected = TEMPLATES.find(t => t.label === e.target.value);
    if (selected) {
      setName(selected.name);
      const match = categories.find(c => c.name.toLowerCase() === selected.category.toLowerCase());
      if (match) setCategoryId(match.id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      targetValue: parseFloat(targetValue.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')),
      goalDate,
      categoryId,
    };
    try {
      if (initialData?.id) {
        await api.put(`/goals/${initialData.id}`, payload);
        toast.success('Objetivo atualizado!');
      } else {
        await api.post('/goals', payload);
        toast.success('Objetivo criado!');
      }
      if (onObjectiveSaved) onObjectiveSaved();
    } catch (err) {
      toast.error('Erro ao salvar objetivo.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <style>{`
        .of-field { margin-bottom: 14px; }
        .of-field label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.2px; }
        .of-input, .of-select { width: 100%; padding: 10px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .of-input:focus, .of-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .of-input::placeholder { color: #94a3b8; }
        .of-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .of-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
        .of-btn-cancel { padding: 10px 20px; border-radius: 9px; border: 1.5px solid #e2e8f0; background: #fff; color: #374151; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; }
        .of-btn-cancel:hover { background: #f8fafc; }
        .of-btn-submit { padding: 10px 24px; border-radius: 9px; border: none; background: #0f172a; color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
        .of-btn-submit:hover { background: #1e293b; }
      `}</style>

      {!initialData && (
        <div className="of-field">
          <label>Modelo sugerido</label>
          <select className="of-select" defaultValue="" onChange={handleTemplateChange}>
            <option value="">Selecione um modelo ou preencha manualmente</option>
            {TEMPLATES.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
          </select>
        </div>
      )}

      <div className="of-field">
        <label>Nome do objetivo</label>
        <input className="of-input" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Viagem, Carro novo..." />
      </div>

      <div className="of-row">
        <div className="of-field">
          <label>Valor (R$)</label>
          <input className="of-input" type="text" inputMode="numeric" value={targetValue}
            onChange={e => setTargetValue(formatCurrencyInput(e.target.value))} required placeholder="R$ 0,00" />
        </div>
        <div className="of-field">
          <label>Data limite</label>
          <input className="of-input" type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)} required />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="of-field">
          <label>Categoria</label>
          <select className="of-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Selecione...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div className="of-actions">
        <button type="button" className="of-btn-cancel" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="of-btn-submit">
          {initialData ? 'Salvar alterações' : 'Criar objetivo'}
        </button>
      </div>
    </form>
  );
};

export default ObjectiveForm;

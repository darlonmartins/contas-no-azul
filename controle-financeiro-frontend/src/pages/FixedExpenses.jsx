import React, { useEffect, useState } from 'react';
import { getFixedExpenses, cancelFutureFixed, deleteAllFixed } from '../services/fixedExpenseService';
import { RefreshCw, Repeat, Trash2, StopCircle, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '—';

const typeLabel = { expense: 'Despesa', despesa_cartao: 'Cartão', income: 'Ganho' };
const typeColor = { expense: '#dc2626', despesa_cartao: '#7c3aed', income: '#16a34a' };
const typeBg    = { expense: '#fef2f2', despesa_cartao: '#f5f3ff', income: '#f0fdf4' };

const FixedExpenses = () => {
  const [groups, setGroups]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('active'); // active | finished | all
  const [confirmModal, setConfirmModal] = useState(null); // { group, mode: 'future' | 'all' }
  const [expanded, setExpanded]         = useState({});

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getFixedExpenses();
      setGroups(res.data);
    } catch (err) {
      toast.error('Erro ao carregar despesas fixas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleConfirm = async () => {
    if (!confirmModal) return;
    const { group, mode } = confirmModal;
    try {
      if (mode === 'future') {
        await cancelFutureFixed(group.fixedGroupId);
        toast.success('Parcelas futuras canceladas.');
      } else {
        await deleteAllFixed(group.fixedGroupId);
        toast.success('Despesa fixa removida por completo.');
      }
      setConfirmModal(null);
      fetch();
    } catch {
      toast.error('Erro ao realizar operação.');
    }
  };

  const filtered = groups.filter(g => {
    if (filter === 'active')   return g.remainingInstallments > 0;
    if (filter === 'finished') return g.remainingInstallments === 0;
    return true;
  });

  const activeCount   = groups.filter(g => g.remainingInstallments > 0).length;
  const finishedCount = groups.filter(g => g.remainingInstallments === 0).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .fe-page { font-family: 'DM Sans', sans-serif; }
        .fe-filter { padding: 7px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; background: #fff; color: #64748b; transition: all 0.15s; }
        .fe-filter:hover { background: #f8fafc; }
        .fe-filter.active { background: #0f172a; color: #fff; border-color: #0f172a; }
        .fe-card { background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px; padding: 18px 20px; margin-bottom: 10px; transition: box-shadow 0.15s; }
        .fe-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .fe-action-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 8px; border: 1.5px solid; font-size: 12px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
        .fe-skeleton { height: 88px; border-radius: 16px; background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 10px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .fe-progress-bar { height: 4px; background: #f1f5f9; border-radius: 99px; overflow: hidden; margin-top: 10px; }
        .fe-progress-fill { height: 100%; border-radius: 99px; transition: width 0.4s; }
      `}</style>

      <div className="fe-page">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.4px', margin: '0 0 4px' }}>Despesas Fixas</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
              {activeCount} ativa{activeCount !== 1 ? 's' : ''} · {finishedCount} encerrada{finishedCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={fetch}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <RefreshCw size={13} /> Atualizar
          </button>
        </div>

        {/* Aviso sobre despesas antigas */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <AlertTriangle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>
            Despesas fixas registradas <strong>antes desta atualização</strong> não aparecem aqui, pois não possuem identificador de grupo. Apenas as criadas a partir de agora serão listadas.
          </p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'active',   label: `Ativas (${activeCount})` },
            { key: 'finished', label: `Encerradas (${finishedCount})` },
            { key: 'all',      label: `Todas (${groups.length})` },
          ].map(f => (
            <button key={f.key} className={`fe-filter${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <>{[1,2,3].map(i => <div key={i} className="fe-skeleton" />)}</>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Repeat size={24} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 6px' }}>Nenhuma despesa fixa encontrada</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
              {filter === 'active' ? 'Nenhuma despesa fixa ativa no momento.' : 'Nenhum registro encontrado.'}
            </p>
          </div>
        ) : (
          filtered.map(group => {
            const pct = group.totalInstallments > 0
              ? Math.round((group.paidInstallments / group.totalInstallments) * 100)
              : 0;
            const isActive   = group.remainingInstallments > 0;
            const isExpanded = expanded[group.fixedGroupId];
            const color      = typeColor[group.type] || '#64748b';
            const bg         = typeBg[group.type] || '#f8fafc';

            return (
              <div key={group.fixedGroupId} className="fe-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Ícone */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                    {group.category?.icon || <Repeat size={18} color={color} />}
                  </div>

                  {/* Conteúdo */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{group.title}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: bg, color, marginLeft: 8 }}>
                          {typeLabel[group.type] || group.type}
                        </span>
                        {!isActive && (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: '#f1f5f9', color: '#64748b', marginLeft: 6 }}>
                            Encerrada
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.3px' }}>
                        R$ {fmt(group.amount)}<span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>/mês</span>
                      </span>
                    </div>

                    {/* Metadados */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap', fontSize: 12, color: '#94a3b8' }}>
                      {group.category && <span>📂 {group.category.name}</span>}
                      {group.account && <span>🏦 {group.account.name}</span>}
                      {isActive && group.nextDate && <span>📅 Próxima: {fmtDate(group.nextDate)}</span>}
                      {!isActive && group.lastDate && <span>📅 Encerrou: {fmtDate(group.lastDate)}</span>}
                    </div>

                    {/* Barra de progresso */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <div style={{ flex: 1, height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: isActive ? '#3b82f6' : '#22c55e' }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {group.paidInstallments}/{group.totalInstallments} meses
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                {isActive && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    <button
                      className="fe-action-btn"
                      style={{ borderColor: '#fde68a', color: '#d97706', background: '#fffbeb' }}
                      onClick={() => setConfirmModal({ group, mode: 'future' })}
                    >
                      <StopCircle size={13} /> Cancelar parcelas futuras
                    </button>
                    <button
                      className="fe-action-btn"
                      style={{ borderColor: '#fecaca', color: '#dc2626', background: '#fef2f2' }}
                      onClick={() => setConfirmModal({ group, mode: 'all' })}
                    >
                      <Trash2 size={13} /> Remover tudo
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de confirmação */}
      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)', fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '95%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: confirmModal.mode === 'future' ? '#fffbeb' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {confirmModal.mode === 'future'
                ? <StopCircle size={24} color="#d97706" />
                : <Trash2 size={24} color="#ef4444" />
              }
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', margin: '0 0 8px', textAlign: 'center' }}>
              {confirmModal.mode === 'future' ? 'Cancelar parcelas futuras' : 'Remover despesa fixa'}
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 6px', textAlign: 'center' }}>
              <strong>{confirmModal.group.title}</strong> — R$ {fmt(confirmModal.group.amount)}/mês
            </p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 24px', textAlign: 'center' }}>
              {confirmModal.mode === 'future'
                ? `Serão canceladas ${confirmModal.group.remainingInstallments} parcela(s) futura(s). As já pagas serão mantidas.`
                : `Todas as ${confirmModal.group.totalInstallments} transações (pagas e futuras) serão removidas permanentemente.`
              }
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{ flex: 1, padding: 10, borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                style={{ flex: 1, padding: 10, borderRadius: 9, border: 'none', background: confirmModal.mode === 'future' ? '#d97706' : '#ef4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FixedExpenses;

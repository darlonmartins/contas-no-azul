import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const MonthlyGoalCard = ({ goal, onEdit, onDelete }) => {
  const pct     = goal.percentageUsed ?? 0;
  const rounded = Math.min(Math.round(pct), 100);
  const over    = pct > 100;
  const warn    = pct > 80;
  const barColor   = over ? '#ef4444' : warn ? '#f59e0b' : '#22c55e';
  const badgeBg    = over ? '#fef2f2' : warn ? '#fffbeb' : '#f0fdf4';
  const badgeColor = over ? '#dc2626' : warn ? '#d97706' : '#16a34a';
  const status     = over ? 'Meta extrapolada' : warn ? 'Quase no limite' : 'Dentro da meta';

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 16,
      padding: '18px 20px', fontFamily: "'DM Sans', sans-serif",
      transition: 'box-shadow 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
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
          <button
            onClick={() => onEdit(goal)}
            style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Pencil size={14} color="#64748b" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
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
};

export default MonthlyGoalCard;

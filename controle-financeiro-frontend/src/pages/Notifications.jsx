import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Bell, CheckCheck, Trash2, Info, AlertTriangle,
  AlertCircle, CheckCircle2, RefreshCw,
} from 'lucide-react';

const typeConfig = {
  info:    { icon: Info,          bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe', dot: '#3b82f6' },
  success: { icon: CheckCircle2,  bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', dot: '#22c55e' },
  warning: { icon: AlertTriangle, bg: '#fffbeb', color: '#d97706', border: '#fde68a', dot: '#f59e0b' },
  danger:  { icon: AlertCircle,   bg: '#fef2f2', color: '#dc2626', border: '#fecaca', dot: '#ef4444' },
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
  return new Date(date).toLocaleDateString('pt-BR');
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | read

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Erro ao marcar notificação:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Erro ao marcar todas:', err);
    }
  };

  const handleDeleteRead = async () => {
    try {
      await api.delete('/notifications/read');
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (err) {
      console.error('Erro ao limpar notificações:', err);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .nf { font-family: 'DM Sans', sans-serif; max-width: 680px; }
        .nf-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .nf-title-wrap { display: flex; align-items: center; gap: 10px; }
        .nf-title { font-size: 22px; font-weight: 600; color: #0f172a; letter-spacing: -0.4px; }
        .nf-badge {
          background: #ef4444; color: #fff;
          font-size: 11px; font-weight: 700;
          padding: 2px 8px; border-radius: 999px; min-width: 20px; text-align: center;
        }
        .nf-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .nf-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 8px; border: 1.5px solid #e2e8f0;
          font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; background: #fff; color: #374151; transition: all 0.15s;
        }
        .nf-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .nf-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .nf-btn-danger { color: #dc2626; border-color: #fecaca; background: #fff; }
        .nf-btn-danger:hover { background: #fef2f2; }

        .nf-filters { display: flex; gap: 6px; margin-bottom: 20px; }
        .nf-filter {
          padding: 7px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0;
          font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; background: #fff; color: #64748b; transition: all 0.15s;
        }
        .nf-filter:hover { background: #f8fafc; }
        .nf-filter.active { background: #0f172a; color: #fff; border-color: #0f172a; }

        .nf-list { display: flex; flex-direction: column; gap: 10px; }

        .nf-item {
          background: #fff; border: 1.5px solid #f1f5f9;
          border-radius: 14px; padding: 16px 18px;
          display: flex; gap: 14px; align-items: flex-start;
          transition: all 0.15s; position: relative;
        }
        .nf-item.unread { border-left: 3px solid; }
        .nf-item:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .nf-item.read { opacity: 0.65; }

        .nf-icon-wrap {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .nf-content { flex: 1; min-width: 0; }
        .nf-message { font-size: 14px; color: #0f172a; line-height: 1.5; margin-bottom: 6px; }
        .nf-meta { display: flex; align-items: center; gap: 10px; }
        .nf-time { font-size: 12px; color: #94a3b8; }
        .nf-mark-btn {
          font-size: 12px; color: #3b82f6; background: none; border: none;
          cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif;
          font-weight: 500; transition: color 0.15s;
        }
        .nf-mark-btn:hover { color: #1d4ed8; }

        .nf-empty {
          text-align: center; padding: 64px 24px;
          background: #fff; border: 1.5px solid #f1f5f9;
          border-radius: 16px;
        }
        .nf-empty-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: #f8fafc; display: flex; align-items: center;
          justify-content: center; margin: 0 auto 16px;
        }
        .nf-empty p { font-size: 14px; color: #64748b; margin: 0; }
        .nf-empty h3 { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 6px; }

        .nf-loading { display: flex; flex-direction: column; gap: 10px; }
        .nf-skeleton {
          background: #f8fafc; border-radius: 14px; height: 76px;
          animation: shimmer 1.5s infinite linear;
          background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
          background-size: 200% 100%;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="nf">
        <div className="nf-header">
          <div className="nf-title-wrap">
            <span className="nf-title">Notificações</span>
            {unreadCount > 0 && <span className="nf-badge">{unreadCount}</span>}
          </div>
          <div className="nf-actions">
            <button className="nf-btn" onClick={fetchNotifications} title="Atualizar">
              <RefreshCw size={13} />
              Atualizar
            </button>
            {unreadCount > 0 && (
              <button className="nf-btn" onClick={handleMarkAllAsRead}>
                <CheckCheck size={13} />
                Marcar todas como lidas
              </button>
            )}
            {notifications.some(n => n.read) && (
              <button className="nf-btn nf-btn-danger" onClick={handleDeleteRead}>
                <Trash2 size={13} />
                Limpar lidas
              </button>
            )}
          </div>
        </div>

        <div className="nf-filters">
          {[
            { key: 'all',    label: 'Todas' },
            { key: 'unread', label: `Não lidas${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
            { key: 'read',   label: 'Lidas' },
          ].map(f => (
            <button
              key={f.key}
              className={`nf-filter${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="nf-loading">
            {[1,2,3].map(i => <div key={i} className="nf-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="nf-empty">
            <div className="nf-empty-icon">
              <Bell size={24} color="#94a3b8" />
            </div>
            <h3>Nenhuma notificação</h3>
            <p>
              {filter === 'unread'
                ? 'Você está em dia com tudo!'
                : filter === 'read'
                ? 'Nenhuma notificação lida ainda.'
                : 'Nenhuma notificação por enquanto.'}
            </p>
          </div>
        ) : (
          <div className="nf-list">
            {filtered.map(notif => {
              const cfg = typeConfig[notif.type] || typeConfig.info;
              const Icon = cfg.icon;
              return (
                <div
                  key={notif.id}
                  className={`nf-item${notif.read ? ' read' : ' unread'}`}
                  style={!notif.read ? { borderLeftColor: cfg.dot } : {}}
                >
                  <div className="nf-icon-wrap" style={{ background: cfg.bg }}>
                    <Icon size={18} color={cfg.color} />
                  </div>
                  <div className="nf-content">
                    <p className="nf-message">{notif.message}</p>
                    <div className="nf-meta">
                      <span className="nf-time">{timeAgo(notif.createdAt)}</span>
                      {!notif.read && (
                        <button
                          className="nf-mark-btn"
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications;

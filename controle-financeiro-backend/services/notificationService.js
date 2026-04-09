const { Notification, Transaction, Card, Objective, MonthlyGoal, Category } = require('../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

// ── Criar notificação manual ──────────────────────────────────
const createNotification = async ({ message, type = 'info', userId }) => {
  return Notification.create({ message, type, userId });
};

// ── Buscar todas do usuário (mais recentes primeiro) ──────────
const getNotifications = async (userId) => {
  return Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
};

// ── Marcar uma como lida ──────────────────────────────────────
const markAsRead = async (id, userId) => {
  const notif = await Notification.findOne({ where: { id, userId } });
  if (!notif) throw new Error('Notificação não encontrada.');
  notif.read = true;
  await notif.save();
  return notif;
};

// ── Marcar todas como lidas ───────────────────────────────────
const markAllAsRead = async (userId) => {
  await Notification.update({ read: true }, { where: { userId, read: false } });
};

// ── Deletar todas lidas ───────────────────────────────────────
const deleteRead = async (userId) => {
  await Notification.destroy({ where: { userId, read: true } });
};

// ── Gerar notificações automáticas ───────────────────────────
/**
 * Verifica a situação financeira do usuário e cria notificações
 * relevantes caso ainda não existam para o período.
 */
const generateAutoNotifications = async (userId) => {
  const today = dayjs();
  const monthKey = today.format('YYYY-MM');
  const startOfMonth = today.startOf('month').format('YYYY-MM-DD');
  const endOfMonth = today.endOf('month').format('YYYY-MM-DD');

  const created = [];

  // ── 1. Faturas de cartão vencendo nos próximos 5 dias ──
  const cards = await Card.findAll({ where: { userId } });
  for (const card of cards) {
    const dueDay = card.dueDate || card.fechamento;
    if (!dueDay) continue;

    const dueDate = today.date(dueDay);
    const diff = dueDate.diff(today, 'day');

    if (diff >= 0 && diff <= 5) {
      const key = `card-due-${card.id}-${monthKey}`;
      const exists = await Notification.findOne({
        where: { userId, message: { [Op.like]: `%${card.name}%vence%` } },
        order: [['createdAt', 'DESC']],
      });
      const alreadyThisMonth = exists && dayjs(exists.createdAt).format('YYYY-MM') === monthKey;

      if (!alreadyThisMonth) {
        const n = await createNotification({
          userId,
          type: diff <= 2 ? 'danger' : 'warning',
          message: `Fatura do cartão ${card.name} vence em ${diff === 0 ? 'hoje' : `${diff} dia${diff > 1 ? 's' : ''}`}.`,
        });
        created.push(n);
      }
    }
  }

  // ── 2. Metas mensais acima de 80% ──
  const metas = await MonthlyGoal.findAll({
    where: { userId, month: monthKey },
    include: [{ model: Category, attributes: ['id', 'name'] }],
  });

  for (const meta of metas) {
    const gastos = await Transaction.sum('amount', {
      where: {
        userId,
        type: { [Op.in]: ['expense', 'despesa_cartao'] },
        categoryId: meta.categoryId,
        date: { [Op.between]: [startOfMonth, endOfMonth] },
      },
    }) || 0;

    const pct = meta.amount > 0 ? (gastos / meta.amount) * 100 : 0;
    const catName = meta.Category?.name || 'categoria';

    if (pct >= 100) {
      const exists = await Notification.findOne({
        where: { userId, message: { [Op.like]: `%${catName}%ultrapassou%` } },
        order: [['createdAt', 'DESC']],
      });
      if (!exists || dayjs(exists.createdAt).format('YYYY-MM') !== monthKey) {
        const n = await createNotification({
          userId, type: 'danger',
          message: `Você ultrapassou a meta de ${catName} este mês (${Math.round(pct)}% usado).`,
        });
        created.push(n);
      }
    } else if (pct >= 80) {
      const exists = await Notification.findOne({
        where: { userId, message: { [Op.like]: `%${catName}%${Math.round(pct)}%%` } },
        order: [['createdAt', 'DESC']],
      });
      if (!exists || dayjs(exists.createdAt).format('YYYY-MM') !== monthKey) {
        const n = await createNotification({
          userId, type: 'warning',
          message: `Meta de ${catName} está em ${Math.round(pct)}% — fique de olho nos gastos.`,
        });
        created.push(n);
      }
    }
  }

  // ── 3. Objetivos próximos do prazo (≤ 30 dias) ──
  const objectives = await Objective.findAll({
    where: {
      userId,
      dueDate: { [Op.between]: [today.format('YYYY-MM-DD'), today.add(30, 'day').format('YYYY-MM-DD')] },
    },
  });

  for (const obj of objectives) {
    const diff = dayjs(obj.dueDate).diff(today, 'day');
    const exists = await Notification.findOne({
      where: { userId, message: { [Op.like]: `%${obj.name}%prazo%` } },
      order: [['createdAt', 'DESC']],
    });
    if (!exists || dayjs(exists.createdAt).diff(today, 'day') > 3) {
      const n = await createNotification({
        userId, type: diff <= 7 ? 'danger' : 'warning',
        message: `Objetivo "${obj.name}" tem prazo em ${diff} dia${diff !== 1 ? 's' : ''}.`,
      });
      created.push(n);
    }
  }

  return created;
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteRead,
  generateAutoNotifications,
};

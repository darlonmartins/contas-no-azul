const { Transaction, Category, Account } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Lista todas as despesas fixas agrupadas por fixedGroupId.
 * Retorna uma entrada por grupo com: título, valor, categoria,
 * total de parcelas, parcelas restantes e próxima data.
 */
const listFixedExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Busca todas as transações com fixedGroupId do usuário
    const transactions = await Transaction.findAll({
      where: {
        userId,
        fixedGroupId: { [Op.ne]: null },
      },
      include: [
        { model: Category, attributes: ['id', 'name', 'icon'] },
        { model: Account, as: 'fromAccount', attributes: ['id', 'name'] },
      ],
      order: [['date', 'ASC']],
    });

    // Agrupa por fixedGroupId
    const groups = {};
    for (const tx of transactions) {
      const gid = tx.fixedGroupId;
      if (!groups[gid]) {
        groups[gid] = {
          fixedGroupId: gid,
          title: tx.title,
          amount: parseFloat(tx.amount),
          type: tx.type,
          category: tx.Category ? { id: tx.Category.id, name: tx.Category.name, icon: tx.Category.icon } : null,
          account: tx.fromAccount ? { id: tx.fromAccount.id, name: tx.fromAccount.name } : null,
          all: [],
          future: [],
        };
      }
      groups[gid].all.push(tx);
      if (tx.date >= today) {
        groups[gid].future.push(tx);
      }
    }

    // Formata resposta
    const result = Object.values(groups).map(g => ({
      fixedGroupId: g.fixedGroupId,
      title: g.title,
      amount: g.amount,
      type: g.type,
      category: g.category,
      account: g.account,
      totalInstallments: g.all.length,
      remainingInstallments: g.future.length,
      paidInstallments: g.all.length - g.future.length,
      nextDate: g.future.length > 0 ? g.future[0].date : null,
      lastDate: g.all[g.all.length - 1]?.date || null,
      firstDate: g.all[0]?.date || null,
    })).sort((a, b) => {
      // Ativas primeiro, depois encerradas
      if (a.remainingInstallments > 0 && b.remainingInstallments === 0) return -1;
      if (a.remainingInstallments === 0 && b.remainingInstallments > 0) return 1;
      return (a.nextDate || '').localeCompare(b.nextDate || '');
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('Erro ao listar despesas fixas:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Cancela as parcelas FUTURAS de um grupo fixo.
 * Mantém as já pagas/passadas intactas.
 */
const cancelFutureFixed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fixedGroupId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const deleted = await Transaction.destroy({
      where: {
        userId,
        fixedGroupId,
        date: { [Op.gte]: today },
      },
    });

    res.status(200).json({ message: `${deleted} parcela(s) futura(s) cancelada(s).`, deleted });
  } catch (err) {
    console.error('Erro ao cancelar despesas fixas:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Cancela TODAS as parcelas de um grupo (passadas e futuras).
 */
const deleteAllFixed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fixedGroupId } = req.params;

    const deleted = await Transaction.destroy({
      where: { userId, fixedGroupId },
    });

    res.status(200).json({ message: `${deleted} transação(ões) removida(s).`, deleted });
  } catch (err) {
    console.error('Erro ao excluir grupo fixo:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listFixedExpenses, cancelFutureFixed, deleteAllFixed };

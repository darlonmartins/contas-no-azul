const { Invoice, Card, Account, Transaction } = require('../models');
const { Op } = require('sequelize');
const { getCardBillingPeriod } = require('../utils/getCardBillingPeriod');

/**
 * Soma da fatura no período de faturamento do mês informado,
 * considerando apenas despesas de cartão:
 *  - não parceladas (isInstallment = false), ou
 *  - parceladas com installmentNumber = 1 (primeira parcela)
 */
async function calcularTotalFatura(card, month, userId) {
  const [startDate, endDate] = getCardBillingPeriod(month, card.fechamento);

  const transacoes = await Transaction.findAll({
    where: {
      cardId: card.id,
      userId,
      type: 'despesa_cartao',
      date: { [Op.between]: [startDate, endDate] },
      [Op.or]: [
        { isInstallment: false },
        { isInstallment: true, installmentNumber: 1 },
      ],
    },
  });

  const total = transacoes.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  return Number(total.toFixed(2));
}

async function updateAccountAfterPayment(accountId, value) {
  if (!accountId) return;

  const account = await Account.findByPk(accountId);
  if (!account) return;

  const novoSaldo = parseFloat(account.saldoAtual || 0) - parseFloat(value || 0);
  await account.update({ saldoAtual: novoSaldo });
}

/**
 * Cria (ou atualiza) a fatura de um cartão para um determinado mês,
 * retornando a instância criada/atualizada.
 */
async function createInvoiceIfNeeded(cardId, month, userId) {
  const existing = await Invoice.findOne({ where: { cardId, month, userId } });

  const card = await Card.findOne({ where: { id: cardId, userId } });
  if (!card) throw new Error('Cartão não encontrado.');

  const [startDate, endDate] = getCardBillingPeriod(month, card.fechamento);

  const transactions = await Transaction.findAll({
    where: {
      userId,
      cardId,
      type: 'despesa_cartao',
      date: { [Op.between]: [startDate, endDate] },
      [Op.or]: [
        { isInstallment: false },
        { isInstallment: true, installmentNumber: 1 },
      ],
    },
  });

  const amount = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  if (!existing) {
    const newInvoice = await Invoice.create({ cardId, month, userId, amount });
    console.log(`🧾 Fatura criada automaticamente para ${month}`);
    return newInvoice;
  } else {
    existing.amount = amount;
    await existing.save();
    console.log(`🔄 Fatura existente atualizada para ${month}`);
    return existing;
  }
}

const invoiceController = {
  // Marca fatura como paga e ajusta disponível do cartão e saldo da conta (se informado)
  markAsPaid: async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, paymentDate, accountId } = req.body;
      const userId = req.user.id;

      const invoice = await Invoice.findOne({ where: { id, userId } });
      if (!invoice) return res.status(404).json({ message: 'Fatura não encontrada.' });

      const card = await Card.findOne({ where: { id: invoice.cardId, userId } });
      if (!card) return res.status(404).json({ message: 'Cartão não encontrado.' });

      const valorPago = parseFloat(amount);
      if (isNaN(valorPago) || valorPago <= 0) {
        return res.status(400).json({ message: 'Valor inválido.' });
      }

      // Atualiza fatura
      invoice.paid = true;
      invoice.paymentDate = paymentDate || new Date();
      invoice.amount = valorPago;
      await invoice.save();

      // Libera limite (sem ultrapassar o limite do cartão)
      const novoDisponivel = Math.min(
        parseFloat(card.availableLimit ?? 0) + valorPago,
        parseFloat(card.limit ?? 0)
      );
      card.availableLimit = novoDisponivel;
      await card.save();

      // Debita conta, se informada
      if (accountId) {
        const account = await Account.findByPk(accountId);
        if (account) {
          account.saldoAtual = parseFloat(account.saldoAtual || 0) - valorPago;
          await account.save();
        }
      }

      return res.json({ message: 'Fatura paga com sucesso.', invoice, card });
    } catch (error) {
      console.error('❌ Erro ao marcar fatura como paga:', error);
      return res.status(500).json({ message: 'Erro interno ao marcar fatura.' });
    }
  },

  // Desfaz o pagamento da fatura e volta o availableLimit ao estado anterior
  unpayInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const invoice = await Invoice.findOne({ where: { id, userId } });
      if (!invoice) return res.status(404).json({ message: 'Fatura não encontrada.' });

      const card = await Card.findOne({ where: { id: invoice.cardId, userId } });
      if (!card) return res.status(404).json({ message: 'Cartão não encontrado.' });

      const total = await calcularTotalFatura(card, invoice.month, userId);

      if (invoice.paid) {
        // Reaplica o consumo no availableLimit
        const novoDisponivel = Math.max(
          parseFloat(card.availableLimit ?? 0) - total,
          0
        );
        card.availableLimit = novoDisponivel;
        await card.save();

        // Restaura a fatura como não paga
        invoice.paid = false;
        invoice.paymentDate = null;
        invoice.amount = total;
        await invoice.save();
      }

      return res.json({ message: 'Fatura desmarcada como paga com sucesso.', invoice, card });
    } catch (err) {
      console.error('❌ Erro ao desfazer pagamento da fatura:', err);
      return res.status(500).json({ message: 'Erro interno ao desfazer pagamento da fatura.' });
    }
  },

  // Verifica/cria fatura do mês e retorna a instância
  createIfNotExists: async (req, res) => {
    try {
      const { cardId, month } = req.body;
      const userId = req.user.id;

      const invoice = await createInvoiceIfNeeded(cardId, month, userId);

      return res.json({
        message: 'Fatura verificada/criada com sucesso.',
        invoice,
      });
    } catch (error) {
      console.error('❌ Erro ao criar/verificar fatura:', error);
      return res.status(500).json({ error: 'Erro ao criar/verificar fatura.' });
    }
  },

  // Lista faturas de um cartão (ordem desc por mês)
  listByCard: async (req, res) => {
    try {
      const { cardId } = req.params;
      const userId = req.user.id;

      const invoices = await Invoice.findAll({
        where: { cardId, userId },
        order: [['month', 'DESC']],
      });

      res.json(invoices);
    } catch (error) {
      console.error('❌ Erro ao listar faturas do cartão:', error);
      res.status(500).json({ message: 'Erro ao listar faturas.' });
    }
  },

  // Informações da fatura do mês (dados do cartão + totais)
  getInvoiceInfo: async (req, res) => {
    try {
      const { cardId, month } = req.query;
      const userId = req.user.id;

      if (!cardId || !month) {
        return res.status(400).json({ message: 'Parâmetros cardId e month são obrigatórios.' });
      }

      const card = await Card.findOne({ where: { id: cardId, userId } });
      if (!card) return res.status(404).json({ message: 'Cartão não encontrado.' });

      const invoice = await Invoice.findOne({ where: { cardId, month, userId } });

      const [year, monthStr] = month.split('-');
      const monthNum = parseInt(monthStr, 10) - 1;

      // A data de fechamento/vencimento é construída a partir do mês solicitado
      const closingDate = new Date(year, monthNum, card.fechamento);
      const dueDate = new Date(year, monthNum, card.dueDate);

      return res.json({
        cardName: card.name,
        brand: card.brand,
        limit: card.limit,
        availableLimit: card.availableLimit,
        closingDate,
        dueDate,
        total: invoice ? invoice.amount : 0,
        invoiceId: invoice?.id || null,
        paid: invoice?.paid || false,
      });
    } catch (error) {
      console.error('❌ Erro ao obter dados da fatura:', error);
      return res.status(500).json({ message: 'Erro ao obter dados da fatura.' });
    }
  },

  /**
   * 🔮 Previsão da fatura para um cartão em um mês específico (ou mês atual, se não vier).
   * Usa o mesmo critério de parcelas de calcularTotalFatura.
   *
   * GET /api/invoices/:cardId/forecast?month=YYYY-MM (opcional)
   *
   * Resposta:
   * {
   *   cardId, name, limit, availableLimit,
   *   currentCycleTotal, closingDate, dueDate,
   *   period: { start, end }, month
   * }
   */
  forecast: async (req, res) => {
    try {
      const userId = req.user.id;
      const { cardId } = req.params;
      const { month } = req.query;

      const card = await Card.findOne({ where: { id: cardId, userId } });
      if (!card) return res.status(404).json({ error: 'Cartão não encontrado' });

      const monthKey = month || new Date().toISOString().slice(0, 7);
      const [startDate, endDate] = getCardBillingPeriod(monthKey, card.fechamento);

      // Soma das despesas do ciclo (mesma regra de parcelas do restante do controller)
      const total = await Transaction.sum('amount', {
        where: {
          userId,
          cardId: card.id,
          type: 'despesa_cartao',
          date: { [Op.between]: [startDate, endDate] },
          [Op.or]: [
            { isInstallment: false },
            { isInstallment: true, installmentNumber: 1 },
          ],
        },
      });

      return res.json({
        cardId: card.id,
        name: card.name,
        limit: Number(card.limit || 0),
        availableLimit: Number(card.availableLimit ?? card.limit ?? 0),
        currentCycleTotal: Number(total || 0),
        closingDate: card.fechamento,
        dueDate: card.dueDate,
        period: { start: startDate, end: endDate },
        month: monthKey,
      });
    } catch (e) {
      console.error('forecast error', e);
      return res.status(500).json({ error: 'Erro ao prever fatura' });
    }
  },

  // Exporta função auxiliar também (mantendo compatibilidade)
  createInvoiceIfNeeded,
};

module.exports = invoiceController;

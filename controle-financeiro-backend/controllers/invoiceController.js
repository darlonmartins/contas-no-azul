const { Invoice, Card, Account, Transaction } = require('../models');
const { Op } = require('sequelize');
const { getCardBillingPeriod } = require('../utils/getCardBillingPeriod');

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
        { isInstallment: true, installmentNumber: 1 }
      ]
    }
  });

  const total = transacoes.reduce((sum, t) => sum + Number(t.amount), 0);
  return Number(total.toFixed(2));
}

async function updateAccountAfterPayment(accountId, value) {
  if (!accountId) return;

  const account = await Account.findByPk(accountId);
  if (!account) return;

  const novoSaldo = parseFloat(account.saldoAtual) - parseFloat(value);
  await account.update({ saldoAtual: novoSaldo });
}

const invoiceController = {
  async markAsPaid(req, res) {
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
  
      // 🟢 Atualiza fatura
      invoice.paid = true;
      invoice.paymentDate = paymentDate || new Date();
      invoice.amount = valorPago;
      await invoice.save();
  
      // 🟢 Atualiza limite disponível do cartão
      const novoLimite = Math.min(card.availableLimit + valorPago, card.limit);
      card.availableLimit = novoLimite;
      await card.save();
  
      // 🟢 Atualiza saldo da conta (se fornecida)
      if (accountId) {
        const { Account } = require('../models');
        const account = await Account.findByPk(accountId);
        if (account) {
          account.saldoAtual = parseFloat(account.saldoAtual) - valorPago;
          await account.save();
        }
      }
  
      return res.json({ message: 'Fatura paga com sucesso.', invoice, card });
    } catch (error) {
      console.error('❌ Erro ao marcar fatura como paga:', error);
      return res.status(500).json({ message: 'Erro interno ao marcar fatura.' });
    }
  }
  
  ,

  async unpayInvoice(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const invoice = await Invoice.findOne({ where: { id, userId } });
      if (!invoice) return res.status(404).json({ message: 'Fatura não encontrada.' });

      const card = await Card.findOne({ where: { id: invoice.cardId, userId } });
      if (!card) return res.status(404).json({ message: 'Cartão não encontrado.' });

      const total = await calcularTotalFatura(card, invoice.month, userId);

      if (invoice.paid) {
        card.availableLimit = Math.max(card.availableLimit - total, 0);
        await card.save();

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

  async createIfNotExists(req, res) {
    try {
      const { cardId, month } = req.body;
      const userId = req.user.id;
  
      let invoice = await Invoice.findOne({ where: { cardId, month, userId } });
  
      const card = await Card.findOne({ where: { id: cardId, userId } });
      if (!card) return res.status(404).json({ message: 'Cartão não encontrado.' });
  
      const [startDate, endDate] = getCardBillingPeriod(month, card.fechamento);
  
      const transactions = await Transaction.findAll({
        where: {
          userId,
          cardId,
          type: 'despesa_cartao',
          date: { [Op.between]: [startDate, endDate] },
          [Op.or]: [
            { isInstallment: false },
            { isInstallment: true, installmentNumber: 1 }
          ]
        },
      });
  
      const amount = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
      if (!invoice) {
        invoice = await Invoice.create({ cardId, month, userId, amount });
      } else {
        // 🔁 Atualiza o valor da fatura existente
        invoice.amount = amount;
        await invoice.save();
      }
  
      return res.json(invoice);
    } catch (error) {
      console.error('❌ Erro ao criar/verificar fatura:', error);
      return res.status(500).json({ error: 'Erro ao criar/verificar fatura.' });
    }
  } ,

  async listByCard(req, res) {
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

  async getInvoiceInfo(req, res) {
    try {
      const { cardId, month } = req.query;
      const userId = req.user.id;
  
      if (!cardId || !month) {
        return res.status(400).json({ message: 'Parâmetros cardId e month são obrigatórios.' });
      }
  
      const card = await Card.findOne({ where: { id: cardId, userId } });
      if (!card) return res.status(404).json({ message: 'Cartão não encontrado.' });
  
      // ✅ Carrega a fatura correspondente
      const invoice = await Invoice.findOne({ where: { cardId, month, userId } });
  
      // Calcula datas com base no fechamento do cartão
      const [year, monthStr] = month.split('-');
      const monthNum = parseInt(monthStr, 10) - 1;
  
      const closingDate = new Date(year, monthNum + 1, card.fechamento);
      const dueDate = new Date(year, monthNum + 1, card.dueDate);
  
      return res.json({
        cardName: card.name,
        brand: card.brand,
        limit: card.limit,
        availableLimit: card.availableLimit,
        closingDate,
        dueDate,
        total: invoice ? invoice.amount : 0,       // ✅ valor da fatura
        invoiceId: invoice?.id || null,
        paid: invoice?.paid || false,
      });
    } catch (error) {
      console.error('❌ Erro ao obter dados da fatura:', error);
      return res.status(500).json({ message: 'Erro ao obter dados da fatura.' });
    }
  }
  ,
};

module.exports = invoiceController;


const { Transaction, Category, Account, Card, Objective, sequelize } = require("../models");
const { Op } = require('sequelize');
const { getCurrentMonthRange } = require("../utils/getCurrentMonthRange");
const { getCardBillingPeriod } = require("../utils/getCardBillingPeriod");
const { getExactMonthRange } = require("../utils/getExactMonthRange");
const parseInstallments = require("../utils/parseInstallments");
const { v4: uuidv4 } = require('uuid');
const getInvoiceMonth = require("../utils/getInvoiceMonth");
const invoiceController = require("./invoiceController");

// ─────────────────────────────────────────
// Helpers de saldo (usam transação Sequelize)
// ─────────────────────────────────────────

const updateAccountBalance = async (accountId, value, type, isRevert = false, t = null) => {
  if (!accountId) return;
  const options = t ? { transaction: t } : {};
  const account = await Account.findByPk(accountId, options);
  if (!account) return;

  const saldoAtual = parseFloat(account.saldoAtual);
  const valor = parseFloat(value);
  let novoSaldo;

  if (type === "income") {
    novoSaldo = isRevert ? saldoAtual - valor : saldoAtual + valor;
  } else if (["expense", "despesa_cartao", "goal"].includes(type)) {
    novoSaldo = isRevert ? saldoAtual + valor : saldoAtual - valor;
  } else {
    return;
  }

  await account.update({ saldoAtual: novoSaldo }, options);
};

const updateTransferBalance = async (fromId, toId, value, isRevert = false, t = null) => {
  if (!fromId || !toId) return;
  const options = t ? { transaction: t } : {};
  const valor = parseFloat(value);

  const [fromAccount, toAccount] = await Promise.all([
    Account.findByPk(fromId, options),
    Account.findByPk(toId, options),
  ]);
  if (!fromAccount || !toAccount) return;

  const saldoOrigem  = parseFloat(fromAccount.saldoAtual);
  const saldoDestino = parseFloat(toAccount.saldoAtual);

  await fromAccount.update({ saldoAtual: isRevert ? saldoOrigem + valor : saldoOrigem - valor }, options);
  await toAccount.update(  { saldoAtual: isRevert ? saldoDestino - valor : saldoDestino + valor }, options);
};

// ─────────────────────────────────────────
// Criar nova transação
// ─────────────────────────────────────────

const createTransaction = async (req, res) => {
  const {
    title, amount, type, date,
    isInstallment, totalInstallments,
    categoryId, fromAccountId, toAccountId,
    cardId, isFixedExpense, goalId
  } = req.body;

  const userId = req.user.id;

  const typeMap = {
    ganho: "income",
    despesa: "expense",
    transferencia: "transfer",
    despesa_cartao: "despesa_cartao",
    objetivo: "goal"
  };

  const translatedType = typeMap[type] || type;
  const validTypes = ["income", "expense", "transfer", "despesa_cartao", "goal"];
  if (!validTypes.includes(translatedType)) {
    return res.status(400).json({ error: "Tipo de transação inválido." });
  }

  // ➡️ Parcelado com cartão
  if (translatedType === "despesa_cartao" && isInstallment && totalInstallments > 1) {
    const t = await sequelize.transaction();
    try {
      const installmentGroupId = uuidv4();

      const parcelasGeradas = parseInstallments({
        title, amount, type: translatedType, date,
        userId, totalInstallments, categoryId,
        fromAccountId, toAccountId, cardId,
      }, totalInstallments);

      const parcelas = parcelasGeradas.map((p, index) => ({
        ...p,
        isInstallment: true,
        installmentNumber: index + 1,
        totalInstallments,
        installmentGroupId,
        originalTotalAmount: index === 0 ? parseFloat(amount) : null
      }));

      const card = await Card.findByPk(cardId, { transaction: t });
      if (card) {
        const valorTotal = parseFloat(amount);
        card.availableLimit = Math.max(0, parseFloat(card.availableLimit) - valorTotal);
        await card.save({ transaction: t });

        const faturaMonth = getInvoiceMonth(date, card.fechamento);
        await invoiceController.createInvoiceIfNeeded(cardId, faturaMonth, userId);
      }

      const result = await Transaction.bulkCreate(parcelas, { transaction: t });
      await t.commit();
      return res.status(201).json(result);
    } catch (error) {
      await t.rollback();
      console.error("Erro ao criar transação parcelada:", error);
      return res.status(500).json({ error: "Erro ao criar transação parcelada" });
    }
  }

  // ➡️ Despesa fixa
  if (isFixedExpense) {
    try {
      const baseDate = new Date(date);
      const fixedExpenses = [];

      for (let i = 0; i < 12; i++) {
        const futureDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
        fixedExpenses.push({
          title, amount, type: translatedType,
          date: futureDate.toISOString().split("T")[0],
          isInstallment: false, totalInstallments: null, currentInstallment: null,
          userId,
          categoryId: translatedType === "transfer" ? null : categoryId || null,
          fromAccountId: ["income", "expense", "transfer", "despesa_cartao"].includes(translatedType) ? fromAccountId : null,
          toAccountId: translatedType === "transfer" ? toAccountId : null,
          cardId: translatedType === "despesa_cartao" ? cardId : null,
        });
      }

      const result = await Transaction.bulkCreate(fixedExpenses);
      return res.status(201).json(result);
    } catch (error) {
      console.error("Erro ao criar despesa fixa:", error);
      return res.status(500).json({ error: "Erro ao criar despesa fixa" });
    }
  }

  // ➡️ Depósito em objetivo
  if (translatedType === "goal") {
    if (!goalId) return res.status(400).json({ error: "goalId é obrigatório para transações do tipo objetivo." });

    const t = await sequelize.transaction();
    try {
      const goal = await Objective.findByPk(goalId, { transaction: t });
      if (!goal) { await t.rollback(); return res.status(404).json({ error: "Objetivo não encontrado." }); }

      const transaction = await Transaction.create({
        title: title || `Depósito para objetivo: ${goal.name}`,
        amount, type: translatedType, date, userId, fromAccountId, goalId,
      }, { transaction: t });

      await updateAccountBalance(fromAccountId, amount, "goal", false, t);
      goal.currentAmount += parseFloat(amount);
      await goal.save({ transaction: t });

      await t.commit();
      return res.status(201).json(transaction);
    } catch (error) {
      await t.rollback();
      console.error("Erro ao criar depósito em objetivo:", error);
      return res.status(500).json({ error: "Erro ao criar depósito em objetivo" });
    }
  }

  // ➡️ Transação normal
  const t = await sequelize.transaction();
  try {
    const transaction = await Transaction.create({
      title, amount, type: translatedType, date,
      isInstallment,
      totalInstallments: isInstallment ? totalInstallments : null,
      currentInstallment: isInstallment ? 1 : null,
      userId,
      categoryId: translatedType === "transfer" ? null : categoryId || null,
      fromAccountId: ["income", "expense", "transfer", "despesa_cartao"].includes(translatedType) ? fromAccountId : null,
      toAccountId: translatedType === "transfer" ? toAccountId : null,
      cardId: translatedType === "despesa_cartao" ? cardId : null,
    }, { transaction: t });

    if (translatedType === "despesa_cartao") {
      const card = await Card.findByPk(cardId, { transaction: t });
      if (card) {
        const faturaMonth = getInvoiceMonth(date, card.fechamento);
        await invoiceController.createInvoiceIfNeeded(cardId, faturaMonth, userId);
      }
    }

    if (["income", "expense", "despesa_cartao"].includes(translatedType)) {
      await updateAccountBalance(fromAccountId, amount, translatedType, false, t);
    } else if (translatedType === "transfer") {
      await updateTransferBalance(fromAccountId, toAccountId, amount, false, t);
    }

    await t.commit();
    return res.status(201).json(transaction);
  } catch (error) {
    await t.rollback();
    console.error("Erro ao criar transação:", error);
    return res.status(500).json({ error: "Erro ao criar transação" });
  }
};

// ─────────────────────────────────────────
// Atualizar transação
// ─────────────────────────────────────────

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const {
    title, amount, type, date,
    isInstallment, totalInstallments, currentInstallment,
    categoryId, fromAccountId, toAccountId, cardId,
    updateAllInstallments, updateFixedExpense,
  } = req.body;

  const typeMap = {
    ganho: "income", despesa: "expense",
    transferencia: "transfer", despesa_cartao: "despesa_cartao", meta: "goal"
  };
  const translatedType = typeMap[type] || type;

  try {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return res.status(404).json({ error: "Transação não encontrada" });

    // Atualizar todas as parcelas
    if (updateAllInstallments && transaction.isInstallment) {
      const card = await Card.findByPk(transaction.cardId);
      if (card && transaction.installmentNumber === 1) {
        const valorAntigo = parseFloat(transaction.amount) * parseInt(transaction.totalInstallments);
        card.availableLimit += valorAntigo;
      }

      await Transaction.destroy({ where: { installmentGroupId: transaction.installmentGroupId } });

      const novasParcelas = parseInstallments({
        title, amount, type: translatedType, date,
        userId: transaction.userId,
        categoryId, fromAccountId, toAccountId, cardId
      }, parseInt(totalInstallments));

      if (card) {
        const novoTotal = parseFloat(amount) * parseInt(totalInstallments);
        card.availableLimit -= novoTotal;
        await card.save();
      }

      const criadas = await Transaction.bulkCreate(novasParcelas);
      return res.json({ message: "Parcelas atualizadas com sucesso", data: criadas });
    }

    // Atualizar despesas fixas futuras
    if (updateFixedExpense) {
      const baseDate = new Date(date);
      const futureDates = [];
      for (let i = 1; i <= 12; i++) {
        const future = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
        futureDates.push(future.toISOString().split('T')[0]);
      }

      const fixedExpenses = futureDates.map(d => ({
        title, amount, type: translatedType, date: d,
        isInstallment: false, totalInstallments: null, currentInstallment: null,
        userId: transaction.userId,
        categoryId: translatedType === "transfer" ? null : categoryId || null,
        fromAccountId: ["income", "expense", "transfer"].includes(translatedType) ? fromAccountId : null,
        toAccountId: translatedType === "transfer" ? toAccountId : null,
        cardId: translatedType === "despesa_cartao" ? cardId : null,
      }));

      await Transaction.bulkCreate(fixedExpenses);
      return res.json({ message: "Despesas fixas futuras criadas com sucesso." });
    }

    // Atualização individual com transação atômica
    const t = await sequelize.transaction();
    try {
      if (transaction.type === "despesa_cartao") {
        const card = await Card.findByPk(transaction.cardId, { transaction: t });
        if (card) {
          const diferenca = parseFloat(amount) - parseFloat(transaction.amount);
          if (diferenca !== 0) {
            card.availableLimit -= diferenca;
            await card.save({ transaction: t });
          }
        }
      } else if (["income", "expense"].includes(transaction.type)) {
        await updateAccountBalance(transaction.fromAccountId, transaction.amount, transaction.type, true, t);
      } else if (transaction.type === "transfer") {
        await updateTransferBalance(transaction.fromAccountId, transaction.toAccountId, transaction.amount, true, t);
      }

      await transaction.update({
        title, amount, type: translatedType, date,
        isInstallment, totalInstallments, currentInstallment,
        categoryId: translatedType === "transfer" ? null : categoryId || null,
        fromAccountId: ["income", "expense", "transfer", "despesa_cartao"].includes(translatedType) ? fromAccountId : null,
        toAccountId: translatedType === "transfer" ? toAccountId : null,
        cardId: translatedType === "despesa_cartao" ? cardId : null,
      }, { transaction: t });

      if (["income", "expense", "despesa_cartao"].includes(translatedType)) {
        await updateAccountBalance(fromAccountId, amount, translatedType, false, t);
      } else if (translatedType === "transfer") {
        await updateTransferBalance(fromAccountId, toAccountId, amount, false, t);
      }

      await t.commit();
      return res.json(transaction);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) {
    console.error("Erro ao atualizar transação:", err);
    res.status(500).json({ error: "Erro ao atualizar transação" });
  }
};

// ─────────────────────────────────────────
// Excluir transação
// ─────────────────────────────────────────

const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  const t = await sequelize.transaction();
  try {
    const transaction = await Transaction.findByPk(id, { transaction: t });
    if (!transaction) { await t.rollback(); return res.status(404).json({ error: "Transação não encontrada" }); }

    if (transaction.type === "despesa_cartao") {
      const card = await Card.findByPk(transaction.cardId, { transaction: t });
      if (card) {
        let valorEstorno = 0;

        if (transaction.isInstallment) {
          if (transaction.installmentNumber === 1) {
            const allParcelas = await Transaction.findAll({
              where: { installmentGroupId: transaction.installmentGroupId },
              transaction: t,
            });
            valorEstorno = transaction.originalTotalAmount ||
              allParcelas.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            await Transaction.destroy({ where: { installmentGroupId: transaction.installmentGroupId }, transaction: t });
          } else {
            valorEstorno = parseFloat(transaction.amount);
            await transaction.destroy({ transaction: t });
          }
        } else {
          valorEstorno = parseFloat(transaction.amount);
          await transaction.destroy({ transaction: t });
        }

        card.availableLimit += valorEstorno;
        await card.save({ transaction: t });
      }
    } else {
      if (["income", "expense"].includes(transaction.type)) {
        await updateAccountBalance(transaction.fromAccountId, transaction.amount, transaction.type, true, t);
      } else if (transaction.type === "transfer") {
        await updateTransferBalance(transaction.fromAccountId, transaction.toAccountId, transaction.amount, true, t);
      }
      await transaction.destroy({ transaction: t });
    }

    await t.commit();
    return res.status(204).send();
  } catch (err) {
    await t.rollback();
    console.error("Erro ao excluir transação:", err);
    return res.status(500).json({ error: "Erro ao excluir transação" });
  }
};

// ─────────────────────────────────────────
// Listagens
// ─────────────────────────────────────────

const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Category,
          attributes: ["id", "name", "icon", "parentId"],
          include: [{ model: Category, as: "parent", attributes: ["id", "name", "icon"] }]
        },
        { model: Account, as: "fromAccount", attributes: ["name"] },
        { model: Account, as: "toAccount",   attributes: ["name"] },
        { model: Card,    as: "card",        attributes: ["name", "brand"] },
      ],
      order: [["date", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), data: transactions });
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    res.status(500).json({ error: "Erro ao buscar transações" });
  }
};

const getTransactionsByMonth = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.user.id;
    const [startDate, endDate] = getExactMonthRange(month);

    const transactions = await Transaction.findAll({
      where: { userId, date: { [Op.between]: [startDate, endDate] } },
      include: [
        { model: Category, attributes: ["name"] },
        { model: Account, as: "fromAccount", attributes: ["name"] },
        { model: Account, as: "toAccount",   attributes: ["name"] },
        { model: Card,    as: "card",        attributes: ["name", "brand"] },
      ],
      order: [["date", "DESC"]],
    });

    res.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações por mês:", error);
    res.status(500).json({ error: "Erro ao buscar transações do mês" });
  }
};

const getTransactionsByDay = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    const startDate = new Date(`${date}T00:00:00`);
    const endDate   = new Date(`${date}T23:59:59`);

    const transactions = await Transaction.findAll({
      where: { userId, date: { [Op.between]: [startDate, endDate] } },
      include: [
        { model: Category, attributes: ["name"] },
        { model: Account, as: "fromAccount", attributes: ["name"] },
        { model: Account, as: "toAccount",   attributes: ["name"] },
        { model: Card,    as: "card",        attributes: ["name", "brand"] },
      ],
      order: [["date", "DESC"]],
    });

    res.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações por dia:", error);
    res.status(500).json({ error: "Erro ao buscar transações por dia" });
  }
};

const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, category } = req.query;
    const where = { userId };

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [startDate, endDate] = getExactMonthRange(month);
      where.date = { [Op.between]: [startDate, endDate] };
    }
    if (category) {
      where["$Category.name$"] = category;
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        { model: Category, attributes: ["name"] },
        { model: Account, as: "fromAccount", attributes: ["name"] },
        { model: Account, as: "toAccount",   attributes: ["name"] },
        { model: Card,    as: "card",        attributes: ["name", "brand"] },
      ],
    });

    const summary = { income: 0, expense: 0, transfer: 0, despesa_cartao: 0 };
    transactions.forEach((t) => {
      if (summary[t.type] !== undefined) summary[t.type] += parseFloat(t.amount);
    });

    const balance = summary.income - summary.expense - summary.despesa_cartao;
    res.json({ ...summary, balance });
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    res.status(500).json({ error: "Erro ao gerar resumo de transações" });
  }
};

// ─────────────────────────────────────────
// Previsões por cartão
// ─────────────────────────────────────────

const getFutureForecastByCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;

    const card = await Card.findByPk(cardId);
    if (!card || card.userId !== userId) {
      return res.status(404).json({ message: "Cartão não encontrado ou não pertence ao usuário." });
    }

    const today = new Date();
    const forecast = [];

    for (let i = 0; i < 6; i++) {
      const future = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthStr = future.toISOString().slice(0, 7);
      const [startDate, endDate] = getCardBillingPeriod(monthStr, card.fechamento);

      const transactions = await Transaction.findAll({
        where: { userId, cardId, type: "despesa_cartao", date: { [Op.between]: [startDate, endDate] } }
      });

      const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      forecast.push({ month: monthStr, total: Number(total.toFixed(2)) });
    }

    res.json(forecast);
  } catch (err) {
    console.error("Erro ao gerar previsão futura de fatura:", err);
    res.status(500).json({ message: "Erro ao gerar previsão de fatura" });
  }
};

const getTransactionsByCardAndMonth = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { month } = req.query;
    const userId = req.user.id;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Mês inválido. Use o formato YYYY-MM.' });
    }

    const card = await Card.findByPk(cardId);
    if (!card || card.userId !== userId) {
      return res.status(404).json({ message: "Cartão não encontrado ou não pertence ao usuário." });
    }

    const [startDate, endDate] = getCardBillingPeriod(month, card.fechamento);

    const transactions = await Transaction.findAll({
      where: { cardId, userId, type: 'despesa_cartao', date: { [Op.between]: [startDate, endDate] } },
      include: [
        { model: Category, include: [{ model: Category, as: "parent", attributes: ["name"] }] },
        { model: Card, as: "card" }
      ],
      order: [['date', 'ASC']]
    });

    res.json({ startDate, endDate, transactions });
  } catch (err) {
    console.error("Erro ao buscar transações por cartão e mês:", err);
    res.status(500).json({ message: err.message || 'Erro interno do servidor.' });
  }
};

const getForecastByCard = async (req, res) => {
  const { cardId } = req.params;
  const userId = req.user.id;
  const selectedMonth = req.query.month;

  try {
    const card = await Card.findByPk(cardId);
    if (!card || card.userId !== userId) {
      return res.status(404).json({ message: "Cartão não encontrado ou não pertence ao usuário." });
    }
    if (!selectedMonth || !/^\d{4}-\d{2}$/.test(selectedMonth)) {
      return res.status(400).json({ message: "Parâmetro 'month' inválido ou ausente." });
    }

    const baseInvoiceMonth = getInvoiceMonth(`${selectedMonth}-01`, card.fechamento);

    const allTransactions = await Transaction.findAll({
      where: { userId, cardId, type: "despesa_cartao" }
    });

    const futureInstallments = allTransactions.filter(tx => {
      const txInvoiceMonth = getInvoiceMonth(tx.date, card.fechamento);
      return txInvoiceMonth > baseInvoiceMonth;
    });

    const total = futureInstallments.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    return res.json({ total, forecast: futureInstallments });
  } catch (err) {
    console.error("Erro ao buscar parcelas futuras do cartão:", err);
    return res.status(500).json({ message: "Erro ao buscar parcelas futuras do cartão." });
  }
};

const getMonthlyForecastByCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;

    const card = await Card.findByPk(cardId);
    if (!card || card.userId !== userId) {
      return res.status(404).json({ message: "Cartão não encontrado ou não pertence ao usuário." });
    }

    const today = new Date();
    const forecastTransactions = await Transaction.findAll({
      where: { cardId, userId, type: "despesa_cartao" }
    });

    const futureMonths = new Map();
    for (const t of forecastTransactions) {
      const faturaMonth = getInvoiceMonth(t.date, card.fechamento);
      futureMonths.set(faturaMonth, (futureMonths.get(faturaMonth) || 0) + parseFloat(t.amount));
    }

    const months = [];
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let i = 0; i < 6; i++) {
      const future = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1);
      const monthStr = future.toISOString().slice(0, 7);
      months.push({ month: monthStr, total: Number((futureMonths.get(monthStr) || 0).toFixed(2)) });
    }

    res.json(months);
  } catch (error) {
    console.error('Erro ao buscar previsão mensal:', error);
    res.status(500).json({ message: 'Erro ao buscar previsão mensal' });
  }
};

module.exports = {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAllTransactions,
  getTransactionsByMonth,
  getTransactionsByDay,
  getTransactionSummary,
  getTransactionsByCardAndMonth,
  getFutureForecastByCard,
  getForecastByCard,
  getMonthlyForecastByCard,
};

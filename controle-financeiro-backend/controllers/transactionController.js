
const { Transaction, Category, Account, Card, Objective } = require("../models");
const { Op, fn, col, literal } = require('sequelize');
const { getCurrentMonthRange } = require("../utils/getCurrentMonthRange");
const { getCardBillingPeriod } = require("../utils/getCardBillingPeriod");
const { getExactMonthRange } = require("../utils/getExactMonthRange");
const parseInstallments = require("../utils/parseInstallments");
const { v4: uuidv4 } = require('uuid');
const getInvoiceMonth = require("../utils/getInvoiceMonth");
const invoiceController = require("./invoiceController"); // se ainda não estiver importado



// Atualiza saldo de uma conta
const updateAccountBalance = async (accountId, value, type, isRevert = false) => {
  if (!accountId) return;
  const account = await Account.findByPk(accountId);
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

  await account.update({ saldoAtual: novoSaldo });
};


// Atualiza saldos em transferência
const updateTransferBalance = async (fromId, toId, value, isRevert = false) => {
  if (!fromId || !toId) return;
  const valor = parseFloat(value);

  const fromAccount = await Account.findByPk(fromId);
  const toAccount = await Account.findByPk(toId);
  if (!fromAccount || !toAccount) return;

  const saldoOrigem = parseFloat(fromAccount.saldoAtual);
  const saldoDestino = parseFloat(toAccount.saldoAtual);

  await fromAccount.update({ saldoAtual: isRevert ? saldoOrigem + valor : saldoOrigem - valor });
  await toAccount.update({ saldoAtual: isRevert ? saldoDestino - valor : saldoDestino + valor });
};

// Criar nova transação


const createTransaction = async (req, res) => {
  try {
    const {
      title,
      amount,
      type,
      date,
      isInstallment,
      totalInstallments,
      categoryId,
      fromAccountId,
      toAccountId,
      cardId,
      isFixedExpense,
      goalId
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
      const installmentGroupId = uuidv4();

      const parcelasGeradas = parseInstallments({
        title,
        amount,
        type: translatedType,
        date,
        userId,
        totalInstallments,
        categoryId,
        fromAccountId,
        toAccountId,
        cardId,
      }, totalInstallments);

      const parcelas = parcelasGeradas.map((p, index) => ({
        ...p,
        isInstallment: true,
        installmentNumber: index + 1,
        totalInstallments,
        installmentGroupId,
        originalTotalAmount: index === 0 ? parseFloat(amount) : null
      }));

      const card = await Card.findByPk(cardId);
      if (card) {
        const valorTotal = parseFloat(amount);
        card.availableLimit = Math.max(0, parseFloat(card.availableLimit) - valorTotal);
        await card.save();

        // ✅ Garante criação da fatura com base na data da 1ª parcela
        const faturaMonth = getInvoiceMonth(date, card.fechamento);
        await invoiceController.createInvoiceIfNeeded(cardId, faturaMonth, userId);

      }

      const result = await Transaction.bulkCreate(parcelas);
      return res.status(201).json(result);
    }

    // ➡️ Despesa fixa
    if (isFixedExpense) {
      const baseDate = new Date(date);
      const fixedExpenses = [];

      for (let i = 0; i < 12; i++) {
        const futureDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());

        fixedExpenses.push({
          title,
          amount,
          type: translatedType,
          date: futureDate.toISOString().split("T")[0],
          isInstallment: false,
          totalInstallments: null,
          currentInstallment: null,
          userId,
          categoryId: translatedType === "transfer" ? null : categoryId || null,
          fromAccountId: ["income", "expense", "transfer", "despesa_cartao"].includes(translatedType)
            ? fromAccountId
            : null,
          toAccountId: translatedType === "transfer" ? toAccountId : null,
          cardId: translatedType === "despesa_cartao" ? cardId : null,
        });
      }

      const result = await Transaction.bulkCreate(fixedExpenses);
      return res.status(201).json(result);
    }

    // ➡️ Depósito em objetivo
    if (translatedType === "goal") {
      if (!goalId) {
        return res.status(400).json({ error: "goalId é obrigatório para transações do tipo objetivo." });
      }

      const goal = await Objective.findByPk(goalId);
      if (!goal) return res.status(404).json({ error: "Objetivo não encontrado." });

      const payload = {
        title: title || `Depósito para objetivo: ${goal.name}`,
        amount,
        type: translatedType,
        date,
        userId,
        fromAccountId,
        goalId,
      };

      const transaction = await Transaction.create(payload);
      await updateAccountBalance(fromAccountId, amount, "goal");
      goal.currentAmount += parseFloat(amount);
      await goal.save();

      return res.status(201).json(transaction);
    }

    // ➡️ Cadastro normal
    const transaction = await Transaction.create({
      title,
      amount,
      type: translatedType,
      date,
      isInstallment,
      totalInstallments: isInstallment ? totalInstallments : null,
      currentInstallment: isInstallment ? 1 : null,
      userId,
      categoryId: translatedType === "transfer" ? null : categoryId || null,
      fromAccountId: ["income", "expense", "transfer", "despesa_cartao"].includes(translatedType)
        ? fromAccountId
        : null,
      toAccountId: translatedType === "transfer" ? toAccountId : null,
      cardId: translatedType === "despesa_cartao" ? cardId : null,
    });

    // 🔄 Garante criação da fatura para despesa avulsa
    if (translatedType === "despesa_cartao") {
      const card = await Card.findByPk(cardId);
      if (card) {
        const faturaMonth = getInvoiceMonth(date, card.fechamento);
        await invoiceController.createInvoiceIfNeeded(cardId, faturaMonth, userId);
      }
    }


    if (["income", "expense", "despesa_cartao"].includes(translatedType)) {
      await updateAccountBalance(fromAccountId, amount, translatedType);
    } else if (translatedType === "transfer") {
      await updateTransferBalance(fromAccountId, toAccountId, amount);
    }

    res.status(201).json(transaction);

  } catch (error) {
    console.error("Erro ao criar transação:", error);
    res.status(500).json({ error: "Erro ao criar transação" });
  }
};



// Atualizar transação (agora com suporte a alterar todas as parcelas)
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      amount,
      type,
      date,
      isInstallment,
      totalInstallments,
      currentInstallment,
      categoryId,
      fromAccountId,
      toAccountId,
      cardId,
      updateAllInstallments,
      updateFixedExpense,
    } = req.body;

    const typeMap = {
      ganho: "income",
      despesa: "expense",
      transferencia: "transfer",
      despesa_cartao: "despesa_cartao",
      meta: "goal"
    };

    const translatedType = typeMap[type] || type;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) return res.status(404).json({ error: "Transação não encontrada" });

    // 🔁 Atualizar todas as parcelas
    if (updateAllInstallments && transaction.isInstallment) {
      const card = await Card.findByPk(transaction.cardId);
      if (card && transaction.installmentNumber === 1) {
        const valorAntigo = parseFloat(transaction.amount) * parseInt(transaction.totalInstallments);
        card.availableLimit += valorAntigo;
      }

      await Transaction.destroy({ where: { installmentGroupId: transaction.installmentGroupId } });

      const novasParcelas = parseInstallments({
        title,
        amount,
        type: translatedType,
        date,
        userId: transaction.userId,
        categoryId,
        fromAccountId,
        toAccountId,
        cardId
      }, parseInt(totalInstallments));

      if (card) {
        const novoTotal = parseFloat(amount) * parseInt(totalInstallments);
        card.availableLimit -= novoTotal;
        await card.save();
      }

      const criadas = await Transaction.bulkCreate(novasParcelas);
      return res.json({ message: "Parcelas atualizadas com sucesso", data: criadas });
    }

    // 🔁 Atualizar despesas fixas
    if (updateFixedExpense) {
      const futureDates = [];
      const baseDate = new Date(date);

      for (let i = 1; i <= 12; i++) {
        const future = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
        futureDates.push(future.toISOString().split('T')[0]);
      }

      const fixedExpenses = futureDates.map(d => ({
        title,
        amount,
        type: translatedType,
        date: d,
        isInstallment: false,
        totalInstallments: null,
        currentInstallment: null,
        userId: transaction.userId,
        categoryId: translatedType === "transfer" ? null : categoryId || null,
        fromAccountId: ["income", "expense"].includes(translatedType) ? fromAccountId : translatedType === "transfer" ? fromAccountId : null,
        toAccountId: translatedType === "transfer" ? toAccountId : null,
        cardId: translatedType === "despesa_cartao" ? cardId : null,
      }));

      await Transaction.bulkCreate(fixedExpenses);
      return res.json({ message: "Despesas fixas futuras criadas com sucesso." });
    }

    // 🔁 Atualização individual
    if (transaction.type === "despesa_cartao") {
      const card = await Card.findByPk(transaction.cardId);
      if (card) {
        const valorAntigo = parseFloat(transaction.amount);
        const valorNovo = parseFloat(amount);
        const diferenca = valorNovo - valorAntigo;

        if (diferenca !== 0) {
          card.availableLimit -= diferenca;
          await card.save();
        }
      }
    } else if (["income", "expense"].includes(transaction.type)) {
      await updateAccountBalance(transaction.fromAccountId, transaction.amount, transaction.type, true);
    } else if (transaction.type === "transfer") {
      await updateTransferBalance(transaction.fromAccountId, transaction.toAccountId, transaction.amount, true);
    }

    await transaction.update({
      title,
      amount,
      type: translatedType,
      date,
      isInstallment,
      totalInstallments,
      currentInstallment,
      categoryId: translatedType === "transfer" ? null : categoryId || null,
      fromAccountId: ["income", "expense", "transfer", "despesa_cartao"].includes(translatedType) ? fromAccountId : null,
      toAccountId: translatedType === "transfer" ? toAccountId : null,
      cardId: translatedType === "despesa_cartao" ? cardId : null,
    });

    if (["income", "expense", "despesa_cartao"].includes(translatedType)) {
      await updateAccountBalance(fromAccountId, amount, translatedType);
    } else if (translatedType === "transfer") {
      await updateTransferBalance(fromAccountId, toAccountId, amount);
    }

    res.json(transaction);
  } catch (err) {
    console.error("Erro ao atualizar transação:", err);
    res.status(500).json({ error: "Erro ao atualizar transação" });
  }
};



// Excluir transação
// Excluir transação
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return res.status(404).json({ error: "Transação não encontrada" });

    const Card = require("../models").Card;

    if (transaction.type === "despesa_cartao") {
      const card = await Card.findByPk(transaction.cardId);

      if (card) {
        let valorEstorno = 0;

        if (transaction.isInstallment) {
          if (transaction.installmentNumber === 1) {
            // ✅ Usa o valor original da primeira parcela
            valorEstorno = transaction.originalTotalAmount || (
              await Transaction.findAll({
                where: { installmentGroupId: transaction.installmentGroupId }
              })
            ).reduce((sum, p) => sum + parseFloat(p.amount), 0);

            await Transaction.destroy({
              where: { installmentGroupId: transaction.installmentGroupId }
            });

            console.log(`🔁 Excluindo todas as parcelas do grupo ${transaction.installmentGroupId}`);
          } else {
            // Parcela intermediária: excluir só ela
            valorEstorno = parseFloat(transaction.amount);
            await transaction.destroy();
            console.log(`🧩 Excluindo parcela ${transaction.installmentNumber} de ${transaction.totalInstallments}`);
          }
        } else {
          valorEstorno = parseFloat(transaction.amount);
          await transaction.destroy();
          console.log(`🧾 Excluindo transação avulsa do cartão ${card.name}`);
        }

        const antes = card.availableLimit;
        card.availableLimit += valorEstorno;
        await card.save();

        console.log(`↩️ Estornando R$${valorEstorno.toFixed(2)} ao limite de ${card.name}`);
        console.log(`💳 Limite antes: ${antes} | depois: ${card.availableLimit}`);
      }
    } else {
      // Estorno para contas
      if (["income", "expense"].includes(transaction.type)) {
        await updateAccountBalance(transaction.fromAccountId, transaction.amount, transaction.type, true);
      } else if (transaction.type === "transfer") {
        await updateTransferBalance(transaction.fromAccountId, transaction.toAccountId, transaction.amount, true);
      }

      await transaction.destroy();
    }

    res.status(204).send();
  } catch (err) {
    console.error("Erro ao excluir transação:", err);
    res.status(500).json({ error: "Erro ao excluir transação" });
  }
};


// Todas as transações
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Category,
          attributes: ["id", "name", "icon", "parentId"],
          include: [
            {
              model: Category,
              as: "parent",
              attributes: ["id", "name", "icon"] // ✅ adicionar o campo "icon"
            }
          ]
        },

        { model: Account, as: "fromAccount", attributes: ["name"] },
        { model: Account, as: "toAccount", attributes: ["name"] },
        { model: Card, as: "card", attributes: ["name", "brand"] },
      ],
      order: [["date", "DESC"]],
    });

    res.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    res.status(500).json({ error: "Erro ao buscar transações" });
  }
};


// Transações por mês
const getTransactionsByMonth = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.user.id;

    const [startDate, endDate] = getExactMonthRange(month);

    const transactions = await Transaction.findAll({
      where: {
        userId,
        date: { [Op.between]: [startDate, endDate] },
      },
      include: [
        { model: Category, attributes: ["name"] },
        { model: Account, as: "fromAccount", attributes: ["name"] },
        { model: Account, as: "toAccount", attributes: ["name"] },
        { model: Card, as: "card", attributes: ["name", "brand"] },
      ],
      order: [["date", "DESC"]],
    });

    res.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações por mês:", error);
    res.status(500).json({ error: "Erro ao buscar transações do mês" });
  }
};

// Transações por dia
const getTransactionsByDay = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    const startDate = new Date(`${date}T00:00:00`);
    const endDate = new Date(`${date}T23:59:59`);

    const transactions = await Transaction.findAll({
      where: {
        userId,
        date: { [Op.between]: [startDate, endDate] },
      },
      include: [
        { model: Category, attributes: ["name"] },
        { model: Account, as: "fromAccount", attributes: ["name"] },
        { model: Account, as: "toAccount", attributes: ["name"] },
        { model: Card, as: "card", attributes: ["name", "brand"] },
      ],
      order: [["date", "DESC"]],
    });

    res.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações por dia:", error);
    res.status(500).json({ error: "Erro ao buscar transações por dia" });
  }
};

// Resumo financeiro

const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, category } = req.query;
    const where = { userId };

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [startDate, endDate] = getExactMonthRange(month); // ✅ Usa o mês exato
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
        { model: Account, as: "toAccount", attributes: ["name"] },
        { model: Card, as: "card", attributes: ["name", "brand"] },
      ],
    });

    const summary = { income: 0, expense: 0, transfer: 0, despesa_cartao: 0 };

    transactions.forEach((t) => {
      if (summary[t.type] !== undefined) {
        summary[t.type] += parseFloat(t.amount);
      }
    });

    const balance = summary.income - summary.expense - summary.despesa_cartao;
    res.json({ ...summary, balance });
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    res.status(500).json({ error: "Erro ao gerar resumo de transações" });
  }
};


// Previsão futura para cartão (gráfico de 6 meses)
const getFutureForecastByCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;
    console.log("🔎 Buscando cartão com ID:", cardId);
    const card = await Card.findByPk(cardId);
    if (!card) {
      console.warn("⚠️ Cartão não encontrado com ID:", cardId);
    }
    if (!card || card.userId !== userId) {
      return res.status(404).json({ message: "Cartão não encontrado ou não pertence ao usuário." });
    }

    const today = new Date();
    const forecast = [];

    for (let i = 0; i < 6; i++) {
      const future = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthStr = future.toISOString().slice(0, 7); // formato YYYY-MM

      const [startDate, endDate] = getCardBillingPeriod(monthStr, card.fechamento);

      const transactions = await Transaction.findAll({
        where: {
          userId,
          cardId,
          type: "despesa_cartao",
          date: { [Op.between]: [startDate, endDate] }
        }
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


// Transações por cartão e mês (com base no fechamento da fatura)
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
      where: {
        cardId,
        userId,
        type: 'despesa_cartao',
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Category,
          include: [
            { model: Category, as: "parent", attributes: ["name"] } // ✅ Aqui inclui a categoria pai
          ]
        },
        { model: Card, as: "card" }
      ],
      order: [['date', 'ASC']]
    });

    res.json({
      startDate,
      endDate,
      transactions
    });
  } catch (err) {
    console.error("💥 Erro ao buscar transações por cartão e mês:", err);
    res.status(500).json({ message: err.message || 'Erro interno do servidor.' });
  }
};

const getForecastByCard = async (req, res) => {
  const { cardId } = req.params;
  const userId = req.user.id;
  const getInvoiceMonth = require("../utils/getInvoiceMonth");

  try {
    const card = await Card.findByPk(cardId);
    if (!card || card.userId !== userId) {
      return res.status(404).json({ message: "Cartão não encontrado ou não pertence ao usuário." });
    }

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const todayInvoiceMonth = getInvoiceMonth(todayStr, card.fechamento);

    console.log(`📤 Buscando parcelas futuras para o cartão: ${cardId}`);
    console.log(`📆 Hoje: ${todayStr} | Fatura atual: ${todayInvoiceMonth}`);

    const allTransactions = await Transaction.findAll({
      where: {
        userId,
        cardId,
        type: "despesa_cartao"
      }
    });

    console.log(`📊 Total de transações encontradas: ${allTransactions.length}`);

    const futureInstallments = allTransactions.filter(tx => {
      const txMonth = getInvoiceMonth(tx.date, card.fechamento);
      return txMonth > todayInvoiceMonth;
    });

    const total = futureInstallments.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    console.log(`📦 Parcelas futuras detectadas: ${futureInstallments.length}`);
    console.log(`💰 Valor total das futuras: ${total.toFixed(2)}`);

    return res.json({ total, forecast: futureInstallments });
  } catch (err) {
    console.error("❌ Erro ao buscar parcelas futuras do cartão:", err);
    return res.status(500).json({ message: "Erro ao buscar parcelas futuras do cartão." });
  }
};




// ➡️ NOVO: Previsão mensal (gráfico de próximos meses)
// ➡️ Ajustado: Previsão mensal (gráfico de próximos meses)
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
      where: {
        cardId,
        userId,
        type: "despesa_cartao",
      }
    });

    const futureMonths = new Map();

    for (const t of forecastTransactions) {
      const faturaMonth = getInvoiceMonth(t.date, card.fechamento); // ✅ calcula o mês da fatura
      const currentTotal = futureMonths.get(faturaMonth) || 0;
      futureMonths.set(faturaMonth, currentTotal + parseFloat(t.amount));
    }

    const months = [];
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    for (let i = 0; i < 6; i++) {
      const future = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1);
      const monthStr = future.toISOString().slice(0, 7);
      months.push({
        month: monthStr,
        total: Number((futureMonths.get(monthStr) || 0).toFixed(2)),
      });
    }

    res.json(months);
  } catch (error) {
    console.error('Erro ao buscar previsão mensal:', error);
    res.status(500).json({ message: 'Erro ao buscar previsão mensal' });
  }
};


module.exports = {
  // CRUD de transações
  createTransaction,
  updateTransaction,
  deleteTransaction,

  // Listagens gerais
  getAllTransactions,
  getTransactionsByMonth,
  getTransactionsByDay,

  // Resumos e previsões
  getTransactionSummary,
  getTransactionsByCardAndMonth,
  getFutureForecastByCard,
  getForecastByCard,
  getMonthlyForecastByCard, // ✅ inclui despesa fixa e parcelas no futuro
};

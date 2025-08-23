const { Transaction, Objective, Category, Account, Card, MonthlyGoal } = require('../models');
const { Op } = require('sequelize');
const { format, parseISO } = require('date-fns');
const dayjs = require('dayjs');

const dashboardController = {
  async getDashboardData(req, res) {
    try {
      const userId = req.user.id;
      const { month, category, categoryId } = req.query;

      // -----------------------------
      // 🗓️ Intervalo do mês (YYYY-MM)
      // -----------------------------
      const monthKey = month || dayjs().format('YYYY-MM');
      const startOfMonth = dayjs(`${monthKey}-01`).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = dayjs(`${monthKey}-01`).endOf('month').format('YYYY-MM-DD');

      // ------------------------------------------------
      // 🎯 Filtro de categoria (inclui subcategorias)
      // - Aceita categoryId direto OU category (nome)
      // ------------------------------------------------
      let categoryIdsFilter = null;

      if (categoryId || category) {
        let targetCategory = null;

        if (categoryId) {
          targetCategory = await Category.findOne({
            where: { id: categoryId, userId },
            attributes: ['id', 'name'],
          });
        } else if (category) {
          targetCategory = await Category.findOne({
            where: { name: category, userId },
            attributes: ['id', 'name'],
          });
        }

        if (targetCategory) {
          const subcats = await Category.findAll({
            where: {
              [Op.or]: [{ id: targetCategory.id }, { parentId: targetCategory.id }],
              userId,
            },
            attributes: ['id'],
          });
          categoryIdsFilter = subcats.map((c) => c.id);
        } else {
          // se não encontrou, usa um array vazio para não retornar nada
          categoryIdsFilter = [];
        }
      }

      // ----------------------------------------------------------------
      // 💸 WHERE base para despesas (expense + despesa_cartao) por mês
      // ----------------------------------------------------------------
      const whereExpense = {
        userId,
        type: { [Op.in]: ['expense', 'despesa_cartao'] },
        date: { [Op.between]: [startOfMonth, endOfMonth] },
        ...(categoryIdsFilter ? { categoryId: { [Op.in]: categoryIdsFilter } } : {}),
      };

      // ---------------------------
      // 📥 Despesas do mês filtrado
      // ---------------------------
      const expenses = await Transaction.findAll({
        where: whereExpense,
        include: [
          {
            model: Category,
            attributes: ['id', 'name', 'parentId'],
            include: [{ model: Category, as: 'parent', attributes: ['id', 'name'] }],
          },
        ],
      });

      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

      // --------------------------------------------------------
      // 🎯 Metas Mensais do mês (com cálculo de uso real no mês)
      // --------------------------------------------------------
      const metasMensais = await MonthlyGoal.findAll({
        where: { userId, month: monthKey },
        include: {
          model: Category,
          attributes: ['id', 'name', 'icon', 'parentId'],
          include: [{ model: Category, as: 'parent', attributes: ['id', 'name'] }],
        },
      });

      const metasMensaisComProgresso = [];
      for (const meta of metasMensais) {
        const subcategories = await Category.findAll({
          where: {
            userId,
            [Op.or]: [{ id: meta.categoryId }, { parentId: meta.categoryId }],
          },
          attributes: ['id'],
        });

        const metaCategoryIds = subcategories.map((c) => c.id);

        const usedAmount = await Transaction.sum('amount', {
          where: {
            userId,
            type: { [Op.in]: ['expense', 'despesa_cartao'] },
            categoryId: { [Op.in]: metaCategoryIds },
            date: { [Op.between]: [startOfMonth, endOfMonth] },
          },
        });

        metasMensaisComProgresso.push({
          id: meta.id,
          month: meta.month,
          amount: parseFloat(meta.amount),
          usedAmount: parseFloat(usedAmount || 0),
          percentageUsed:
            parseFloat(meta.amount) > 0
              ? ((parseFloat(usedAmount || 0) / parseFloat(meta.amount)) * 100)
              : 0,
          Category: meta.Category,
        });
      }

      // --------------------------------------------------------------------------------
      // 🧾 Metas "globais" (Objective) continuam disponíveis (para cards / vitrine geral)
      // --------------------------------------------------------------------------------
      const objectives = await Objective.findAll({
        where: { userId },
        include: [{ model: Category, attributes: ['id', 'name'] }],
      });

      const totalGoals = objectives.reduce(
        (sum, g) => sum + parseFloat(g.targetAmount || 0),
        0,
      );

      // --------------------------------
      // 🏦 Contas e saldo consolidado
      // --------------------------------
      const accounts = await Account.findAll({ where: { userId } });
      const accountBalance = accounts.reduce(
        (sum, acc) => sum + parseFloat(acc.saldoAtual || 0),
        0,
      );

      // ----------------------------------------
      // 💳 Cartões: uso com base no availableLimit
      // - usado = limit - availableLimit (mais fiel)
      // ----------------------------------------
      const cards = await Card.findAll({ where: { userId } });

      const cardsWithUsage = cards.map((card) => {
        const limit = parseFloat(card.limit || 0);
        const availableLimit = parseFloat(card.availableLimit ?? limit);
        let used = limit - availableLimit;
        if (used < 0) used = 0;
        return {
          id: card.id,
          name: card.name,
          limit,
          used: Number(used.toFixed(2)),
          dueDate: card.dueDate,
          fechamento: card.fechamento,
          availableLimit: Number(availableLimit.toFixed(2)),
        };
      });

      // ---------------------------------------------------
      // 📊 Despesas por categoria (pai > filha agregadas)
      // ---------------------------------------------------
      const expenseByCategoryMap = {};
      expenses.forEach((tx) => {
        const catName =
          tx.Category?.parent?.name || tx.Category?.name || 'Sem categoria';
        expenseByCategoryMap[catName] =
          (expenseByCategoryMap[catName] || 0) + parseFloat(tx.amount || 0);
      });

      // ------------------------------------------------
      // 🎯 Metas mensais agregadas por categoria (pai)
      // ------------------------------------------------
      const goalByCategoryMap = {};
      metasMensais.forEach((meta) => {
        const catName =
          meta.Category?.parent?.name || meta.Category?.name || 'Sem categoria';
        goalByCategoryMap[catName] =
          (goalByCategoryMap[catName] || 0) + parseFloat(meta.amount || 0);
      });

      // Gráfico comparando metas vs despesas por categoria
      const comparisonChart = Object.keys({
        ...expenseByCategoryMap,
        ...goalByCategoryMap,
      }).map((cat) => ({
        categoria: cat,
        despesas: expenseByCategoryMap[cat] || 0,
        metas: goalByCategoryMap[cat] || 0,
      }));

      // ---------------------------------------------
      // 📈 Tendência mensal de despesas (últimos N)
      // ---------------------------------------------
      const monthlyMap = {};
      expenses.forEach((exp) => {
        const date = parseISO(exp.date);
        const monthKey = format(date, 'yyyy-MM');
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + parseFloat(exp.amount || 0);
      });

      const monthlyTrend = Object.entries(monthlyMap)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([mes, despesas]) => ({ mes, despesas }));

      // ----------------------------------------------------
      // 💰 Saldo mensal (income - expense - despesa_cartao)
      // ----------------------------------------------------
      const allTransactions = await Transaction.findAll({ where: { userId } });

      const saldoMensalMap = {};
      allTransactions.forEach((tx) => {
        const key = format(parseISO(tx.date), 'yyyy-MM');
        const valor = parseFloat(tx.amount || 0);
        if (!saldoMensalMap[key]) saldoMensalMap[key] = 0;
        if (tx.type === 'income') saldoMensalMap[key] += valor;
        if (tx.type === 'expense' || tx.type === 'despesa_cartao') saldoMensalMap[key] -= valor;
      });

      const monthlyBalanceTrend = Object.entries(saldoMensalMap)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([mes, saldo]) => ({ mes, saldo: Number(saldo.toFixed(2)) }));

      // --------------------------------------------------
      // 🔔 Alertas: metas mensais ultrapassadas no mês
      // --------------------------------------------------
      const metasUltrapassadas = comparisonChart
        .filter((item) => item.metas > 0 && item.despesas > item.metas)
        .map((item) => ({
          type: 'danger',
          message: `Meta ultrapassada na categoria "${item.categoria}"`,
        }));

      // ------------------------------------------------------
      // 🏆 Top categorias (com % e cor para os gráficos)
      // ------------------------------------------------------
      const topCategoriesRaw = Object.entries(expenseByCategoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const totalTop = topCategoriesRaw.reduce((sum, cat) => sum + cat.value, 0) || 1;
      const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

      const topCategories = topCategoriesRaw.map((cat, index) => ({
        ...cat,
        percentage: ((cat.value / totalTop) * 100).toFixed(0),
        color: COLORS[index % COLORS.length],
      }));

      // ------------------------------------------------------
      // 📊 CardSummary: gastos com cartões por mês (real)
      // ------------------------------------------------------
      const cardExpenses = await Transaction.findAll({
        where: {
          userId,
          type: 'despesa_cartao',
        },
      });

      const cardMonthlyMap = {};
      cardExpenses.forEach((tx) => {
        const m = format(parseISO(tx.date), 'yyyy-MM');
        cardMonthlyMap[m] = (cardMonthlyMap[m] || 0) + parseFloat(tx.amount || 0);
      });

      const allMonthsSorted = Object.keys(cardMonthlyMap).sort((a, b) =>
        a < b ? -1 : 1,
      );

      const cardSummaryChart = allMonthsSorted.map((m) => ({
        mes: m,
        total: Number((cardMonthlyMap[m] || 0).toFixed(2)),
        cardDetails: cardExpenses
          .filter((tx) => format(parseISO(tx.date), 'yyyy-MM') === m)
          .reduce((acc, tx) => {
            const name = cards.find((c) => c.id === tx.cardId)?.name || 'Cartão';
            const found = acc.find((a) => a.name === name);
            if (found) found.value += parseFloat(tx.amount || 0);
            else acc.push({ name, value: parseFloat(tx.amount || 0) });
            return acc;
          }, []),
      }));

      // ---------------------------------------------------------
      // 📈 Receita vs Despesa por mês (sem “preencher” meses)
      // ---------------------------------------------------------
      const incomeExpenseMonthlyMap = {};
      // despesas (já temos em 'expenses' do mês filtrado, mas aqui vamos geral)
      const expenseAll = await Transaction.findAll({
        where: { userId, type: { [Op.in]: ['expense', 'despesa_cartao'] } },
      });
      expenseAll.forEach((tx) => {
        const m = format(parseISO(tx.date), 'yyyy-MM');
        if (!incomeExpenseMonthlyMap[m]) incomeExpenseMonthlyMap[m] = { receitas: 0, despesas: 0 };
        incomeExpenseMonthlyMap[m].despesas += parseFloat(tx.amount || 0);
      });

      const incomeAll = await Transaction.findAll({
        where: { userId, type: 'income' },
      });
      incomeAll.forEach((tx) => {
        const m = format(parseISO(tx.date), 'yyyy-MM');
        if (!incomeExpenseMonthlyMap[m]) incomeExpenseMonthlyMap[m] = { receitas: 0, despesas: 0 };
        incomeExpenseMonthlyMap[m].receitas += parseFloat(tx.amount || 0);
      });

      const incomeExpenseTrend = Object.keys(incomeExpenseMonthlyMap)
        .sort((a, b) => (a < b ? -1 : 1))
        .slice(-12) // limita aos últimos 12
        .map((m) => ({
          mes: m,
          receitas: Number((incomeExpenseMonthlyMap[m]?.receitas || 0).toFixed(2)),
          despesas: Number((incomeExpenseMonthlyMap[m]?.despesas || 0).toFixed(2)),
        }));

      // ---------------------------------------------------------
      // 🔎 Resumo por tipo no mês selecionado (para cards rápidos)
      // ---------------------------------------------------------
      const monthTransactions = await Transaction.findAll({
        where: {
          userId,
          date: { [Op.between]: [startOfMonth, endOfMonth] },
        },
      });

      const summaryByType = { income: 0, expense: 0, transfer: 0, despesa_cartao: 0 };
      monthTransactions.forEach((tx) => {
        if (summaryByType[tx.type] !== undefined) {
          summaryByType[tx.type] += parseFloat(tx.amount || 0);
        }
      });

      // Objetivos “clássicos” expostos como goals de vitrine
      const goalsVitrine = objectives.map((g) => ({
        id: g.id,
        name: g.name,
        targetAmount: parseFloat(g.targetAmount || 0),
        currentAmount: parseFloat(g.currentAmount || 0),
      }));

      // -----------------
      // 📤 Resposta final
      // -----------------
      return res.json({
        summary: {
          totalExpenses,
          totalGoals,          // objetivos "clássicos" (vitrine)
          balance: accountBalance,
          ...summaryByType,    // income, expense, despesa_cartao, transfer (mês atual)
        },
        chart: comparisonChart,        // metas vs despesas por categoria
        trend: monthlyTrend,           // tendência de despesas
        monthlyBalanceTrend,           // evolução do saldo consolidado
        alerts: metasUltrapassadas,    // alertas de metas estouradas no mês
        accounts,                      // contas com saldo
        cards: cardsWithUsage,         // cartões com used/dueDate/availableLimit reais
        topCategories,                 // top 5 categorias com % e cor
        goals: goalsVitrine,           // objetivos (clássicos)
        cardSummaryChart,              // gastos com cartões por mês (detalhe por cartão no tooltip)
        incomeExpenseTrend,            // receitas vs despesas (últimos 12)
        monthlyGoals: metasMensaisComProgresso, // metas mensais do mês com progresso
      });
    } catch (err) {
      console.error('Erro ao gerar dashboard:', err);
      res.status(500).json({ error: 'Erro ao gerar dados da dashboard' });
    }
  },
};

module.exports = dashboardController;

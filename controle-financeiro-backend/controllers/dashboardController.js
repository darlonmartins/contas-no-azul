const { Transaction, Objective, Category, Account, Card } = require('../models');
const { Op } = require('sequelize');
const { format, parseISO } = require('date-fns');
const { MonthlyGoal } = require("../models");
const dayjs = require("dayjs");

const dashboardController = {
  async getDashboardData(req, res) {
    try {
      const userId = req.user.id;
      const { month, category } = req.query;

      const whereExpense = {
        userId,
        type: {
          [Op.in]: ['expense', 'despesa_cartao']
        }
      };

      const whereGoal = { userId };

      if (month) {
        const [year, monthPart] = month.split('-');
        const start = `${year}-${monthPart}-01`;
        const end = `${year}-${monthPart}-31`;
        whereExpense.date = { [Op.between]: [start, end] };
      }

      if (category) {
        whereExpense['$Category.name$'] = category;
        whereGoal['$Category.name$'] = category;
      }


      // Busca metas mensais do mês filtrado (ou mês atual se não houver filtro)
      const metasMensais = await MonthlyGoal.findAll({
        where: {
          userId,
          ...(month ? { month } : { month: dayjs().format("YYYY-MM") })
        },
        include: {
          model: Category,
          attributes: ["id", "name", "icon"],
          include: [{ model: Category, as: 'parent', attributes: ['name'] }]
        }
      });


      const expenses = await Transaction.findAll({
        where: whereExpense,
        include: [{
          model: Category,
          attributes: ['name'],
          include: [{ model: Category, as: 'parent', attributes: ['name'] }]
        }],
      });


      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

      const goals = await Objective.findAll({
        where: whereGoal,
        include: [{ model: Category, attributes: ['name'] }],
      });

      const totalGoals = goals.reduce((sum, g) => sum + parseFloat(g.targetAmount || 0), 0);

      const accounts = await Account.findAll({ where: { userId } });
      const accountBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.saldoAtual || 0), 0);

      const cards = await Card.findAll({ where: { userId } });

      const expenseByCategoryMap = {};
      expenses.forEach((item) => {
        const cat = item.Category?.parent?.name || item.Category?.name || 'Sem categoria';
        expenseByCategoryMap[cat] = (expenseByCategoryMap[cat] || 0) + parseFloat(item.amount);
      });

      const goalByCategoryMap = {};
      metasMensais.forEach((item) => {
        const cat = item.Category?.parent?.name || item.Category?.name || 'Sem categoria';
        goalByCategoryMap[cat] = (goalByCategoryMap[cat] || 0) + parseFloat(item.amount || 0);
      });


      const comparisonChart = Object.keys({ ...expenseByCategoryMap, ...goalByCategoryMap }).map((cat) => ({
        categoria: cat,
        despesas: expenseByCategoryMap[cat] || 0,
        metas: goalByCategoryMap[cat] || 0,
      }));

      const monthlyMap = {};
      expenses.forEach((exp) => {
        const date = parseISO(exp.date);
        const monthKey = format(date, 'yyyy-MM');
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + parseFloat(exp.amount);
      });


      // Calcula progresso de cada meta mensal
      const metasMensaisComProgresso = [];

      for (const meta of metasMensais) {
        const startDate = dayjs(meta.month + "-01").startOf("month").format("YYYY-MM-DD");
        const endDate = dayjs(meta.month + "-01").endOf("month").format("YYYY-MM-DD");

        const subcategories = await Category.findAll({
          where: {
            [Op.or]: [
              { id: meta.categoryId },
              { parentId: meta.categoryId }
            ]
          },
          attributes: ["id"]
        });

        const categoryIds = subcategories.map(c => c.id);

        const totalUsed = await Transaction.sum("amount", {
          where: {
            userId,
            type: { [Op.in]: ["expense", "despesa_cartao"] },
            categoryId: { [Op.in]: categoryIds },
            date: { [Op.between]: [startDate, endDate] }
          }
        });

        metasMensaisComProgresso.push({
          id: meta.id,
          month: meta.month,
          amount: parseFloat(meta.amount),
          usedAmount: parseFloat(totalUsed || 0),
          percentageUsed: meta.amount > 0 ? ((totalUsed || 0) / meta.amount) * 100 : 0,
          Category: meta.Category
        });
      }

      // Saldo mensal: income - expense - despesa_cartao
      const allTransactions = await Transaction.findAll({ where: { userId } });

      const saldoMensalMap = {};
      allTransactions.forEach((tx) => {
        const date = parseISO(tx.date);
        const key = format(date, 'yyyy-MM');
        const valor = parseFloat(tx.amount);

        if (!saldoMensalMap[key]) saldoMensalMap[key] = 0;

        if (tx.type === 'income') {
          saldoMensalMap[key] += valor;
        } else if (['expense', 'despesa_cartao'].includes(tx.type)) {
          saldoMensalMap[key] -= valor;
        }
      });

      const monthlyBalanceTrend = Object.entries(saldoMensalMap)
        .sort()
        .map(([mes, saldo]) => ({ mes, saldo: Number(saldo.toFixed(2)) }));

      const monthlyTrend = Object.entries(monthlyMap).map(([month, value]) => ({
        mes: month,
        despesas: value,
      }));


      const metasUltrapassadas = comparisonChart
        .filter(item => item.despesas > item.metas && item.metas > 0)
        .map(item => ({
          type: 'danger',
          message: `Meta ultrapassada na categoria "${item.categoria}"`,
        }));

      const topCategories = Object.entries(expenseByCategoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const totalTop = topCategories.reduce((sum, cat) => sum + cat.value, 0);
      const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

      const topWithPercent = topCategories.map((cat, index) => ({
        ...cat,
        percentage: ((cat.value / totalTop) * 100).toFixed(0),
        color: COLORS[index % COLORS.length] // ✅ cor válida para o gráfico
      }));


      const cardExpenses = await Transaction.findAll({
        where: { userId, type: 'despesa_cartao' },
      });

      // Agrupa receitas e despesas por mês
      const incomeExpenseMonthlyMap = {};

      expenses.forEach((tx) => {
        const date = parseISO(tx.date);
        const monthKey = format(date, 'yyyy-MM');
        if (!incomeExpenseMonthlyMap[monthKey]) {
          incomeExpenseMonthlyMap[monthKey] = { receitas: 0, despesas: 0 };
        }
        incomeExpenseMonthlyMap[monthKey].despesas += parseFloat(tx.amount);
      });

      const incomeTransactions = await Transaction.findAll({
        where: { userId, type: 'income' }
      });

      incomeTransactions.forEach((tx) => {
        const date = parseISO(tx.date);
        const monthKey = format(tx.date, 'yyyy-MM');
        if (!incomeExpenseMonthlyMap[monthKey]) {
          incomeExpenseMonthlyMap[monthKey] = { receitas: 0, despesas: 0 };
        }
        incomeExpenseMonthlyMap[monthKey].receitas += parseFloat(tx.amount);
      });

      // Cria array ordenado e limitado
      let trendMonths = Object.keys(incomeExpenseMonthlyMap).sort();

      // Preenche até 6 meses se houver menos
      if (trendMonths.length < 6) {
        const existingSet = new Set(trendMonths);
        const today = new Date();
        while (trendMonths.length < 6) {
          const nextMonth = format(new Date(today.getFullYear(), today.getMonth() + trendMonths.length, 1), 'yyyy-MM');
          if (!existingSet.has(nextMonth)) {
            trendMonths.push(nextMonth);
          }
        }
      } else if (trendMonths.length > 12) {
        trendMonths = trendMonths.slice(0, 12);
      }

      const incomeExpenseTrend = trendMonths.map(month => ({
        mes: month,
        receitas: Number((incomeExpenseMonthlyMap[month]?.receitas || 0).toFixed(2)),
        despesas: Number((incomeExpenseMonthlyMap[month]?.despesas || 0).toFixed(2)),
      }));


      // 🔍 Resumo por tipo
      const transactions = await Transaction.findAll({
        where: {
          userId,
          ...(month && {
            date: {
              [Op.between]: [`${month}-01`, `${month}-31`]
            }
          }),
        },
      });

      const summaryByType = {
        income: 0,
        expense: 0,
        transfer: 0,
        despesa_cartao: 0
      };

      transactions.forEach(tx => {
        if (summaryByType[tx.type] !== undefined) {
          summaryByType[tx.type] += parseFloat(tx.amount);
        }
      });


      const cardsWithUsage = cards.map(card => {
        const used = cardExpenses
          .filter(t => t.cardId === card.id)
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        return {
          id: card.id,
          name: card.name,
          limit: card.limit,
          used,
          dueDate: card.dueDate,
        };
      });

      // 📊 GRÁFICO: Soma total de gastos de cartões por mês
      // 📊 GRÁFICO: Soma total de gastos de cartões por mês
      const cardMonthlyMap = {};
      cardExpenses.forEach(tx => {
        const date = parseISO(tx.date);
        const monthKey = format(date, 'yyyy-MM');
        cardMonthlyMap[monthKey] = (cardMonthlyMap[monthKey] || 0) + parseFloat(tx.amount);
      });

      let allMonths = Object.keys(cardMonthlyMap).sort();

      // Preenche até 6 meses se houver menos
      if (allMonths.length < 6) {
        const existingSet = new Set(allMonths);
        const today = new Date();
        while (allMonths.length < 6) {
          const nextMonth = format(new Date(today.getFullYear(), today.getMonth() + allMonths.length, 1), 'yyyy-MM');
          if (!existingSet.has(nextMonth)) {
            allMonths.push(nextMonth);
          }
        }
      }

      // Limita a no máximo 12
      if (allMonths.length > 12) {
        allMonths = allMonths.slice(0, 12);
      }

      const cardSummaryChart = allMonths.map(month => ({
        mes: month,
        total: Number((cardMonthlyMap[month] || 0).toFixed(2)),
        cardDetails: cardExpenses
          .filter(tx => format(parseISO(tx.date), 'yyyy-MM') === month)
          .reduce((acc, tx) => {
            const name = cards.find(c => c.id === tx.cardId)?.name || 'Desconhecido';
            const found = acc.find(a => a.name === name);
            if (found) {
              found.value += parseFloat(tx.amount);
            } else {
              acc.push({ name, value: parseFloat(tx.amount) });
            }
            return acc;
          }, [])
      }));



      const goalsWithProgress = goals.map(goal => ({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: parseFloat(goal.currentAmount || 0),
      }));

      return res.json({
        summary: {
          totalExpenses,
          totalGoals,
          balance: accountBalance,
          ...summaryByType,
        },
        chart: comparisonChart,
        trend: monthlyTrend,
        monthlyBalanceTrend,
        alerts: metasUltrapassadas,
        accounts,
        cards: cardsWithUsage,
        topCategories: topWithPercent,
        goals: goalsWithProgress,
        cardSummaryChart,
        incomeExpenseTrend,
        monthlyGoals: metasMensaisComProgresso, // 👈 novo campo
      });



    } catch (err) {
      console.error('Erro ao gerar dashboard:', err);
      res.status(500).json({ error: 'Erro ao gerar dados da dashboard' });
    }
  },
};

module.exports = dashboardController;

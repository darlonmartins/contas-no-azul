const { Expense, Category } = require('../models');
const { Op } = require('sequelize');

const createExpense = async (expenseData, userId) => {
  const { description, amount, categoryId, date, installments = 1 } = expenseData;

  const expenses = [];
  const parsedDate = new Date(date);

  for (let i = 0; i < installments; i++) {
    const installmentDate = new Date(parsedDate);
    installmentDate.setMonth(installmentDate.getMonth() + i);

    const expense = await Expense.create({
      description: installments > 1 ? `${description} (${i + 1}/${installments})` : description,
      amount: amount / installments,
      categoryId,
      date: installmentDate,
      installment: i + 1,
      totalInstallments: installments,
      userId
    });

    expenses.push(expense);
  }

  return expenses;
};

const getExpensesByMonth = async (userId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  return await Expense.findAll({
    where: {
      userId,
      date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      }
    },
    include: [{ model: Category, attributes: ['name'] }],
    order: [['date', 'ASC']]
  });
};

const getAllExpenses = async (userId) => {
  return await Expense.findAll({
    where: { userId },
    include: [{ model: Category, attributes: ['name'] }],
    order: [['date', 'DESC']]
  });
};

const updateExpense = async (id, userId, data) => {
  const expense = await Expense.findOne({ where: { id, userId } });
  if (!expense) throw new Error('Despesa não encontrada');
  await expense.update(data);
  return expense;
};

const deleteExpense = async (id, userId) => {
  const expense = await Expense.findOne({ where: { id, userId } });
  if (!expense) throw new Error('Despesa não encontrada');
  await expense.destroy();
};

module.exports = {
  createExpense,
  getExpensesByMonth,
  getAllExpenses,
  updateExpense,
  deleteExpense
};

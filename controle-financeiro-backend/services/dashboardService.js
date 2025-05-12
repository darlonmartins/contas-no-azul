const { Expense, Goal } = require('../models');
const { Op } = require('sequelize');

const getMonthlyDashboard = async (userId, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const expenses = await Expense.findAll({
    where: {
      userId,
      dueDate: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  const goals = await Goal.findAll({ where: { userId } });

  return {
    expenses,
    goals,
  };
};

module.exports = {
  getMonthlyDashboard,
};

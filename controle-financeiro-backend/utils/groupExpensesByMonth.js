const moment = require('moment');

const groupExpensesByMonth = (expenses) => {
  return expenses.reduce((acc, expense) => {
    const month = moment(expense.date).format('YYYY-MM');
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += parseFloat(expense.amount);
    return acc;
  }, {});
};

module.exports = groupExpensesByMonth;

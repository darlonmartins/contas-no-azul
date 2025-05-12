const groupExpensesByCategory = (expenses) => {
    return expenses.reduce((acc, expense) => {
      const category = expense.category || 'Sem categoria';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += parseFloat(expense.amount);
      return acc;
    }, {});
  };
  
  module.exports = groupExpensesByCategory;
  
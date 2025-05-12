const groupGoalsByMonth = (goals) => {
    return goals.reduce((acc, goal) => {
      const month = new Date(goal.month).toISOString().slice(0, 7); // yyyy-MM
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += parseFloat(goal.amount);
      return acc;
    }, {});
  };
  
  module.exports = groupGoalsByMonth;
  
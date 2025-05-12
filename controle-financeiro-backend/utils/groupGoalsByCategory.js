const groupGoalsByCategory = (goals) => {
    return goals.reduce((acc, goal) => {
      const category = goal.category || 'Sem categoria';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += parseFloat(goal.amount);
      return acc;
    }, {});
  };
  
  module.exports = groupGoalsByCategory;
  
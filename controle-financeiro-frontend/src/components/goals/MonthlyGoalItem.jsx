import React from "react";

const MonthlyGoalItem = ({ goal }) => {
  return (
    <div className="p-4 border rounded-lg mb-2 bg-white shadow-sm">
      <p className="font-semibold">{goal.category}</p>
      <p>Meta Mensal: R$ {goal.amount.toFixed(2)}</p>
      <p>Gasto Atual: R$ {goal.currentAmount.toFixed(2)}</p>
      <p className={goal.currentAmount > goal.amount ? "text-red-600" : "text-green-600"}>
        {goal.currentAmount > goal.amount ? "Meta ultrapassada" : "Dentro da meta"}
      </p>
    </div>
  );
};

export default MonthlyGoalItem;

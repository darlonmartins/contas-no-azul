import React from 'react';

const ExpenseList = ({ expenses }) => {
  if (!expenses.length) {
    return <p className="text-gray-500">Nenhuma despesa cadastrada.</p>;
  }

  return (
    <ul className="space-y-2">
      {expenses.map((expense) => (
        <li key={expense.id} className="border p-3 rounded shadow-sm">
          <p className="font-semibold">{expense.description}</p>
          <p>
            R$ {parseFloat(expense.amount).toFixed(2)} em{' '}
            {new Date(expense.date).toLocaleDateString()}
          </p>
          {expense.Category && (
            <p className="text-sm text-gray-600">Categoria: {expense.Category.name}</p>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ExpenseList;

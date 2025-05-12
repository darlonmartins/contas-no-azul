const groupTransactionsByMonth = (transactions) => {
    return transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
  
      if (!acc[key]) {
        acc[key] = [];
      }
  
      acc[key].push(transaction);
      return acc;
    }, {});
  };
  
  module.exports = groupTransactionsByMonth;
  
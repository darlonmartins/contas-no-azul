const getInvoiceMonth = (dateStr, fechamento) => {
  const date = new Date(dateStr);
  const dia = date.getDate();

  // Se passou do fechamento, pertence ao próximo mês
  if (dia > fechamento) {
    date.setMonth(date.getMonth() + 1);
  }

  return date.toISOString().slice(0, 7); // Ex: "2025-05"
};

module.exports = getInvoiceMonth;

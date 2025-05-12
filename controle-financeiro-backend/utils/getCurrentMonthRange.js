const { startOfMonth, endOfMonth } = require('date-fns');

const getCurrentMonthRange = (monthString) => {
  if (!/^\d{4}-\d{2}$/.test(monthString)) {
    throw new Error("Formato de mês inválido. Use YYYY-MM.");
  }

  const [year, month] = monthString.split("-");
  const baseDate = new Date(`${year}-${month}-01`);

  const startDate = startOfMonth(baseDate);
  const endDate = endOfMonth(baseDate);

  // retorna em formato YYYY-MM-DD para uso em queries
  return [
    startDate.toISOString().split("T")[0],
    endDate.toISOString().split("T")[0],
  ];
};

module.exports = { getCurrentMonthRange };

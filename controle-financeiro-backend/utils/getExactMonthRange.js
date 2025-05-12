const getExactMonthRange = (monthString) => {
    if (!monthString || !/^\d{4}-\d{2}$/.test(monthString)) {
      throw new Error("Formato de mês inválido. Use YYYY-MM.");
    }
  
    const [year, month] = monthString.split("-");
  
    // Data inicial: primeiro dia do mês
    const startDate = new Date(`${year}-${month}-01T00:00:00`);
    startDate.setHours(0, 0, 0, 0);
  
    // Data final: último dia do mês
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
  
    return [
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    ];
  };
  
  module.exports = { getExactMonthRange };
  
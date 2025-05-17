const getCardBillingPeriod = (monthString, fechamento) => {
  if (!monthString || !/^\d{4}-\d{2}$/.test(monthString)) {
    throw new Error("Formato de mês inválido. Use YYYY-MM.");
  }

  const [year, month] = monthString.split("-");
  const baseYear = parseInt(year, 10);
  const baseMonth = parseInt(month, 10) - 1; // 0-indexado

  // 🔹 Data de fechamento no mês atual
  const fechamentoAtual = new Date(baseYear, baseMonth, fechamento, 23, 59, 59, 999);

  // 🔹 Data de início: dia seguinte ao fechamento anterior
  const fechamentoAnterior = new Date(fechamentoAtual);
  fechamentoAnterior.setMonth(fechamentoAnterior.getMonth() - 1);
  fechamentoAnterior.setDate(fechamento + 1);
  fechamentoAnterior.setHours(0, 0, 0, 0);

  return [
    fechamentoAnterior.toISOString(),
    fechamentoAtual.toISOString()
  ];
};

// ✅ Exportação como objeto para uso com desestruturação
module.exports = { getCardBillingPeriod };

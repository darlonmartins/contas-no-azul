const getCardBillingPeriod = (monthString, fechamento) => {
  if (!monthString || !/^\d{4}-\d{2}$/.test(monthString)) {
    throw new Error("Formato de mês inválido. Use YYYY-MM.");
  }

  const [year, month] = monthString.split("-");
  const baseYear = parseInt(year, 10);
  const baseMonth = parseInt(month, 10) - 1; // 0-indexado (jan = 0)

  // 🔹 Fechamento da fatura de MAIO → dia 10/05 às 23:59:59
  const fechamentoAtual = new Date(baseYear, baseMonth, fechamento, 23, 59, 59, 999);

  // 🔹 Início: dia seguinte ao fechamento do mês anterior → 11/04 às 00:00:00
  const fechamentoAnterior = new Date(fechamentoAtual);
  fechamentoAnterior.setMonth(fechamentoAnterior.getMonth() - 1);
  fechamentoAnterior.setDate(fechamento + 1);
  fechamentoAnterior.setHours(0, 0, 0, 0);

  return [
    fechamentoAnterior.toISOString(),
    fechamentoAtual.toISOString()
  ];
};

// backend/utils/getCardBillingPeriod.js
function getCardBillingPeriod(monthString, fechamento) {
  if (!monthString || !/^\d{4}-\d{2}$/.test(monthString)) {
    throw new Error('Formato de mês inválido. Use YYYY-MM.');
  }

  const [yearStr, monthStr] = monthString.split('-');
  const Y = parseInt(yearStr, 10);
  const M = parseInt(monthStr, 10) - 1; // JS: 0 = jan

  // 🟢 Regra NUBANK: período exibido no PDF é "DE <fechamento anterior> A <fechamento atual>"
  // Portanto, INÍCIO = dia do fechamento do mês anterior (INCLUSIVO)
  //           FIM    = dia do fechamento do mês corrente (INCLUSIVO)
  const start = new Date(Y, M - 1, fechamento, 0, 0, 0, 0);            // ex: 10/09 00:00:00
  const end   = new Date(Y, M,     fechamento, 23, 59, 59, 999);        // ex: 10/10 23:59:59

  const startISO = start.toISOString();
  const endISO   = end.toISOString();

  // Log para depuração
  console.log('🗓️ [getCardBillingPeriod]',
    `monthKey=${monthString} fechamento=${fechamento} =>`,
    `${startISO.slice(0,10)} .. ${endISO.slice(0,10)} (bordas inclusivas)`);

  return [startISO, endISO];
}

module.exports = { getCardBillingPeriod };

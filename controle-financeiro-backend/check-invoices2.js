const { sequelize, Invoice, Card } = require('./models');

async function check() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  console.log('🗓️ Mês atual:', currentMonth);

  // Lista todos os cartões
  const cards = await Card.findAll({ attributes: ['id', 'name'] });
  console.log('💳 Cartões:', cards.map(c => `${c.id}=${c.name}`).join(', '));

  // Lista faturas pagas
  const invoices = await Invoice.findAll({
    where: { paid: true },
    attributes: ['id', 'cardId', 'month', 'paid'],
  });
  console.log('✅ Faturas pagas:', invoices.map(i => `cardId=${i.cardId} mes=${i.month}`).join(', ') || 'nenhuma');

  // Faturas do mês atual
  const thisMonth = await Invoice.findAll({
    where: { month: currentMonth },
    attributes: ['id', 'cardId', 'month', 'paid'],
  });
  console.log('📅 Faturas do mês atual:', thisMonth.map(i => `cardId=${i.cardId} paid=${i.paid}`).join(', ') || 'nenhuma');

  process.exit(0);
}

check().catch(e => { console.error(e.message); process.exit(1); });

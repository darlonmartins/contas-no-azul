const { sequelize } = require('./models');

async function check() {
  const [invoices] = await sequelize.query(`
    SELECT i.id, i."cardId", i.month, i.paid, c.name as card_name
    FROM "Invoices" i
    JOIN "Cards" c ON c.id = i."cardId"
    WHERE i.paid = true
    ORDER BY i."updatedAt" DESC
    LIMIT 10
  `);
  
  console.log('✅ Faturas pagas:');
  invoices.forEach(i => console.log(`  Card: ${i.card_name} (id=${i.cardId}) | Mês: ${i.month} | paid: ${i.paid}`));

  const [cards] = await sequelize.query(`
    SELECT id, name FROM "Cards" ORDER BY id
  `);
  console.log('\n📋 Cartões cadastrados:');
  cards.forEach(c => console.log(`  id=${c.id} | ${c.name}`));
  
  process.exit(0);
}

check().catch(e => { console.error(e.message); process.exit(1); });

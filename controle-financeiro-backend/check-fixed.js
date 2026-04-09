const { sequelize } = require('./models');

async function run() {
  try {
    // Verifica se a coluna existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Transactions' 
      AND column_name = 'fixedGroupId'
    `);
    
    if (results.length === 0) {
      console.log('❌ Coluna fixedGroupId NÃO existe. Adicionando...');
      await sequelize.query(`ALTER TABLE "Transactions" ADD COLUMN IF NOT EXISTS "fixedGroupId" VARCHAR(36) DEFAULT NULL`);
      console.log('✅ Coluna adicionada!');
    } else {
      console.log('✅ Coluna fixedGroupId já existe.');
    }

    // Verifica quantas transações têm fixedGroupId preenchido
    const [count] = await sequelize.query(`
      SELECT COUNT(*) as total FROM "Transactions" WHERE "fixedGroupId" IS NOT NULL
    `);
    console.log(`📊 Transações com fixedGroupId: ${count[0].total}`);

    // Mostra as últimas 5 transações
    const [recent] = await sequelize.query(`
      SELECT id, title, type, date, "fixedGroupId" 
      FROM "Transactions" 
      ORDER BY id DESC 
      LIMIT 5
    `);
    console.log('📋 Últimas 5 transações:');
    recent.forEach(t => console.log(`  #${t.id} | ${t.title} | ${t.type} | ${t.date} | fixedGroupId: ${t.fixedGroupId || 'NULL'}`));

    process.exit(0);
  } catch (e) {
    console.error('Erro:', e.message);
    process.exit(1);
  }
}

run();

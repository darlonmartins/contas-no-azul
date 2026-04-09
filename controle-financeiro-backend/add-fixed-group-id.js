const { sequelize } = require('./models');

sequelize.query('ALTER TABLE "Transactions" ADD COLUMN IF NOT EXISTS "fixedGroupId" VARCHAR(36) DEFAULT NULL')
  .then(() => {
    console.log('✅ Coluna fixedGroupId adicionada com sucesso!');
    process.exit(0);
  })
  .catch(e => {
    console.error('Erro:', e.message);
    process.exit(1);
  });

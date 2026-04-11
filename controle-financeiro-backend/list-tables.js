const { sequelize } = require('./models');

sequelize.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
  .then(([rows]) => {
    console.log('Tabelas:', rows.map(t => t.tablename).join(', '));
    process.exit(0);
  })
  .catch(e => { console.error(e.message); process.exit(1); });

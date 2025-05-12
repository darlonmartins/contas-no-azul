const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');

    // Descomente a linha abaixo se quiser sincronizar os modelos com o banco automaticamente
    // await sequelize.sync({ alter: true });

    console.log('📦 Modelos sincronizados com o banco.');
  } catch (error) {
    console.error('❌ Erro ao conectar no banco de dados:', error);
  }
})();

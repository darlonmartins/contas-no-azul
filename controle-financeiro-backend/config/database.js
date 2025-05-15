require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'postgres',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
    },
    logging: false,
  }
);

// Função com retry
const connectWithRetry = async () => {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      await sequelize.authenticate();
      console.log("✅ Banco de dados conectado com sucesso.");
      break;
    } catch (error) {
      attempts++;
      console.warn(`⚠️ Tentativa ${attempts} de conexão falhou:`, error.message);
      if (attempts >= maxAttempts) {
        throw new Error("🛑 Falha ao conectar ao banco após várias tentativas.");
      }
      await new Promise((res) => setTimeout(res, 4000)); // aguarda 4 segundos
    }
  }
};

module.exports = { sequelize, connectWithRetry };

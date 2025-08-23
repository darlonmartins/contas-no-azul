require('dotenv').config();

const common = {
  dialect: 'mysql',
  port: Number(process.env.DB_PORT) || 3306,   // <-- porta do MySQL
  timezone: '-03:00',
  dialectOptions: { dateStrings: true, typeCast: true },
  logging: false,
};

module.exports = {
  development: {
    username: process.env.DB_USER || 'financeiro_user',
    password: process.env.DB_PASS || 'financeiro_pass',
    database: process.env.DB_NAME || 'controle_financeiro',
    host: process.env.DB_HOST || '127.0.0.1',
    ...common,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    ...common,
  },
};

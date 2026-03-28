require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      timezone: '-03:00',
      logging: false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || 'postgres',
        timezone: '-03:00',
        logging: false,
        dialectOptions: {
          ssl: process.env.DB_SSL === 'true'
            ? { require: true, rejectUnauthorized: false }
            : false,
        },
      }
    );

module.exports = { sequelize };
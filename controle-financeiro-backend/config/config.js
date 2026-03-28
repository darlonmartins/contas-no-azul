require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

const base = {
  dialect: process.env.DB_DIALECT || 'postgres',
  timezone: '-03:00',
  logging: false,
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true'
      ? { require: true, rejectUnauthorized: false }
      : false,
  },
};

const fromUrl = process.env.DATABASE_URL
  ? { url: process.env.DATABASE_URL, ...base }
  : {
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host:     process.env.DB_HOST,
      port:     Number(process.env.DB_PORT) || 5432,
      ...base,
    };

module.exports = {
  development: fromUrl,
  production:  fromUrl,
};
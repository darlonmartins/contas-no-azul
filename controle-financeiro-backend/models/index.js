require('dotenv').config();
const { Sequelize } = require('sequelize');

/**
 * Produção E desenvolvimento: MySQL
 * Você ainda pode sobrescrever via .env:
 *   DB_DIALECT=mysql
 *   DB_HOST=...
 *   DB_PORT=3306 (ou 3307 no seu local)
 *   DB_NAME=controle_financeiro
 *   DB_USER=financeiro_user
 *   DB_PASS=financeiro_pass
 *   # opcional em provedores gerenciados:
 *   # DB_SSL=true
 */

const DIALECT = process.env.DB_DIALECT || 'mysql';
const PORT = Number(process.env.DB_PORT) || 3306;

const commonOpts = {
  dialect: DIALECT,              // mysql por padrão
  timezone: '-03:00',
  logging: false,
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
    dateStrings: true,
    typeCast: true,
  },
};

// Se quiser usar DATABASE_URL (alguns provedores oferecem), habilite:
const useUrl = !!process.env.DATABASE_URL;

const sequelize = useUrl
  ? new Sequelize(process.env.DATABASE_URL, {
      ...commonOpts,
      protocol: DIALECT,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: PORT,
        ...commonOpts,
      }
    );

// =====================
// Imports dos models
// =====================
const User         = require('./User')(sequelize);
const Transaction  = require('./Transaction')(sequelize);
const Category     = require('./Category')(sequelize);
const Objective    = require('./Objective')(sequelize);
const Card         = require('./Card')(sequelize);
const Account      = require('./Account')(sequelize, Sequelize.DataTypes);
const Invoice      = require('./Invoice')(sequelize, Sequelize.DataTypes);
const MonthlyGoal  = require('./MonthlyGoal')(sequelize);
const Trial        = require('./Trial')(sequelize, Sequelize.DataTypes);

// ✅ Novo: pareamento WhatsApp ↔ usuário (persistido em DB)
const WhatsappPairing = require('./WhatsappPairing')(sequelize, Sequelize.DataTypes);

// =====================
// Objeto com todos os models
// =====================
const models = {
  User,
  Transaction,
  Category,
  Objective,
  Card,
  Account,
  Invoice,
  MonthlyGoal,
  Trial,
  WhatsappPairing, // ✅ exporta
};

// =====================
// RELACIONAMENTOS
// =====================
User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Objective, { foreignKey: 'userId' });
Objective.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Category, { foreignKey: 'userId' });
Category.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Transaction, { foreignKey: 'categoryId' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(Card, { foreignKey: 'userId' });
Card.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Account, { foreignKey: 'userId' });
Account.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(MonthlyGoal, { foreignKey: 'userId' });
MonthlyGoal.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(MonthlyGoal, { foreignKey: 'categoryId' });
MonthlyGoal.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasOne(Trial, { foreignKey: 'userId' });
Trial.belongsTo(User, { foreignKey: 'userId' });

// ✅ Novo: cada usuário pode ter 1..N vínculos de telefone (se preferir 1:1, troque por hasOne)
User.hasMany(WhatsappPairing, { foreignKey: 'userId', onDelete: 'CASCADE' });
WhatsappPairing.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

// =====================
// Ativa os métodos associate (se existirem)
// =====================
if (typeof Objective.associate === 'function')   Objective.associate(models);
if (typeof Category.associate === 'function')    Category.associate(models);
if (typeof Transaction.associate === 'function') Transaction.associate(models);
if (typeof WhatsappPairing.associate === 'function') WhatsappPairing.associate(models);

// =====================
// Export
// =====================
module.exports = {
  sequelize,
  ...models,
};

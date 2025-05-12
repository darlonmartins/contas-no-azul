require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

// Imports dos models
const User = require('./User')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const Category = require('./Category')(sequelize);
const Objective = require('./Objective')(sequelize);
const Card = require('./Card')(sequelize);
const Account = require('./Account')(sequelize, Sequelize.DataTypes);
const Invoice = require('./Invoice')(sequelize, Sequelize.DataTypes); // ✅ certo
const MonthlyGoal = require('./MonthlyGoal')(sequelize); // ✅ Adicionado

// Objeto com todos os models
const models = {
  User,
  Transaction,
  Category,
  Objective,
  Card,
  Account,
  Invoice,
  MonthlyGoal, // ✅ Registrado aqui
};

// RELACIONAMENTOS
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

User.hasMany(MonthlyGoal, { foreignKey: 'userId' }); // ✅ relação com usuário
MonthlyGoal.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(MonthlyGoal, { foreignKey: 'categoryId' }); // ✅ relação com categoria
MonthlyGoal.belongsTo(Category, { foreignKey: 'categoryId' });

// Ativa os métodos associate (se existirem)
if (typeof Objective.associate === 'function') {
  Objective.associate(models);
}
if (typeof Category.associate === 'function') {
  Category.associate(models);
}
if (typeof Transaction.associate === 'function') {
  Transaction.associate(models);
}

module.exports = {
  sequelize,
  ...models,
};

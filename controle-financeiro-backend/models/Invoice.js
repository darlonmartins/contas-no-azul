const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Cards',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  month: {
    type: DataTypes.STRING(7), // Exemplo: '2024-05'
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  paid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // 🔵 Começa como NÃO pago
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true, // 🔵 Quando pagar, preenche
  },
}, {
  tableName: 'invoices',
  timestamps: true, // createdAt e updatedAt automáticos
});

module.exports = Invoice;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  mensagem: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
});

Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = Notification;

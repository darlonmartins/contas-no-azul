'use strict';
module.exports = (sequelize, DataTypes) => {
  const Income = sequelize.define('Income', {
    valor: DataTypes.DECIMAL(10, 2),
    data: DataTypes.DATEONLY,
    categoria: DataTypes.STRING,
    conta: DataTypes.STRING,
    descricao: DataTypes.TEXT,
    userId: DataTypes.INTEGER,
  }, {});

  Income.associate = function(models) {
    Income.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Income;
};

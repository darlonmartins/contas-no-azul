const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Goal = sequelize.define('Goal', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currentAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Goal.associate = (models) => {
    Goal.belongsTo(models.Category, { foreignKey: 'categoryId' });
    Goal.belongsTo(models.User, { foreignKey: 'userId' }); // ✅ Adicionado relacionamento com User
  };

  return Goal;
};

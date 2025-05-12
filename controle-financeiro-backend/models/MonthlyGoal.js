const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MonthlyGoal = sequelize.define("MonthlyGoal", {
    month: {
      type: DataTypes.STRING, // Ex: "2025-05"
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
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

  MonthlyGoal.associate = (models) => {
    MonthlyGoal.belongsTo(models.User, {
      foreignKey: "userId",
    });

    MonthlyGoal.belongsTo(models.Category, {
      foreignKey: "categoryId",
    });
  };

  return MonthlyGoal;
};

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Transaction = sequelize.define("Transaction", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("income", "expense", "transfer", "despesa_cartao", "goal"),
      allowNull: false,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Data da transação no formato YYYY-MM-DD",
    },
    isInstallment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    totalInstallments: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    currentInstallment: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    installmentNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    installmentGroupId: {
      type: DataTypes.STRING,
      allowNull: true,
    },


    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fromAccountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    toAccountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    goalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });


  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
      foreignKey: "userId",
    });

    Transaction.belongsTo(models.Category, {
      foreignKey: "categoryId",
    });

    Transaction.belongsTo(models.Account, {
      foreignKey: "fromAccountId",
      as: "fromAccount",
    });

    Transaction.belongsTo(models.Account, {
      foreignKey: "toAccountId",
      as: "toAccount",
    });

    Transaction.belongsTo(models.Card, {
      foreignKey: "cardId",
      as: "card",
    });

    Transaction.belongsTo(models.Objective, {
      foreignKey: "goalId",
    });

  };

  return Transaction;
};

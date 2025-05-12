"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("income", "expense", "transfer"),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      isInstallment: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      totalInstallments: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      currentInstallment: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Categories",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      fromAccountId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Accounts",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      toAccountId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Accounts",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Transactions");
  },
};

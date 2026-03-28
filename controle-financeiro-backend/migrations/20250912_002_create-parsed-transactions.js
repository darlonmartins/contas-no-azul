'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ParsedTransactions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      invoiceFileId: { type: Sequelize.INTEGER, allowNull: false },

      date: { type: Sequelize.DATEONLY, allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: false },
      amount: { type: Sequelize.INTEGER, allowNull: false }, // centavos
      installmentNumber: { type: Sequelize.INTEGER, allowNull: true },
      totalInstallments: { type: Sequelize.INTEGER, allowNull: true },

      rawLine: { type: Sequelize.TEXT, allowNull: true },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('ParsedTransactions', ['userId']);
    await queryInterface.addIndex('ParsedTransactions', ['invoiceFileId']);
    await queryInterface.addIndex('ParsedTransactions', ['date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ParsedTransactions');
  }
};

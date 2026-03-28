'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const tableInfo = await queryInterface.describeTable('Transactions');

    if (!tableInfo.installmentNumber) {
      await queryInterface.addColumn('Transactions', 'installmentNumber', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!tableInfo.isInstallment) {
      await queryInterface.addColumn('Transactions', 'isInstallment', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Transactions', 'installmentNumber');
    await queryInterface.removeColumn('Transactions', 'isInstallment');
  }
};

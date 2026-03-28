'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Transactions');
    if (!table.installmentGroupId) {
      await queryInterface.addColumn('Transactions', 'installmentGroupId', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Transactions');
    if (table.installmentGroupId) {
      await queryInterface.removeColumn('Transactions', 'installmentGroupId');
    }
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Transactions');
    if (!tableInfo.fixedGroupId) {
      await queryInterface.addColumn('Transactions', 'fixedGroupId', {
        type: Sequelize.STRING(36),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Transactions', 'fixedGroupId');
  },
};

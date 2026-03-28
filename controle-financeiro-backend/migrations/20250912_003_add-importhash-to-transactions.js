'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const table = await queryInterface.describeTable('Transactions');
    if (!table.importHash) {
      await queryInterface.addColumn('Transactions', 'importHash', {
        type: Sequelize.STRING(32), 
        allowNull: true,

      });
    }


    try {
      await queryInterface.addIndex('Transactions', ['userId', 'importHash'], {
        unique: true,
        name: 'uniq_transactions_user_importhash',
      });
    } catch (_) {}
  },

  async down(queryInterface) {
    try { await queryInterface.removeIndex('Transactions', 'uniq_transactions_user_importhash'); } catch (_) {}
    const table = await queryInterface.describeTable('Transactions');
    if (table.importHash) {
      await queryInterface.removeColumn('Transactions', 'importHash');
    }
  }
};

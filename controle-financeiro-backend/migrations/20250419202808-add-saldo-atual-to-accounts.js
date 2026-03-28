'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Accounts');
    if (!table.saldoAtual) {
      await queryInterface.addColumn('Accounts', 'saldoAtual', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        after: '...' 
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('Accounts');
    if (table.saldoAtual) {
      await queryInterface.removeColumn('Accounts', 'saldoAtual');
    }
  },
};

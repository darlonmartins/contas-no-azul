'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Accounts', 'saldoAtual', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Accounts', 'saldoAtual');
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'installmentNumber', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('Transactions', 'isInstallment', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'installmentNumber');
    await queryInterface.removeColumn('Transactions', 'isInstallment');
  }
};

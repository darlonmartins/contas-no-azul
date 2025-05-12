'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'fromAccountId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Accounts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('Transactions', 'toAccountId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Accounts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'fromAccountId');
    await queryInterface.removeColumn('Transactions', 'toAccountId');
  },
};

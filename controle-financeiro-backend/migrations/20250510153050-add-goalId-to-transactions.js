'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const table = await queryInterface.describeTable('Transactions');
    if (!table.goalId) {
      await queryInterface.addColumn('Transactions', 'goalId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Goals', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }


    if (table.goalId) {
      const fks = await queryInterface.getForeignKeyReferencesForTable('Transactions');
      const hasFk = Array.isArray(fks) && fks.some(fk =>
        (fk.columnName || fk.column_name) === 'goalId'
      );

      if (!hasFk) {
        await queryInterface.addConstraint('Transactions', {
          fields: ['goalId'],
          type: 'foreign key',
          name: 'fk_transactions_goalId_goals_id', 
          references: { table: 'Goals', field: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        });
      }
    }
  },

  down: async (queryInterface) => {

    try {
      await queryInterface.removeConstraint('Transactions', 'fk_transactions_goalId_goals_id');
    } catch (_) {}
    const table = await queryInterface.describeTable('Transactions');
    if (table.goalId) {
      await queryInterface.removeColumn('Transactions', 'goalId');
    }
  }
};

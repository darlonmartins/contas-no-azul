'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Transactions');

    if (!table.fromAccountId) {
      await queryInterface.addColumn('Transactions', 'fromAccountId', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!table.toAccountId) {
      await queryInterface.addColumn('Transactions', 'toAccountId', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    const fks = await queryInterface.getForeignKeyReferencesForTable('Transactions');
    const hasFromFk = Array.isArray(fks) && fks.some(fk => (fk.columnName || fk.column_name) === 'fromAccountId');
    const hasToFk   = Array.isArray(fks) && fks.some(fk => (fk.columnName || fk.column_name) === 'toAccountId');

    if (!hasFromFk && (table.fromAccountId || !table.fromAccountId)) {
      await queryInterface.addConstraint('Transactions', {
        fields: ['fromAccountId'],
        type: 'foreign key',
        name: 'fk_transactions_fromAccountId_accounts_id',
        references: { table: 'Accounts', field: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    if (!hasToFk && (table.toAccountId || !table.toAccountId)) {
      await queryInterface.addConstraint('Transactions', {
        fields: ['toAccountId'],
        type: 'foreign key',
        name: 'fk_transactions_toAccountId_accounts_id',
        references: { table: 'Accounts', field: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  async down(queryInterface) {
    try { await queryInterface.removeConstraint('Transactions', 'fk_transactions_fromAccountId_accounts_id'); } catch {}
    try { await queryInterface.removeConstraint('Transactions', 'fk_transactions_toAccountId_accounts_id'); } catch {}

    const table = await queryInterface.describeTable('Transactions');
    if (table.fromAccountId) await queryInterface.removeColumn('Transactions', 'fromAccountId');
    if (table.toAccountId) await queryInterface.removeColumn('Transactions', 'toAccountId');
  },
};

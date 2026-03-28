module.exports = {
  up: async (queryInterface, Sequelize) => {
    // PostgreSQL: para alterar um ENUM é preciso alterar o tipo da coluna
    await queryInterface.sequelize.query(`
      ALTER TABLE "Transactions"
      ALTER COLUMN "type" TYPE VARCHAR(20);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "Transactions"
      ADD CONSTRAINT "transactions_type_check"
      CHECK ("type" IN ('income', 'expense', 'transfer', 'despesa_cartao', 'meta', 'goal'));
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Transactions"
      DROP CONSTRAINT IF EXISTS "transactions_type_check";
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "Transactions"
      ADD CONSTRAINT "transactions_type_check"
      CHECK ("type" IN ('income', 'expense', 'transfer', 'despesa_cartao'));
    `);
  },
};

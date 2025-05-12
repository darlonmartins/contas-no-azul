module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE Transactions MODIFY COLUMN type 
      ENUM('income', 'expense', 'transfer', 'despesa_cartao', 'meta') NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE Transactions MODIFY COLUMN type 
      ENUM('income', 'expense', 'transfer', 'despesa_cartao') NOT NULL;
    `);
  },
};

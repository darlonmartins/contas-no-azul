'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Checa e cria installmentNumber
    const [installmentExists] = await queryInterface.sequelize.query(`
      SHOW COLUMNS FROM Transactions LIKE 'installmentNumber'
    `);
    if (!installmentExists.length) {
      await queryInterface.addColumn('Transactions', 'installmentNumber', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    // Checa e cria isInstallment
    const [isInstallmentExists] = await queryInterface.sequelize.query(`
      SHOW COLUMNS FROM Transactions LIKE 'isInstallment'
    `);
    if (!isInstallmentExists.length) {
      await queryInterface.addColumn('Transactions', 'isInstallment', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Transactions', 'installmentNumber');
    await queryInterface.removeColumn('Transactions', 'isInstallment');
  }
};

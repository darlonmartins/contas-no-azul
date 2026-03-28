'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Cards');
    if (!table.fechamento) {
      await queryInterface.addColumn('Cards', 'fechamento', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('Cards');
    if (table.fechamento) {
      await queryInterface.removeColumn('Cards', 'fechamento');
    }
  },
};

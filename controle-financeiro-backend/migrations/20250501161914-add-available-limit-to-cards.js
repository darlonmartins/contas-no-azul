'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Cards');
    if (!table.availableLimit) {
      await queryInterface.addColumn('Cards', 'availableLimit', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('Cards');
    if (table.availableLimit) {
      await queryInterface.removeColumn('Cards', 'availableLimit');
    }
  },
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Cards', 'availableLimit', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0, // ou use o mesmo valor de `limit` após a criação, se preferir
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Cards', 'availableLimit');
  },
};

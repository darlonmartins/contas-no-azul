'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Cards', 'fechamento', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10, // valor inicial padrão
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Cards', 'fechamento');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      UPDATE \`Cards\`
      SET \`fechamento\` = 10
      WHERE \`fechamento\` IS NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      UPDATE \`Cards\`
      SET \`fechamento\` = NULL
    `);
  }
};

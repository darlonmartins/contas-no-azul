'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Notifications');

    if (!tableInfo.type) {
      await queryInterface.addColumn('Notifications', 'type', {
        type: Sequelize.STRING(20),
        defaultValue: 'info',
        allowNull: false,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Notifications', 'type');
  },
};

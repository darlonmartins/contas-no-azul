"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("MonthlyGoals");
    if (!table.amount) {
      await queryInterface.addColumn("MonthlyGoals", "amount", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      });
    } else {

    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("MonthlyGoals");
    if (table.amount) {
      await queryInterface.removeColumn("MonthlyGoals", "amount");
    }
  },
};

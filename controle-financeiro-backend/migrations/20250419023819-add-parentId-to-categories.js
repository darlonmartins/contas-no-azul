"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    const tableInfo = await queryInterface.describeTable('Categories');

    if (!tableInfo.parentId) {
      await queryInterface.addColumn("Categories", "parentId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Categories",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Categories", "parentId");
  },
};

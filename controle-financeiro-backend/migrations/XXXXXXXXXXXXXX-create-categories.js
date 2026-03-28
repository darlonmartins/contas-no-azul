"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Categories");
    if (!table.parentId) {
      await queryInterface.addColumn("Categories", "parentId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    try {
      const fks = await queryInterface.getForeignKeyReferencesForTable("Categories");
      const hasFk = Array.isArray(fks) && fks.some(
        fk => (fk.columnName || fk.column_name) === "parentId"
      );

      if (!hasFk) {
        await queryInterface.addConstraint("Categories", {
          fields: ["parentId"],
          type: "foreign key",
          name: "fk_categories_parentId_categories_id",
          references: { table: "Categories", field: "id" },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        });
      }
    } catch (_) {

    }
  },

  async down(queryInterface) {
    try { await queryInterface.removeConstraint("Categories", "fk_categories_parentId_categories_id"); } catch {}
    const table = await queryInterface.describeTable("Categories");
    if (table.parentId) {
      await queryInterface.removeColumn("Categories", "parentId");
    }
  },
};

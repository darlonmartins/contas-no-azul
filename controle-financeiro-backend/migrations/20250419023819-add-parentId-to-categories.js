"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Checa se a coluna parentId já existe na tabela
    const [exists] = await queryInterface.sequelize.query(`
      SHOW COLUMNS FROM Categories LIKE 'parentId'
    `);

    if (!exists.length) {
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

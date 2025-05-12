'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Incomes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      data: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      categoria: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      conta: {
        type: Sequelize.STRING,
      },
      descricao: {
        type: Sequelize.TEXT,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Incomes');
  },
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Expenses', {
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
      tipo: {
        type: Sequelize.ENUM('fixa', 'variavel'),
        allowNull: false,
        defaultValue: 'variavel',
      },
      parcelas: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
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
    await queryInterface.dropTable('Expenses');
  },
};

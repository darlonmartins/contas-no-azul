module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Transactions', 'goalId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Goals',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Transactions', 'goalId');
  }
};

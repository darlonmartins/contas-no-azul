'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WhatsappPairings', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED || Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      phone: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('WhatsappPairings', ['phone'], { unique: true, name: 'ux_whatsapp_pairings_phone' });
    await queryInterface.addIndex('WhatsappPairings', ['userId'], { name: 'ix_whatsapp_pairings_userId' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('WhatsappPairings');
  }
};

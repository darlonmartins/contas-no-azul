'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InvoiceFiles', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      cardId: { type: Sequelize.INTEGER, allowNull: true },

      bank: { type: Sequelize.STRING(50), allowNull: true },
      statementMonth: { type: Sequelize.STRING(7), allowNull: true }, // "MM/YYYY"
      closingDate: { type: Sequelize.DATEONLY, allowNull: true },
      dueDate: { type: Sequelize.DATEONLY, allowNull: true },

      filePath: { type: Sequelize.STRING(512), allowNull: false },
      fileHash: { type: Sequelize.STRING(64), allowNull: false },
      fileSize: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },

      status: {
        type: Sequelize.ENUM('uploaded', 'parsed', 'imported', 'error'),
        allowNull: false,
        defaultValue: 'uploaded'
      },

      parsedCount: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      importedCount: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      errorMessage: { type: Sequelize.TEXT, allowNull: true },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('InvoiceFiles', ['userId']);
    await queryInterface.addIndex('InvoiceFiles', ['cardId']);
    await queryInterface.addIndex('InvoiceFiles', ['fileHash'], { unique: true, name: 'idx_invoicefiles_filehash' });
    await queryInterface.addIndex('InvoiceFiles', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('InvoiceFiles', 'idx_invoicefiles_filehash');
    await queryInterface.dropTable('InvoiceFiles');
  }
};

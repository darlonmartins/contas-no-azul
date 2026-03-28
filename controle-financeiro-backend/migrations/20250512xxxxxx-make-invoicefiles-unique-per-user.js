'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remova qualquer UNIQUE só em fileHash (nome pode variar – tentamos vários)
    try { await queryInterface.removeIndex('InvoiceFiles', ['fileHash']); } catch (e) {}
    try { await queryInterface.removeConstraint('InvoiceFiles', 'InvoiceFiles_fileHash_key'); } catch (e) {}
    try { await queryInterface.removeConstraint('InvoiceFiles', 'invoicefiles_filehash_unique'); } catch (e) {}
    try { await queryInterface.removeConstraint('InvoiceFiles', 'uniq_invoicefiles_filehash'); } catch (e) {}

    // Adicione UNIQUE por (userId, fileHash)
    await queryInterface.addIndex('InvoiceFiles', ['userId', 'fileHash'], {
      unique: true,
      name: 'uniq_invoicefiles_user_filehash',
    });
  },

  async down(queryInterface, Sequelize) {
    try { await queryInterface.removeIndex('InvoiceFiles', 'uniq_invoicefiles_user_filehash'); } catch (e) {}
    await queryInterface.addIndex('InvoiceFiles', ['fileHash'], {
      unique: true,
      name: 'uniq_invoicefiles_filehash',
    });
  }
};

// seeders/202404080002-default-categories.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', [
      { name: 'Alimentação', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Transporte', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Saúde', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Educação', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Lazer', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Moradia', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Outros', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  },
};

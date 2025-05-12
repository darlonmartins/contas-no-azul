'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const hashedPassword = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('Users', [
      {
        name: 'Usuário Demo',
        email: 'demo@financeiro.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', { email: 'demo@financeiro.com' });
  },
};

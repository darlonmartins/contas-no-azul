const { Account } = require('../models');
const { createAccount } = require('./accountService');
const { createDefaultCategories } = require('./categoryService');

/**
 * Executa a rotina padrão de configuração ao criar um novo usuário.
 * - Cria a conta principal "Carteira" (caso ainda não exista)
 * - Cria categorias padrão
 */
const setupNovoUsuario = async (user) => {
  if (!user || !user.id) {
    console.warn('⚠️ Usuário inválido ao tentar configurar novo usuário');
    return;
  }

  // Criação da carteira
  const existing = await Account.findOne({
    where: {
      userId: user.id,
      name: 'Carteira',
      isMain: true,
    },
  });

  if (!existing) {
    await createAccount({
      name: 'Carteira',
      bank: 'Carteira',
      type: 'principal',
      isMain: true,
      saldoAtual: 0,
      userId: user.id,
    });
    console.log('✅ Conta "Carteira" criada para o usuário', user.email);
  } else {
    console.log('⚠️ Conta "Carteira" já existia para o usuário', user.email);
  }

  // Criação de categorias padrão
  await createDefaultCategories(user.id);
  console.log('✅ Categorias padrão criadas para o usuário', user.email);
};

module.exports = setupNovoUsuario;

const { Account } = require('../models');

// Criação segura da conta
const createAccount = async (data) => {
  // Proteção contra duplicidade de conta principal "Carteira"
  if (data.isMain && data.name === 'Carteira') {
    const existing = await Account.findOne({
      where: { userId: data.userId, name: 'Carteira', isMain: true }
    });

    if (existing) {
      console.log('⚠️ Conta principal "Carteira" já existe para o usuário', data.userId);
      return existing; // ou lance erro, se quiser travar
    }
  }

  return await Account.create(data);
};

// Busca todas as contas do usuário, ordenadas por principal e nome
const getAccounts = async (userId) => {
  return await Account.findAll({
    where: { userId },
    order: [['isMain', 'DESC'], ['name', 'ASC']],
  });
};

// Atualização de conta com segurança por userId
const updateAccount = async (id, data, userId) => {
  const account = await Account.findOne({ where: { id, userId } });
  if (!account) throw new Error('Conta não encontrada');
  return await account.update(data);
};

// Exclusão segura
const deleteAccount = async (id, userId) => {
  const account = await Account.findOne({ where: { id, userId } });
  if (!account) throw new Error('Conta não encontrada');
  return await account.destroy();
};

module.exports = {
  createAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
};

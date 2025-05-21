const { Account } = require('../models');

// Criação segura da conta
const createAccount = async (data) => {
  const { userId, name } = data;
  const isCarteira = name.trim().toLowerCase() === 'carteira';

  if (isCarteira) {
    // Verifica se já existe uma conta "Carteira" para o usuário
    const existing = await Account.findOne({
      where: { userId, name: 'Carteira' }
    });

    if (existing) {
      console.log('⚠️ Usuário já possui conta "Carteira"');
      return existing;
    }

    // Marca esta como principal e desmarca as demais
    data.isMain = true;
    await Account.update({ isMain: false }, { where: { userId } });
  } else {
    data.isMain = false;
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

  const isCarteira = data.name?.trim().toLowerCase() === 'carteira';

  if (isCarteira) {
    data.isMain = true;
    await Account.update({ isMain: false }, { where: { userId } });
  } else {
    data.isMain = false;
  }

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

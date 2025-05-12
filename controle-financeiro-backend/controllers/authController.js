const path = require('path');
console.log('🕵️ authService carregado de:', path.resolve(__dirname, '../services/authService'));

const authService = require('../services/authService');
const { createAccount } = require('../services/accountService');
const { createDefaultCategories } = require('../services/categoryService'); // ✅ novo import
const { Account } = require('../models');

// Controller de Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return res.status(200).json(result);
  } catch (error) {
    console.error('🔴 Erro no login:', error);
    return res.status(401).json({ message: error.message || 'Erro ao fazer login.' });
  }
};

// Controller de Registro
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Cria o usuário
    const user = await authService.register(name, email, password);

    // Impede duplicidade da conta "Carteira"
    const existing = await Account.findOne({
      where: {
        userId: user.id,
        name: 'Carteira',
        isMain: true
      }
    });

    if (!existing) {
      await createAccount({
        name: 'Carteira',
        bank: 'Carteira',
        type: 'principal',
        isMain: true,
        saldoAtual: 0,
        userId: user.id
      });
      console.log('✅ Conta "Carteira" criada para o usuário', user.email);
    } else {
      console.log('⚠️ Conta "Carteira" já existia para o usuário', user.email);
    }

    // ✅ Cria categorias padrão para o novo usuário
    await createDefaultCategories(user.id);

    return res.status(201).json(user);
  } catch (error) {
    console.error('🔴 Erro ao registrar usuário:', error);
    return res.status(400).json({ message: error.message || 'Erro ao cadastrar usuário.' });
  }
};

module.exports = { login, register };

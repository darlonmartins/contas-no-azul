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

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Credencial do Google não fornecida.' });
  }

  try {
    // 🔍 Verifica e decodifica token do Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, sub } = payload;

    // 👤 Procura ou cria usuário local
    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: sub, // 👈 evita campo vazio (não será usada)
      });
      console.log('✅ Novo usuário criado via Google:', email);
    }

    // 🎫 Gera token local JWT
    const token = generateToken({ id: user.id, email: user.email });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Erro no login com Google:', error);
    return res.status(401).json({ message: 'Falha na autenticação com Google' });
  }
};


module.exports = { login, register, googleLogin };


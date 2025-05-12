console.log('📂 Arquivo authService carregado:', __filename);

const generateToken = require('../utils/generateToken');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// LOGIN
const login = async (email, password) => {
  console.log('🧪 Login: recebendo email:', email, 'senha:', password);

  const user = await User.findOne({ where: { email } });

  if (!user) {
    console.log('❌ Usuário não encontrado');
    throw new Error('Usuário não encontrado');
  }

  console.log('🧪 Usuário encontrado:', user.email);
  console.log('🧪 Senha no banco (hash):', user.password);

  const isMatch = await bcrypt.compare(password, user.password);
  console.log('🧪 isMatch:', isMatch);

  if (!isMatch) {
    throw new Error('Senha incorreta');
  }

  const token = generateToken({ id: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};

// REGISTER
const register = async (name, email, password) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    console.log('⚠️ E-mail já cadastrado');
    throw new Error('E-mail já cadastrado');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log('✅ Usuário salvo com sucesso:', user.toJSON());

    // ❌ REMOVIDO: criação duplicada da conta "Carteira"
    // A criação está controlada no authController.js com verificação

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error('❌ Erro ao salvar usuário:', error);
    throw new Error('Erro ao registrar usuário');
  }
};

module.exports = { login, register };

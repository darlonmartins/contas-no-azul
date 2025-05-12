const bcrypt = require('bcrypt');
const { User } = require('../models');

const register = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return await User.create({ ...data, password: hashedPassword });
};

const getUserById = async (id) => {
  return await User.findByPk(id);
};

module.exports = {
  register,
  getUserById,
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // ← esse campo está tentando criar UNIQUE novamente
    }
    ,
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return User;
};

module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bank: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('principal', 'corrente', 'poupança', 'outro'),
      allowNull: false,
    },
    isMain: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    saldoAtual: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Account.associate = (models) => {
    Account.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
  };

  return Account;
};

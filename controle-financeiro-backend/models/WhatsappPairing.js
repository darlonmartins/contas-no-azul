// backend/models/WhatsappPairing.js
module.exports = (sequelize, DataTypes) => {
  const WhatsappPairing = sequelize.define('WhatsappPairing', {
    phone: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,              // um número só pode apontar para 1 usuário
      validate: { notEmpty: true }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'WhatsappPairings',
    indexes: [
      { unique: true, fields: ['phone'] },
      { fields: ['userId'] }
    ]
  });

  WhatsappPairing.associate = (models) => {
    WhatsappPairing.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return WhatsappPairing;
};

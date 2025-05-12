const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Card = sequelize.define('Card', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    limit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    availableLimit: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    dueDate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fechamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  // ✅ Antes de criar 1 cartão, define availableLimit = limit se não for informado
  Card.beforeCreate((card) => {
    if (card.limit && !card.availableLimit) {
      card.availableLimit = card.limit;
    }
  });

  // ✅ Antes de criar vários cartões em bulk
  Card.beforeBulkCreate((cards) => {
    cards.forEach(card => {
      if (card.limit && !card.availableLimit) {
        card.availableLimit = card.limit;
      }
    });
  });

  return Card;
};

// /backend/models/ParsedTransaction.js
module.exports = (sequelize, DataTypes) => {
  const ParsedTransaction = sequelize.define('ParsedTransaction', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    invoiceFileId: { type: DataTypes.INTEGER, allowNull: false },

    date: { type: DataTypes.DATEONLY, allowNull: false },          // YYYY-MM-DD
    description: { type: DataTypes.STRING(255), allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },         // em centavos (staging)
    installmentNumber: { type: DataTypes.INTEGER, allowNull: true },
    totalInstallments: { type: DataTypes.INTEGER, allowNull: true },

    rawLine: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'ParsedTransactions',
    underscored: false
  });

  ParsedTransaction.associate = (models) => {
    ParsedTransaction.belongsTo(models.User, { foreignKey: 'userId' });
    ParsedTransaction.belongsTo(models.InvoiceFile, { foreignKey: 'invoiceFileId', onDelete: 'CASCADE' });
  };

  return ParsedTransaction;
};

module.exports = (sequelize, DataTypes) => {
  const InvoiceFile = sequelize.define('InvoiceFile', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    cardId: { type: DataTypes.INTEGER, allowNull: true },

    bank: { type: DataTypes.STRING(50), allowNull: true },
    statementMonth: { type: DataTypes.STRING(7), allowNull: true }, // "MM/YYYY"
    closingDate: { type: DataTypes.DATEONLY, allowNull: true },
    dueDate: { type: DataTypes.DATEONLY, allowNull: true },

    filePath: { type: DataTypes.STRING(512), allowNull: false },
    fileHash: { type: DataTypes.STRING(64), allowNull: false },
    fileSize: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },

    status: {
      type: DataTypes.ENUM('uploaded', 'parsed', 'imported', 'error'),
      allowNull: false,
      defaultValue: 'uploaded'
    },

    parsedCount: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    importedCount: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    errorMessage: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'InvoiceFiles',
    underscored: false
  });

  InvoiceFile.associate = (models) => {
    InvoiceFile.belongsTo(models.User, { foreignKey: 'userId' });
    InvoiceFile.belongsTo(models.Card, { foreignKey: 'cardId' });
    InvoiceFile.hasMany(models.ParsedTransaction, { foreignKey: 'invoiceFileId', onDelete: 'CASCADE' });
  };

  return InvoiceFile;
};

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Category = sequelize.define("Category", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Category.associate = (models) => {
    Category.hasMany(models.Category, {
      as: "children",
      foreignKey: "parentId",
    });
    Category.belongsTo(models.Category, {
      as: "parent",
      foreignKey: "parentId",
    });

    Category.belongsTo(models.User, {
      foreignKey: "userId",
    });

    models.User.hasMany(Category, {
      foreignKey: "userId",
    });
  };

  return Category;
};

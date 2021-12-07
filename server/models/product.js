"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      product.belongsTo(models.user, {
        as: "user",
        foreignKey: {
          name: "user_id",
        },
      });
      product.belongsToMany(models.transaction, {
        as: "transactions",
        through: {
          model: "order",
          as: "order",
        },
        foreignKey: "product_id",
      });
      product.hasOne(models.order, {
        as: "qty",
        foreignKey: {
          name: "product_id",
        },
      });
    }
  }
  product.init(
    {
      title: DataTypes.STRING,
      price: DataTypes.INTEGER,
      image: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "product",
    }
  );
  return product;
};

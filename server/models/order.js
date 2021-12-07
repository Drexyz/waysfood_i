'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      order.belongsTo(models.product, {
        as: "product",
        foreignKey: {
          name: "product_id",
        },
      });
    }
  };
  order.init({
    product_id: DataTypes.INTEGER,
    transaction_id: DataTypes.INTEGER,
    qty: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'order',
  });
  return order;
};
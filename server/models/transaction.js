'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      transaction.belongsTo(models.user, {
        as: 'user',
        foreignKey: {
          name: 'user_id'
        }
      });
      transaction.belongsTo(models.user, {
        as: 'partner',
        foreignKey: {
          name: 'partner_id'
        }
      });
      transaction.belongsToMany(models.product, {
        as: 'products',
        through: {
          model: 'order',
          as: 'order'
        },
        foreignKey: 'transaction_id'
      })
      transaction.hasMany(models.order, {
        as: "productOrdered",
        foreignKey: {
          name: "transaction_id",
        },
      });
    }
  };
  transaction.init({
    user_id: DataTypes.INTEGER,
    partner_id: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'transaction',
  });
  return transaction;
};
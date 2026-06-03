'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StoreReview extends Model {
    static associate(models) {
      StoreReview.belongsTo(models.Store, { foreignKey: 'storeId', as: 'store' });
      StoreReview.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  StoreReview.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'StoreReview',
    tableName: 'StoreReviews'
  });

  return StoreReview;
};

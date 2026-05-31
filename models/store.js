'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    static associate(models) {
      Store.hasMany(models.StoreReview, { foreignKey: 'storeId', as: 'reviews' });
    }
  }

  Store.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'store' // 'nursery' (vườn ươm) or 'store' (cửa hàng bán thuốc/cây cảnh)
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rating: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0
    }
  }, {
    sequelize,
    modelName: 'Store',
    tableName: 'Stores'
  });

  return Store;
};

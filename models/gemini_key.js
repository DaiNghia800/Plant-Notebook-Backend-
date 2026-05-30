'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GeminiKey extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  GeminiKey.init({
    apiKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    isBanned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    cooldownUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    dailyRequestLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 1500,
      allowNull: false
    },
    usedToday: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    lastUsed: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'GeminiKey',
    tableName: 'GeminiKeys',
  });
  return GeminiKey;
};

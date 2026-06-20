'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AiScanTask extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AiScanTask.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    userId: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    aiResult: DataTypes.JSON,
    status: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
      defaultValue: 'PENDING'
    }
  }, {
    sequelize,
    modelName: 'AiScanTask',
  });
  return AiScanTask;
};
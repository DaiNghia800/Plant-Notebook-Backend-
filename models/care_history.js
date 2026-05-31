'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CareHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CareHistory.belongsTo(models.GardenPlant, { foreignKey: 'gardenPlantId' });
    }
  }
  CareHistory.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true,
      allowNull: false
    },
    gardenPlantId: DataTypes.STRING,
    actionType: DataTypes.STRING,       
    performedAt: DataTypes.DATE, 
  }, {
    sequelize,
    timestamps: false,
    modelName: 'CareHistory',
  });
  return CareHistory;
};
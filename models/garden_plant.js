'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GardenPlant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      GardenPlant.belongsTo(models.Plant, { foreignKey: 'plantId' });
      GardenPlant.hasMany(models.Reminder, { foreignKey: 'gardenPlantId' });
      GardenPlant.belongsTo(models.Category, { foreignKey: 'categoryId' });
      GardenPlant.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  GardenPlant.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true,
      allowNull: false
    },
    userId: DataTypes.STRING,   
    plantId: DataTypes.STRING,
    categoryId: DataTypes.STRING,
    status: DataTypes.STRING,
    imageUrl: DataTypes.STRING,      
    startedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'GardenPlant',
  });
  return GardenPlant;
};
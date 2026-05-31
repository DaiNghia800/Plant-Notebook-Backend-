'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reminder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Reminder.belongsTo(models.GardenPlant, { foreignKey: 'gardenPlantId' });
    }
  }
  Reminder.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true,
      allowNull: false
    },
    gardenPlantId: DataTypes.STRING,
    type: DataTypes.STRING,       
    frequencyDays: DataTypes.INTEGER, 
    lastActionAt: DataTypes.DATE, 
    lastNotificationSentAt: DataTypes.DATE, 
    isPushEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notes: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Reminder',
  });
  return Reminder;
};
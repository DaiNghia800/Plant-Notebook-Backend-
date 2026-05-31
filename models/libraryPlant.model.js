const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LibraryPlant = sequelize.define("LibraryPlant", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lightLevel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  waterNeed: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  careGuide: {
    type: DataTypes.JSONB, // Mảng các chuỗi hướng dẫn
    defaultValue: [],
  },
  funFacts: {
    type: DataTypes.JSONB, // Mảng các sự thật thú vị
    defaultValue: [],
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isTrending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isRare: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  temperatureRange: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  badge: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  scientificName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  humidityLevel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  toxicity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  wateringIntervalDays: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  wateringFrequencyLabel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = LibraryPlant;

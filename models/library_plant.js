'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LibraryPlant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here if needed
    }
  }
  LibraryPlant.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    scientificName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shortDescription: DataTypes.TEXT,
    description: DataTypes.TEXT,
    lightLevel: DataTypes.STRING,
    waterNeed: DataTypes.STRING,
    difficulty: DataTypes.STRING,
    temperature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    humidity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    toxicity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    careGuide: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    growthTimeline: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    funFacts: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    imageUrl: DataTypes.TEXT,
    isTrending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isRare: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    badge: {
      type: DataTypes.STRING,
      allowNull: true
    },
    wateringFrequencyLabel: {
      type: DataTypes.STRING,
      defaultValue: '2 lần/tuần'
    },
    approvalStatus: {
      type: DataTypes.STRING,
      defaultValue: 'approved' // 'approved' | 'pending' | 'rejected'
    },
    contributorId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'LibraryPlant',
    tableName: 'LibraryPlants',
    timestamps: true
  });
  return LibraryPlant;
};

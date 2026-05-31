'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LibraryPlants', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      scientificName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      category: {
        allowNull: false,
        type: Sequelize.STRING
      },
      shortDescription: {
        type: Sequelize.TEXT
      },
      description: {
        type: Sequelize.TEXT
      },
      lightLevel: {
        type: Sequelize.STRING
      },
      waterNeed: {
        type: Sequelize.STRING
      },
      difficulty: {
        type: Sequelize.STRING
      },
      temperature: {
        type: Sequelize.STRING,
        allowNull: true
      },
      humidity: {
        type: Sequelize.STRING,
        allowNull: true
      },
      toxicity: {
        type: Sequelize.STRING,
        allowNull: true
      },
      careGuide: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      growthTimeline: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      funFacts: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      imageUrl: {
        type: Sequelize.TEXT
      },
      isTrending: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isRare: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      badge: {
        type: Sequelize.STRING,
        allowNull: true
      },
      wateringFrequencyLabel: {
        type: Sequelize.STRING,
        defaultValue: '2 lần/tuần'
      },
      approvalStatus: {
        type: Sequelize.STRING,
        defaultValue: 'approved'
      },
      contributorId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('LibraryPlants');
  }
};

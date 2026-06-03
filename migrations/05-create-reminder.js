'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reminders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      gardenPlantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'GardenPlants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      frequencyDays: {
        type: Sequelize.INTEGER
      },
      lastActionAt: {
        type: Sequelize.DATE
      },
      lastNotificationSentAt: {
        type: Sequelize.DATE,
        allowNull: true, 
      },
      isPushEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.dropTable('Reminders');
  }
};
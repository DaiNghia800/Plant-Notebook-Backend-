'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GeminiKeys', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      apiKey: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      isBanned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      cooldownUntil: {
        type: Sequelize.DATE,
        allowNull: true
      },
      dailyRequestLimit: {
        type: Sequelize.INTEGER,
        defaultValue: 1500,
        allowNull: false
      },
      usedToday: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lastUsed: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('GeminiKeys');
  }
};

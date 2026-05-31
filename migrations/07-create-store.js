'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Stores', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      latitude: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      longitude: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'store'
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      rating: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
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
    await queryInterface.dropTable('Stores');
  }
};

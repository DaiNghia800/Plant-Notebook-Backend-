'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add role column (string) for simple role name
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    // Add roleId column (UUID) for future role table reference
    await queryInterface.addColumn('Users', 'roleId', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'role');
    await queryInterface.removeColumn('Users', 'roleId');
  }
};

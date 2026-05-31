'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_library_plants_lower_scientific_name ON "LibraryPlants" (LOWER("scientificName"));'
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_library_plants_lower_name ON "LibraryPlants" (LOWER("name"));'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_library_plants_lower_scientific_name;'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_library_plants_lower_name;'
    );
  }
};

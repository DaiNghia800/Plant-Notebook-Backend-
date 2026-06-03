/**
 * Revert contributorId column to VARCHAR(255) to support alphanumeric Firestore IDs
 * Run: node scripts/revert_contributor_varchar.js
 */
require('dotenv').config();
const { sequelize } = require('../models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected.');

    console.log('⚙️ Reverting contributorId column type to VARCHAR(255)...');
    const alterSql = `
      ALTER TABLE "LibraryPlants" 
      ALTER COLUMN "contributorId" TYPE VARCHAR(255);
    `;
    await sequelize.query(alterSql);
    console.log('  ✅ contributorId column successfully reverted to VARCHAR(255).');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing database update:', err);
    process.exit(1);
  }
}

run();

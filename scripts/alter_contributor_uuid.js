/**
 * Database update script: Alter contributorId column to UUID type safely
 * Run command: node scripts/alter_contributor_uuid.js
 */
require('dotenv').config();
const { sequelize } = require('../models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully via Sequelize.');

    // 1. Clean up invalid UUIDs (like 'mobile-user') to NULL so casting won't fail
    console.log('🧹 Cleaning up invalid UUID values in contributorId...');
    const cleanupSql = `
      UPDATE "LibraryPlants" 
      SET "contributorId" = NULL 
      WHERE "contributorId" IS NOT NULL 
        AND "contributorId" !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
    `;
    await sequelize.query(cleanupSql);
    console.log('  ✅ Cleaned up invalid contributorId entries.');

    // 2. Alter column type to UUID using type casting
    console.log('⚙️ Altering contributorId column type to UUID...');
    const alterSql = `
      ALTER TABLE "LibraryPlants" 
      ALTER COLUMN "contributorId" TYPE UUID USING "contributorId"::uuid;
    `;
    await sequelize.query(alterSql);
    console.log('  ✅ contributorId column altered to UUID type.');

    console.log('🎉 Database modification complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing database update:', err);
    process.exit(1);
  }
}

run();

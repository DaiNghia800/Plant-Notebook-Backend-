/**
 * Migration script: Thêm các cột còn thiếu vào bảng LibraryPlants
 * Chạy: node scripts/migrate_library_plants.js
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

const migrations = [
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "temperature" VARCHAR(255)`,
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "humidity" VARCHAR(255)`,
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "toxicity" VARCHAR(255)`,
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "scientificName" VARCHAR(255)`,
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "badge" VARCHAR(255)`,
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "wateringIntervalDays" INTEGER`,
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "wateringFrequencyLabel" VARCHAR(255) DEFAULT '2 lần/tuần'`,
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "isTrending" BOOLEAN DEFAULT false`,
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "isRare" BOOLEAN DEFAULT false`,
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "approvalStatus" VARCHAR(255) DEFAULT 'approved'`,
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "contributorId" VARCHAR(255)`,
  `ALTER TABLE "LibraryPlants" ADD COLUMN IF NOT EXISTS "growthTimeline" JSONB DEFAULT '[]'`,
];

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối PostgreSQL thành công');

    for (const sql of migrations) {
      try {
        await sequelize.query(sql);
        const colName = sql.match(/"(\w+)" /)?.[1] || sql;
        console.log(`  ✅ OK: ${colName}`);
      } catch (err) {
        console.log(`  ⚠️  Bỏ qua (có thể đã tồn tại): ${err.message.slice(0, 80)}`);
      }
    }

    console.log('\n✅ Migration hoàn tất! Bạn có thể khởi động lại Backend.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi kết nối:', err.message);
    process.exit(1);
  }
}

run();

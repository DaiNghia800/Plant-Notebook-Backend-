const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('../models');
const { LibraryPlant } = db;

const runExport = async () => {
  try {
    console.log("=== BẮT ĐẦU XUẤT DỮ LIỆU THƯ VIỆN CÂY ===");
    
    // Connect to database
    await db.sequelize.authenticate();
    console.log("Kết nối PostgreSQL thành công.");

    // Query approved plants
    const plants = await LibraryPlant.findAll({
      where: {
        approvalStatus: 'approved'
      },
      order: [['name', 'ASC']]
    });

    console.log(`Đã tìm thấy ${plants.length} cây được duyệt.`);

    // Convert database instances to raw objects
    const cleanPlants = plants.map(p => {
      const data = p.toJSON();
      // Remove database timestamps and status fields that are not needed in static seeds
      delete data.createdAt;
      delete data.updatedAt;
      delete data.approvalStatus;
      delete data.contributorId;
      return data;
    });

    // Format output as a nice JS file
    const fileContent = `// Tệp này được tạo tự động bởi scripts/export_library_plants.js
// Dựa trên dữ liệu đang có trong database PostgreSQL

const libraryPlantSeedData = ${JSON.stringify(cleanPlants, null, 2)};

module.exports = {
  libraryPlantSeedData,
};
`;

    const outputPath = path.join(__dirname, '../seeds/library_plant.seed.js');
    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`Đã xuất dữ liệu thành công ra file: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error("LỖI KHI XUẤT DỮ LIỆU:", error);
    process.exit(1);
  }
};

runExport();

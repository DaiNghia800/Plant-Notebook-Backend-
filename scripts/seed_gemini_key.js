require('dotenv').config();
const db = require('../models');

/**
 * Script khởi tạo hoặc reset trạng thái API Key của Gemini trong Database.
 * Đọc cấu hình từ biến môi trường GEMINI_API_KEY.
 */
const seedGeminiKey = async () => {
  try {
    console.log('--- BẮT ĐẦU SEED GEMINI API KEY ---');
    await db.sequelize.authenticate();
    
    // 1. Lấy key từ file .env
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.error('❌ LỖI: Chưa cấu hình GEMINI_API_KEY hợp lệ trong file .env');
      process.exit(1);
    }

    // 2. Kiểm tra xem đã có key trong DB chưa
    const existingKey = await db.GeminiKey.findOne({ where: { apiKey } });
    
    if (existingKey) {
      // 3a. Nếu có rồi thì reset lại trạng thái
      await existingKey.update({
        isActive: true,
        isBanned: false,
        cooldownUntil: null
      });
      console.log('✅ Đã tìm thấy Key trong Database. Đã reset trạng thái về Active thành công!');
    } else {
      // 3b. Nếu chưa có thì thêm mới bản ghi
      await db.GeminiKey.create({
        apiKey: apiKey,
        isActive: true,
        isBanned: false,
        dailyRequestLimit: 1500, // Giới hạn mặc định của tài khoản free
        usedToday: 0
      });
      console.log('✅ Đã thêm GEMINI_API_KEY mới vào Database thành công!');
    }
    
    console.log('--- HOÀN TẤT ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH SEED:', error.message);
    process.exit(1);
  }
};

seedGeminiKey();

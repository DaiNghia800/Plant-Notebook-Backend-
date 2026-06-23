require('dotenv').config();
const db = require('../models');
const sqsService = require('../services/shared/sqsService');

// Import service gọi AI thật
const geminiAiService = require('../services/shared/geminiAiService');

const processMessage = async (message) => {
  let receiptHandle = message.ReceiptHandle;
  let body;
  try {
    body = JSON.parse(message.Body);
  } catch (error) {
    console.error('[Worker] Lỗi parse message body:', error);
    await sqsService.deleteMessage(receiptHandle);
    return;
  }

  const { taskId, imageUrl } = body;
  console.log(`\n[Worker] Bắt đầu xử lý Task ID: ${taskId}`);
  console.log(`[Worker] Image URL: ${imageUrl}`);

  try {
    // 1. Cập nhật trạng thái thành PROCESSING
    const task = await db.AiScanTask.findByPk(taskId);
    if (!task) {
      console.warn(`[Worker] Không tìm thấy Task ID: ${taskId} trong DB.`);
      await sqsService.deleteMessage(receiptHandle);
      return;
    }

    task.status = 'PROCESSING';
    await task.save();

    // 2. Gọi Model AI thật (Gemini) từ thư viện của team
    console.log(`[Worker] Đang gọi API Gemini để phân tích...`);
    const aiResult = await geminiAiService.analyzePlantDisease(imageUrl);

    // 3. Cập nhật kết quả vào DB và chuyển status thành COMPLETED
    task.aiResult = aiResult;
    task.status = 'COMPLETED';
    await task.save();

    console.log(`[Worker] Hoàn thành Task ID: ${taskId}. Đã lưu kết quả phân tích AI.`);

    // 4. Gửi Push Notification cho User qua FCM
    try {
      const user = await db.User.findByPk(task.userId);
      if (user && user.fcmToken) {
        const { messaging } = require('../config/firebase');
        const payload = {
          notification: {
            title: 'Kết quả quét AI đã sẵn sàng!',
            body: 'Hệ thống đã phân tích thành công cây của bạn. Nhấn vào để xem chi tiết.'
          },
          data: {
            taskId: task.id.toString()
          },
          token: user.fcmToken
        };
        
        await messaging.send(payload);
        console.log(`[Worker] Đã gửi Push Notification thành công tới User ID: ${user.id}`);
      } else {
        console.log(`[Worker] User ID: ${task.userId} không có fcmToken, bỏ qua gửi Push Notification.`);
      }
    } catch (fcmError) {
      console.error(`[Worker] Lỗi khi gửi Push Notification:`, fcmError.message);
    }

    // 5. Xóa message khỏi SQS
    await sqsService.deleteMessage(receiptHandle);
  } catch (error) {
    console.error(`[Worker] Lỗi trong quá trình xử lý Task ID: ${taskId}:`, error);
    
    // Cập nhật trạng thái FAILED nếu có lỗi
    try {
      const task = await db.AiScanTask.findByPk(taskId);
      if (task) {
        task.status = 'FAILED';
        task.aiResult = { error: error.message };
        await task.save();
      }
    } catch (dbError) {
      console.error('[Worker] Lỗi khi cập nhật status FAILED:', dbError);
    }
  }
};

const startWorker = async () => {
  console.log('==============================================');
  console.log('[Worker] Khởi động AI Background Worker...');
  console.log('[Worker] Đang kết nối tới Database...');
  
  try {
    await db.sequelize.authenticate();
    console.log('[Worker] Kết nối Database thành công.');
  } catch (err) {
    console.error('[Worker] Lỗi kết nối Database:', err);
    process.exit(1);
  }

  console.log('[Worker] Bắt đầu lắng nghe tin nhắn từ SQS...');
  console.log('==============================================');

  while (true) {
    try {
      const messages = await sqsService.receiveMessages();
      
      if (messages && messages.length > 0) {
        console.log(`[Worker] Nhận được ${messages.length} message(s).`);
        // Xử lý song song các messages lấy được
        await Promise.all(messages.map(msg => processMessage(msg)));
      } else {
        // Không có message, waitTimeSeconds của receiveMessages sẽ lo việc giữ kết nối (long polling)
        // Nếu không dùng long polling trên SQS, có thể thêm một khoảng sleep nhỏ ở đây.
      }
    } catch (error) {
      console.error('[Worker] Lỗi vòng lặp Worker:', error);
      // Tránh worker bị crash và lặp quá nhanh khi có lỗi mạng liên tục
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Khởi chạy Worker
startWorker();

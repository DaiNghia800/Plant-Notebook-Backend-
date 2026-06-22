const libraryPlantService = require('../../services/client/library_plant.service');
const geminiScannerService = require('../../services/client/gemini_scanner.service');
const { getCache, setCache, deleteCacheByPattern } = require('../../config/redis');

exports.getAllPlants = async (req, res) => {
  try {
    const { category, isTrending, isRare, approvalStatus } = req.query;

    // Tạo cache key dựa trên query filters
    const cacheKey = `plants:list:${JSON.stringify({ category, isTrending, isRare, approvalStatus })}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log('Cache Hit!');
      return res.status(200).json({ success: true, data: cached });
    }

    console.log('Cache Miss!');
    const plants = await libraryPlantService.getAllPlants({ category, isTrending, isRare, approvalStatus });
    await setCache(cacheKey, plants, 300); // TTL 5 phút
    return res.status(200).json({ success: true, data: plants });
  } catch (error) {
    console.error('getAllPlants error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getPlantById = async (req, res) => {
  try {
    const plantId = req.params.id;

    // Cache-Aside cho chi tiết cây
    const cacheKey = `plants:detail:${plantId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log('Cache Hit!');
      return res.status(200).json({ success: true, data: cached });
    }

    console.log('Cache Miss!');
    const plant = await libraryPlantService.getPlantById(plantId);
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found in library' });
    }
    await setCache(cacheKey, plant, 600); // TTL 10 phút
    return res.status(200).json({ success: true, data: plant });
  } catch (error) {
    console.error('getPlantById error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.contributePlant = async (req, res) => {
  try {
    console.log('[contributePlant] Received body:', req.body);
    console.log('[contributePlant] Received file:', req.file ? { mimetype: req.file.mimetype, size: req.file.size } : null);

    if (!req.body.id || !req.body.name || !req.body.category) {
      console.warn('[contributePlant] Validation failed. Missing required fields:', {
        id: req.body.id,
        name: req.body.name,
        category: req.body.category
      });
      return res.status(400).json({ success: false, message: 'id, name, and category are required' });
    }

    // Parse JSON arrays if they are sent as strings via form-data
    const fieldsToParse = ['careGuide', 'growthTimeline', 'funFacts'];
    for (const field of fieldsToParse) {
      if (typeof req.body[field] === 'string') {
        const trimmed = req.body[field].trim();
        if (trimmed === '') {
          delete req.body[field]; // Ignore empty strings from form-data
          continue;
        }

        // Tự động bao bọc chuỗi thường thành mảng nếu người dùng quên nhập dạng JSON
        if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
          req.body[field] = [trimmed];
          continue;
        }

        try {
          req.body[field] = JSON.parse(trimmed);
        } catch (e) {
          console.warn(`Failed to parse ${field}:`, e.message);
          return res.status(400).json({ 
            success: false,
            message: `Dữ liệu của trường ${field} không đúng định dạng JSON hợp lệ. Chi tiết lỗi: ${e.message}. Bắt buộc phải là mảng hoặc đối tượng JSON hợp lệ.` 
          });
        }
      }
    }

    const userId = req.user ? req.user.id : (req.headers['x-user-id'] || req.query.user_id || 'mobile-user');
    const contributedPlant = await libraryPlantService.contributePlant(req.body, userId);
    await deleteCacheByPattern('plants:*'); // Invalidate plant caches
    return res.status(201).json({
      success: true,
      message: 'Gửi đề xuất cây mới thành công, đang chờ Admin kiểm duyệt.',
      data: contributedPlant
    });
  } catch (error) {
    console.error('contributePlant error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.checkExistence = async (req, res) => {
  try {
    const { name, scientificName } = req.query;
    if (!name && !scientificName) {
      return res.status(400).json({ success: false, message: 'At least name or scientificName is required' });
    }
    const result = await libraryPlantService.checkExistence({ name, scientificName });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('checkExistence error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const sqsService = require('../../services/shared/sqsService');
const db = require('../../models');

exports.scanPlantImage = async (req, res) => {
  try {
    const imageUrl = req.body.imageUrl || req.body.image_url;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image file is required and must be uploaded successfully' });
    }

    // Try to get userId if available (assuming authMiddleware might be used or passed via query/header)
    const userId = req.user ? req.user.id : (req.headers['x-user-id'] || req.query.user_id || 'anonymous');

    // 1. Tạo bản ghi AiScanTask trạng thái PENDING
    const scanTask = await db.AiScanTask.create({
      userId: userId,
      imageUrl: imageUrl,
      status: 'PENDING'
    });

    // 2. Đẩy message vào SQS
    const messageBody = {
      taskId: scanTask.id,
      imageUrl: imageUrl
    };
    await sqsService.sendMessage(messageBody);

    // 3. Trả về cho client 202 Accepted
    return res.status(202).json({
      success: true,
      message: 'Đang xử lý phân tích AI',
      taskId: scanTask.id
    });

  } catch (error) {
    console.error('scanPlantImage error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi đẩy yêu cầu phân tích hình ảnh vào hàng đợi', error: error.message });
  }
};

exports.getScanResult = async (req, res) => {
  try {
    const { taskId } = req.params;

    const scanTask = await db.AiScanTask.findByPk(taskId);

    if (!scanTask) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy task'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        taskId: scanTask.id,
        status: scanTask.status,
        aiResult: scanTask.aiResult
      }
    });
  } catch (error) {
    console.error('getScanResult error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống nội bộ',
      error: error.message
    });
  }
};

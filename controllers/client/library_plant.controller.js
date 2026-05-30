const libraryPlantService = require('../../services/client/library_plant.service');

exports.getAllPlants = async (req, res) => {
  try {
    const { category, isTrending, isRare, approvalStatus } = req.query;
    const plants = await libraryPlantService.getAllPlants({ category, isTrending, isRare, approvalStatus });
    return res.status(200).json({ data: plants });
  } catch (error) {
    console.error('getAllPlants error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getPlantById = async (req, res) => {
  try {
    const plant = await libraryPlantService.getPlantById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found in library' });
    }
    return res.status(200).json({ data: plant });
  } catch (error) {
    console.error('getPlantById error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
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
      return res.status(400).json({ message: 'id, name, and category are required' });
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
            message: `Dữ liệu của trường ${field} không đúng định dạng JSON hợp lệ. Chi tiết lỗi: ${e.message}. Bắt buộc phải là mảng hoặc đối tượng JSON hợp lệ.` 
          });
        }
      }
    }

    const userId = req.headers['x-user-id'] || req.query.user_id || 'mobile-user';
    const contributedPlant = await libraryPlantService.contributePlant(req.body, userId);
    return res.status(201).json({
      message: 'Gửi đề xuất cây mới thành công, đang chờ Admin kiểm duyệt.',
      data: contributedPlant
    });
  } catch (error) {
    console.error('contributePlant error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.checkExistence = async (req, res) => {
  try {
    const { name, scientificName } = req.query;
    if (!name && !scientificName) {
      return res.status(400).json({ message: 'At least name or scientificName is required' });
    }
    const result = await libraryPlantService.checkExistence({ name, scientificName });
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error('checkExistence error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

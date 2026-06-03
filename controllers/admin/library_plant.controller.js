const libraryPlantService = require('../../services/admin/library_plant.service');

exports.getPlants = async (req, res) => {
  try {
    const data = await libraryPlantService.getPlants(req.query);
    return res.status(200).json({ data });
  } catch (error) {
    console.error('getPlants error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getPlantById = async (req, res) => {
  try {
    const data = await libraryPlantService.getPlantById(req.params.id);
    return res.status(200).json({ data });
  } catch (error) {
    console.error('getPlantById error:', error);
    if (error.message === 'Plant not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.createPlant = async (req, res) => {
  try {
    if (!req.body.id || !req.body.name || !req.body.category) {
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

    const newPlant = await libraryPlantService.createPlant(req.body);
    return res.status(201).json({ data: newPlant });
  } catch (error) {
    console.error('createPlant error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.approvePlant = async (req, res) => {
  try {
    const approvedPlant = await libraryPlantService.approvePlant(req.params.id);
    return res.status(200).json({ message: 'Đã duyệt cây thành công', data: approvedPlant });
  } catch (error) {
    console.error('approvePlant error:', error);
    if (error.message === 'Plant not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(400).json({ message: error.message });
  }
};

exports.rejectPlant = async (req, res) => {
  try {
    const rejectedPlant = await libraryPlantService.rejectPlant(req.params.id);
    return res.status(200).json({ message: 'Đã từ chối cây đề xuất', data: rejectedPlant });
  } catch (error) {
    console.error('rejectPlant error:', error);
    if (error.message === 'Plant not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updatePlant = async (req, res) => {
  try {
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

    const updatedPlant = await libraryPlantService.updatePlant(req.params.id, req.body);
    return res.status(200).json({ data: updatedPlant });
  } catch (error) {
    console.error('updatePlant error:', error);
    if (error.message === 'Plant not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.deletePlant = async (req, res) => {
  try {
    await libraryPlantService.deletePlant(req.params.id);
    return res.status(200).json({ message: 'Plant deleted successfully' });
  } catch (error) {
    console.error('deletePlant error:', error);
    if (error.message === 'Plant not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.seedPlants = async (req, res) => {
  try {
    const seededPlants = await libraryPlantService.seedPlants();
    return res.status(200).json({ message: 'Seeded library plants successfully', count: seededPlants.length, data: seededPlants });
  } catch (error) {
    console.error('seedPlants error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

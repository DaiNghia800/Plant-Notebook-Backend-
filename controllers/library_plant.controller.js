const libraryPlantService = require('../services/library_plant.service');

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

exports.createPlant = async (req, res) => {
  try {
    if (!req.body.id || !req.body.name || !req.body.category) {
      return res.status(400).json({ message: 'id, name, and category are required' });
    }
    const newPlant = await libraryPlantService.createPlant(req.body);
    return res.status(201).json({ data: newPlant });
  } catch (error) {
    console.error('createPlant error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.contributePlant = async (req, res) => {
  try {
    if (!req.body.id || !req.body.name || !req.body.category) {
      return res.status(400).json({ message: 'id, name, and category are required' });
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

exports.approvePlant = async (req, res) => {
  try {
    const approvedPlant = await libraryPlantService.approvePlant(req.params.id);
    return res.status(200).json({ message: 'Đã duyệt cây thành công', data: approvedPlant });
  } catch (error) {
    console.error('approvePlant error:', error);
    if (error.message === 'Plant not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
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

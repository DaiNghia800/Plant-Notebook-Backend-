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

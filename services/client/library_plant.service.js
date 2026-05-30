const { LibraryPlant, Sequelize } = require('../../models');

class LibraryPlantClientService {
  async getAllPlants(filters = {}) {
    const where = {};
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.isTrending !== undefined) {
      where.isTrending = filters.isTrending === 'true' || filters.isTrending === true;
    }
    if (filters.isRare !== undefined) {
      where.isRare = filters.isRare === 'true' || filters.isRare === true;
    }
    if (filters.approvalStatus && filters.approvalStatus !== 'all') {
      where.approvalStatus = filters.approvalStatus;
    } else if (filters.approvalStatus !== 'all') {
      where.approvalStatus = 'approved'; // Mặc định chỉ lấy cây đã duyệt cho user thường
    }

    return await LibraryPlant.findAll({ where });
  }

  async getPlantById(id) {
    return await LibraryPlant.findByPk(id);
  }

  async contributePlant(data, userId) {
    const payload = {
      ...data,
      approvalStatus: 'pending',
      contributorId: userId || null
    };
    return await LibraryPlant.create(payload);
  }

  async checkExistence({ name, scientificName }) {
    const { Op } = require('sequelize');
    const conditions = [];

    if (scientificName && 
        scientificName.trim().toLowerCase() !== 'khong ro' && 
        scientificName.trim().toLowerCase() !== 'không rõ' &&
        scientificName.trim().toLowerCase() !== 'khongro') {
      conditions.push(
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('scientificName')),
          scientificName.trim().toLowerCase()
        )
      );
    }

    if (name && 
        name.trim().toLowerCase() !== 'chua xac dinh duoc loai cay' && 
        name.trim().toLowerCase() !== 'chưa xác định được loài cây') {
      conditions.push(
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('name')),
          name.trim().toLowerCase()
        )
      );
    }

    if (conditions.length === 0) {
      return { exists: false };
    }

    const plant = await LibraryPlant.findOne({
      where: {
        approvalStatus: {
          [Op.in]: ['approved', 'pending']
        },
        [Op.or]: conditions
      }
    });

    if (plant) {
      return { exists: true, plantId: plant.id, name: plant.name, approvalStatus: plant.approvalStatus };
    }

    return { exists: false };
  }
}

module.exports = new LibraryPlantClientService();

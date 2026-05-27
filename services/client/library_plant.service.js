const { LibraryPlant } = require('../../models');

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
}

module.exports = new LibraryPlantClientService();

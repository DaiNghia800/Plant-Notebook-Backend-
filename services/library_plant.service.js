const { LibraryPlant } = require('../models');
const { libraryPlantSeedData } = require('../seeds/library_plant.seed');

class LibraryPlantService {
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

  async createPlant(data) {
    return await LibraryPlant.create({ ...data, approvalStatus: 'approved' }); // Admin tạo trực tiếp là approved
  }

  async contributePlant(data, userId) {
    const payload = {
      ...data,
      approvalStatus: 'pending',
      contributorId: userId || null
    };
    return await LibraryPlant.create(payload);
  }

  async approvePlant(id) {
    const plant = await LibraryPlant.findByPk(id);
    if (!plant) {
      throw new Error('Plant not found');
    }
    return await plant.update({ approvalStatus: 'approved' });
  }

  async rejectPlant(id) {
    const plant = await LibraryPlant.findByPk(id);
    if (!plant) {
      throw new Error('Plant not found');
    }
    return await plant.update({ approvalStatus: 'rejected' });
  }

  async updatePlant(id, data) {
    const plant = await LibraryPlant.findByPk(id);
    if (!plant) {
      throw new Error('Plant not found');
    }
    return await plant.update(data);
  }

  async deletePlant(id) {
    const plant = await LibraryPlant.findByPk(id);
    if (!plant) {
      throw new Error('Plant not found');
    }
    await plant.destroy();
    return true;
  }

  async seedPlants() {
    const results = [];
    for (const item of libraryPlantSeedData) {
      const payload = { ...item, approvalStatus: 'approved' };
      const [plant, created] = await LibraryPlant.findOrCreate({
        where: { id: item.id },
        defaults: payload
      });
      if (!created) {
        await plant.update(payload);
      }
      results.push(plant);
    }
    return results;
  }
}

module.exports = new LibraryPlantService();

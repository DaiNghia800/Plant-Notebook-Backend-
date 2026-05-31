const { LibraryPlant } = require('../../models');
const { libraryPlantSeedData } = require('../../seeds/library_plant.seed');

class LibraryPlantAdminService {
  async createPlant(data) {
    return await LibraryPlant.create({ ...data, approvalStatus: 'approved' }); // Admin tạo trực tiếp là approved
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

module.exports = new LibraryPlantAdminService();

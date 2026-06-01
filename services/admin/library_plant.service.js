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
    const mapCategory = (rawCategory) => {
      if (!rawCategory) return "Trong nhà";
      const cat = rawCategory.trim().toLowerCase();
      if (cat.includes("trong nhà") || cat.includes("dương xỉ") || cat.includes("thủy sinh") || cat.includes("nước") || cat.includes("phong thủy")) {
        return "Trong nhà";
      }
      if (cat.includes("mọng nước") || cat.includes("xương rồng") || cat.includes("sen đá") || cat.includes("ban công")) {
        return "Ban công";
      }
      if (cat.includes("gia vị") || cat.includes("bonsai") || cat.includes("ngoài trời") || cat.includes("sân vườn") || cat.includes("thảo mộc")) {
        return "Ngoài trời";
      }
      return "Trong nhà"; // Mặc định
    };

    const results = [];
    for (const item of libraryPlantSeedData) {
      const payload = { 
        ...item, 
        category: mapCategory(item.category),
        approvalStatus: 'approved' 
      };
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

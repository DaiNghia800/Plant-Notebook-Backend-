const { LibraryPlant } = require('../../models');
const { libraryPlantSeedData } = require('../../seeds/library_plant.seed');
const { Op } = require('sequelize');

class LibraryPlantAdminService {
  async getPlants(query) {
    const { page = 1, limit = 10, search, category, approvalStatus } = query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    if (category) {
      where.category = category;
    }
    if (approvalStatus === 'history') {
      where.approvalStatus = { [Op.in]: ['approved', 'rejected'] };
      where.contributorId = { [Op.ne]: null };
    } else if (approvalStatus) {
      where.approvalStatus = approvalStatus;
    }

    const { count, rows } = await LibraryPlant.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['createdAt', 'DESC']]
    });

    const { db: firestoreDb } = require('../../config/firebase');
    const resolvedPlants = [];
    for (const row of rows) {
      const plant = row.toJSON();
      if (plant.contributorId) {
        try {
          const userDoc = await firestoreDb.collection('users').doc(plant.contributorId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            plant.contributor = {
              id: plant.contributorId,
              fullName: userData.fullName || userData.name || 'Người dùng',
              email: userData.email || ''
            };
          }
        } catch (err) {
          console.error(`Failed to fetch contributor ${plant.contributorId} from Firestore:`, err.message);
        }
      }
      resolvedPlants.push(plant);
    }

    return {
      totalItems: count,
      plants: resolvedPlants,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10)
    };
  }

  async getPlantById(id) {
    const plantRecord = await LibraryPlant.findByPk(id);
    if (!plantRecord) {
      throw new Error('Plant not found');
    }
    const plant = plantRecord.toJSON();
    if (plant.contributorId) {
      try {
        const { db: firestoreDb } = require('../../config/firebase');
        const userDoc = await firestoreDb.collection('users').doc(plant.contributorId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          plant.contributor = {
            id: plant.contributorId,
            fullName: userData.fullName || userData.name || 'Người dùng',
            email: userData.email || ''
          };
        }
      } catch (err) {
        console.error(`Failed to fetch contributor ${plant.contributorId} from Firestore:`, err.message);
      }
    }
    return plant;
  }

  async createPlant(data) {
    return await LibraryPlant.create({ ...data, approvalStatus: 'approved' }); // Admin tạo trực tiếp là approved
  }

  async approvePlant(id) {
    const plant = await LibraryPlant.findByPk(id);
    if (!plant) {
      throw new Error('Plant not found');
    }

    // Check if another plant with the same name or scientificName is already approved
    const { Op } = require('sequelize');
    const conditions = [];
    if (plant.scientificName && 
        plant.scientificName.trim().toLowerCase() !== 'khong ro' && 
        plant.scientificName.trim().toLowerCase() !== 'không rõ' &&
        plant.scientificName.trim().toLowerCase() !== 'khongro') {
      conditions.push({
        scientificName: { [Op.iLike]: plant.scientificName.trim() }
      });
    }
    if (plant.name) {
      conditions.push({
        name: { [Op.iLike]: plant.name.trim() }
      });
    }

    if (conditions.length > 0) {
      const existing = await LibraryPlant.findOne({
        where: {
          id: { [Op.ne]: id },
          approvalStatus: 'approved',
          [Op.or]: conditions
        }
      });
      if (existing) {
        throw new Error(`Cây này đã tồn tại trong thư viện chính thức dưới tên "${existing.name}".`);
      }
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

const db = require("../../models");
const { where } = require("sequelize");

module.exports.getMyGardenPlants = async (req, res) => {
  try {
    const { userId } = req.query;
    const whereClause = {};
    if (userId) {
      whereClause.userId = userId;
    }

    const gardenPlants = await db.GardenPlant.findAll({
      where: whereClause,
      include: [
        { model: db.Plant, attributes: ['name', 'imageUrl'] },
        { model: db.Reminder },
        { model: db.User },
        { model: db.Category },
      ]
    });

    return res.status(200).json({ success: true, data: gardenPlants });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports.getMyGardenPlantById = async (req, res) => {
  try {
    const { id } = req.params;
    const gardenPlant = await db.GardenPlant.findOne({
      where: { id: id },
      include: [
        { model: db.Plant, attributes: ['name', 'imageUrl'] },
        { model: db.Reminder },
        { model: db.User },
        { model: db.Category },
      ]
    });

    return res.status(200).json({ success: true, data: gardenPlant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports.createMyGardenPlant = async (req, res) => {
  try {
    const {
      plantId,
      plantName,
      categoryId,
      category,
      status,
      startDate,
      startedAt,
      wateringCycle,
      fertilizingCycle,
      isPushEnabled,
      userId,
    } = req.body;
    let imageUrl = req.body.imageUrl || null;

    // Find category by id first, then by name.
    let categoryRecord = null;
    if (categoryId) {
      categoryRecord = await db.Category.findByPk(categoryId);
    }
    if (!categoryRecord && category) {
      categoryRecord = await db.Category.findOne({ where: { name: category } });
    }
    if (!categoryRecord) {
      return res.status(400).json({ success: false, message: 'Category not found' });
    }

    // Create or reuse plant record.
    let plantRecord = null;
    if (plantName) {
      const plant = await db.Plant.findOne({ where: { name: plantName } });
      if (plant) {
        return res.status(400).json({ success: false, message: 'Plant name already exists.' });
      } else {
        plantRecord = await db.Plant.create({
          name: plantName,
          description: '',
          imageUrl,
        });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Plant name is required' });
    }

    const gardenPlant = await db.GardenPlant.create({
      userId,
      plantId: plantRecord.id,
      categoryId: categoryRecord.id,
      status,
      startedAt: new Date(startDate || startedAt),
      imageUrl,
    });

    const startedAtDate = new Date(startDate || startedAt);
    const parsedWatering = parseFloat(String(wateringCycle));
    const parsedFertilizing = parseFloat(String(fertilizingCycle));
    const pushEnabled = String(isPushEnabled).toLowerCase() === 'true';

    const reminders = [];
    if (!Number.isNaN(parsedWatering) && parsedWatering > 0) {
      reminders.push({
        gardenPlantId: gardenPlant.id,
        type: 'Tưới nước',
        frequencyDays: parsedWatering,
        lastActionAt: startedAtDate,
        isPushEnabled: pushEnabled,
      });
    }
    if (!Number.isNaN(parsedFertilizing) && parsedFertilizing > 0) {
      reminders.push({
        gardenPlantId: gardenPlant.id,
        type: 'Bón phân',
        frequencyDays: parsedFertilizing,
        lastActionAt: startedAtDate,
        isPushEnabled: pushEnabled,
      });
    }
    await db.Reminder.bulkCreate(reminders);

    const createdPlant = await db.GardenPlant.findByPk(gardenPlant.id, {
      include: [
        { model: db.Plant, attributes: ['name', 'imageUrl'] },
        { model: db.Reminder },
        { model: db.User },
        { model: db.Category },
      ]
    });

    return res.status(201).json({ success: true, data: createdPlant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports.getPlantCategory = async (req, res) => {
  try {
    const category = await db.Category.findAll();

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports.createOrUpdateReminders = async (req, res) => {
  try {
    const { gardenPlantId, wateringCycleDays, fertilizingCycleDays, isPushEnabled } = req.body;

    if (!gardenPlantId) {
      return res.status(400).json({ success: false, message: 'gardenPlantId is required' });
    }

    // Delete existing reminders for this plant
    await db.Reminder.destroy({ where: { gardenPlantId } });

    const reminders = [];
    if (wateringCycleDays && wateringCycleDays > 0) {
      reminders.push({
        gardenPlantId,
        type: 'Tưới nước',
        frequencyDays: wateringCycleDays,
        lastActionAt: new Date(),
        isPushEnabled: !!isPushEnabled,
      });
    }
    if (fertilizingCycleDays && fertilizingCycleDays > 0) {
      reminders.push({
        gardenPlantId,
        type: 'Bón phân',
        frequencyDays: fertilizingCycleDays,
        lastActionAt: new Date(),
        isPushEnabled: !!isPushEnabled,
      });
    }

    await db.Reminder.bulkCreate(reminders);

    return res.status(201).json({ success: true, data: reminders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports.updateMyGardenPlant = async (req, res) => {
  try {
    const { id } = req.params;
    const gardenPlant = await db.GardenPlant.findByPk(id);
    if (!gardenPlant) {
      return res.status(404).json({ success: false, message: 'Garden plant not found' });
    }

    console.log(req.body)

    const {
      plantId,
      plantName,
      categoryId,
      status,
      startedAt,
      startDate,
      wateringCycleDays,
      fertilizingCycleDays,
      isPushEnabled,
      reminderSetting,
    } = req.body;
    let plantRecord = null;
    if (plantId) {
      const plant = await db.Plant.findByPk(plantId);
      if (plant) {
        plant.name = plantName;
        plant.save();
      } else {
        return res.status(400).json({ success: false, message: 'Plant is not found' });
      }
    }

    let categoryRecord = null;
    if (categoryId) {
      categoryRecord = await db.Category.findByPk(categoryId);
    }
    if (!categoryRecord) {
      return res.status(400).json({ success: false, message: 'Category not found' });
    }

    if (req.body.imageUrl) {
      gardenPlant.imageUrl = req.body.imageUrl;
      const plantRecord = await db.Plant.findByPk(gardenPlant.plantId);
      if (plantRecord) {
        plantRecord.imageUrl = req.body.imageUrl;
        await plantRecord.save();
      }
    }

    if (status) {
      gardenPlant.status = status;
    }

    if (categoryRecord) {
      gardenPlant.categoryId = categoryId;
    }
    const startedAtValue = startedAt || startDate;
    if (startedAtValue) {
      gardenPlant.startedAt = new Date(startedAtValue);
    }
    await gardenPlant.save();

    const wateringDays = Number(
      wateringCycleDays ?? reminderSetting?.frequencyDays ?? 0,
    );
    const fertilizingDays = Number(fertilizingCycleDays ?? 0);
    const pushEnabled = Boolean(
      isPushEnabled ?? reminderSetting?.isPushEnabled ?? true,
    );

    await db.Reminder.destroy({ where: { gardenPlantId: gardenPlant.id } });
    const reminders = [];
    if (!Number.isNaN(wateringDays) && wateringDays > 0) {
      reminders.push({
        gardenPlantId: gardenPlant.id,
        type: 'Tưới nước',
        frequencyDays: wateringDays,
        lastActionAt: new Date(),
        isPushEnabled: pushEnabled,
      });
    }
    if (!Number.isNaN(fertilizingDays) && fertilizingDays > 0) {
      reminders.push({
        gardenPlantId: gardenPlant.id,
        type: 'Bón phân',
        frequencyDays: fertilizingDays,
        lastActionAt: new Date(),
        isPushEnabled: pushEnabled,
      });
    }
    if (reminders.length > 0) {
      await db.Reminder.bulkCreate(reminders);
    }

    const updatedPlant = await db.GardenPlant.findByPk(gardenPlant.id, {
      include: [
        { model: db.Plant, attributes: ['name', 'imageUrl'] },
        { model: db.Reminder },
        { model: db.User },
        { model: db.Category },
      ],
    });

    return res.status(200).json({ success: true, data: updatedPlant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.deleteMyGardenPlant = async (req, res) => {
  try {
    const { id } = req.params;
    const gardenPlant = await db.GardenPlant.findByPk(id);
    if (!gardenPlant) {
      return res.status(404).json({ success: false, message: 'Garden plant not found' });
    }
    await db.Reminder.destroy({ where: { gardenPlantId: gardenPlant.id } });
    await gardenPlant.destroy();
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getCareHistory = async (req, res) => {
  try {
    const { gardenPlantId } = req.params;
    const careHistory = await db.CareHistory.findAll({
      where: { gardenPlantId },
      order: [['performedAt', 'DESC']],
      limit: 5
    });

    return res.status(200).json({ success: true, data: careHistory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.createCareHistory = async (req, res) => {
  try {
    console.log(req.body)
    const { gardenPlantId, type, actionDate, notes } = req.body;

    // Validate garden plant exists
    const gardenPlant = await db.GardenPlant.findByPk(gardenPlantId);
    if (!gardenPlant) {
      return res.status(404).json({ success: false, message: 'Garden plant not found' });
    }

    const actionType = type === 'watering' ? 'Tưới nước' : 'Bón phân';
    const careAction = await db.CareHistory.create({
      gardenPlantId,
      actionType: actionType,
      performedAt: actionDate ? new Date(actionDate) : new Date(),
    });

    const reminder = await db.Reminder.findOne({ where: { gardenPlantId: gardenPlantId, type: actionType } });
    console.log(reminder)
    if (reminder) {
      reminder.lastActionAt = actionDate ? new Date(actionDate) : new Date();
      await reminder.save();
    }

    if (actionType === 'Tưới nước') {
      if (gardenPlant.status === 'Đang khát' || gardenPlant.status === 'thirsty') {
        gardenPlant.status = 'Khỏe mạnh';
        await gardenPlant.save();
      }
    }

    return res.status(201).json({ success: true, data: careAction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

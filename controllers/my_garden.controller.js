const db = require("../config/firebase");

const GARDEN_COLLECTION = "my_garden_plants";
const CATALOG_COLLECTION = "plants_catalog";
const DEFAULT_USER_ID = "demo-user";
const DEFAULT_CATALOG = [
  {
    id: "monstera",
    name: "Monstera",
    latin_name: "Monstera deliciosa",
    image_url:
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
    category: "indoor",
  },
  {
    id: "snake-plant",
    name: "Snake Plant",
    latin_name: "Sansevieria trifasciata",
    image_url:
      "https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=1200&q=80",
    category: "indoor",
  },
  {
    id: "peace-lily",
    name: "Peace Lily",
    latin_name: "Spathiphyllum",
    image_url:
      "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1200&q=80",
    category: "balcony",
  },
];

const readUserId = (req) =>
  req.headers["x-user-id"] || req.query.user_id || DEFAULT_USER_ID;

const buildProfilePayload = (body, userId) => {
  const reminder = body.reminder_setting || {};
  return {
    plant_id: body.plant_id || "",
    name: body.name || "",
    latin_name: body.latin_name || "",
    nickname: body.nickname || "",
    image_url: body.image_url || "",
    photo_path: body.photo_path || "",
    status: body.status || "healthy",
    category: body.category || "indoor",
    start_date: body.start_date || new Date().toISOString(),
    reminder_setting: {
      watering_cycle_days: Number(reminder.watering_cycle_days || 3),
      fertilizing_cycle_days: Number(reminder.fertilizing_cycle_days || 14),
      push_notification_enabled: Boolean(reminder.push_notification_enabled),
    },
    user_id: userId,
  };
};

exports.getMyGardenPlants = async (req, res) => {
  try {
    const userId = readUserId(req);
    const snapshot = await db
      .collection(GARDEN_COLLECTION)
      .where("user_id", "==", userId)
      .get();

    const data = snapshot.docs.map((doc) => ({ ...doc.data() }));

    return res.status(200).json({ data });
  } catch (error) {
    console.error("getMyGardenPlants error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPlantCatalog = async (_req, res) => {
  try {
    const snapshot = await db.collection(CATALOG_COLLECTION).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({ data });
  } catch (error) {
    console.error("getPlantCatalog error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.seedPlantCatalog = async (_req, res) => {
  try {
    const batch = db.batch();
    DEFAULT_CATALOG.forEach((plant) => {
      const ref = db.collection(CATALOG_COLLECTION).doc(plant.id);
      batch.set(ref, {
        name: plant.name,
        latin_name: plant.latin_name,
        image_url: plant.image_url,
        category: plant.category,
      });
    });
    await batch.commit();
    return res.status(200).json({ message: "Catalog seeded" });
  } catch (error) {
    console.error("seedPlantCatalog error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createMyGardenPlant = async (req, res) => {
  try {
    const userId = readUserId(req);
    const profile = buildProfilePayload(req.body, userId);
    if (!profile.plant_id) {
      return res.status(400).json({ message: "plant_id is required" });
    }

    const docRef = await db.collection(GARDEN_COLLECTION).add({
      ...profile,
      created_at: admin.firestore.FieldValue.serverTimestamp(), 
      updated_at: admin.firestore.FieldValue.serverTimestamp(), // Firebase tự điền giờ cập nhật
    });
    return res.status(201).json({id: docRef.id, data: profile });
  } catch (error) {
    console.error("createMyGardenPlant error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateMyGardenPlant = async (req, res) => {
  try {
    const plantDocId = req.params.id;
    const userId = readUserId(req);

    const docRef = db.collection(GARDEN_COLLECTION).doc(plantDocId);
    
    const doc = await docRef.get();
    if (!doc.exists || doc.data().user_id !== userId) {
      return res.status(404).json({ message: "Không tìm thấy cây hoặc bạn không có quyền" });
    }

    await docRef.update({
      ...req.body, 
      updated_at: admin.firestore.FieldValue.serverTimestamp() 
    });

    return res.status(200).json({ message: "Đã cập nhật" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

exports.deleteMyGardenPlant = async (req, res) => {
  try {
    const userId = readUserId(req);
    const plantId = req.params.id;
    const docRef = db.collection(GARDEN_COLLECTION).doc(toDocId(userId, plantId));
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Plant profile not found" });
    }

    await docRef.delete();
    return res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.error("deleteMyGardenPlant error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

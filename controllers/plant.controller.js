const MyGarden = require("../models/myGarden.model");

// ==================== MY GARDEN (VƯỜN CỦA TÔI / CHI TIẾT CÂY) ====================

// 1. Lấy danh sách cây trong vườn của người dùng hiện tại
exports.getMyGarden = async (req, res) => {
  try {
    const userId = req.user.id;
    const gardenItems = await MyGarden.findAll({
      where: { userId },
    });
    return res.json(gardenItems);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 2. Thêm một cây trồng vào vườn cá nhân
exports.addMyGardenItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { libraryPlantId, nickname, wateringFrequencyLabel } = req.body;

    if (!libraryPlantId) {
      return res.status(400).json({ message: "Thiếu libraryPlantId" });
    }

    // Tạo cây mới trong vườn (Nhận trực tiếp libraryPlantId từ backend kia gửi sang)
    const newGardenItem = await MyGarden.create({
      userId,
      libraryPlantId,
      nickname: nickname || "Cây của tôi",
      healthStatus: "Khỏe mạnh",
      wateringFrequencyLabel: wateringFrequencyLabel || "2 times/week",
      lastWateredLabel: "Chưa tưới",
      careLogs: [],
      growthTimeline: [],
    });

    return res.status(201).json({
      message: "Thêm cây vào vườn thành công",
      gardenItem: newGardenItem,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 3. Lấy chi tiết cây trong vườn (Phục vụ màn hình "Chi tiết cây" - Plant Detail)
exports.getMyGardenItemDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const gardenItem = await MyGarden.findOne({
      where: { id: req.params.id, userId },
    });

    if (!gardenItem) {
      return res.status(404).json({ message: "Không tìm thấy cây trồng này trong vườn của bạn" });
    }

    return res.json(gardenItem);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 4. Hành động "Đã tưới nước" (Nút xanh trên UI)
exports.waterPlant = async (req, res) => {
  try {
    const userId = req.user.id;
    const gardenItem = await MyGarden.findOne({
      where: { id: req.params.id, userId },
    });

    if (!gardenItem) {
      return res.status(404).json({ message: "Không tìm thấy cây này trong vườn" });
    }

    // Lấy thời gian hiện tại
    const now = new Date();
    const timeLabel = now.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
    const dateLabel = "Hôm nay";

    // Tạo entry mới cho careLogs khớp cấu trúc PlantCareLogEntry ở Flutter
    const newLog = {
      title: "Đã tưới nước",
      timeLabel: `${dateLabel} • ${timeLabel}`,
      note: "Đã tưới nước bằng vòi phun sương",
      iconCodePoint: 58245, // Biểu tượng giọt nước
      iconFontFamily: "MaterialIcons",
      iconFontPackage: null,
      accentColorValue: 4278190080,
    };

    // Thêm vào đầu lịch sử
    const updatedCareLogs = [newLog, ...gardenItem.careLogs];

    // Cập nhật lại trạng thái
    gardenItem.careLogs = updatedCareLogs;
    gardenItem.lastWateredLabel = "Vừa xong";
    await gardenItem.save();

    return res.json({
      message: "Đã ghi nhận tưới nước thành công",
      gardenItem,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 5. Chỉnh sửa thông tin cây (nickname, trạng thái sức khỏe)
exports.updateMyGardenItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, healthStatus } = req.body;

    const gardenItem = await MyGarden.findOne({
      where: { id: req.params.id, userId },
    });

    if (!gardenItem) {
      return res.status(404).json({ message: "Không tìm thấy cây trong vườn" });
    }

    if (nickname) gardenItem.nickname = nickname;
    if (healthStatus) gardenItem.healthStatus = healthStatus;

    await gardenItem.save();

    return res.json({
      message: "Cập nhật thông tin thành công",
      gardenItem,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

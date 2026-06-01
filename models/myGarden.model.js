const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user.model");

const MyGarden = sequelize.define("MyGarden", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  libraryPlantId: {
    type: DataTypes.STRING, // Lưu ID cây mẫu từ backend kia dưới dạng chuỗi thông thường
    allowNull: false,
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  healthStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  wateringFrequencyLabel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastWateredLabel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  careLogs: {
    type: DataTypes.JSONB, // Mảng lịch sử chăm sóc
    defaultValue: [],
  },
  growthTimeline: {
    type: DataTypes.JSONB, // Mảng hình ảnh quá trình sinh trưởng
    defaultValue: [],
  },
});

// Thiết lập mối quan hệ chỉ với User
MyGarden.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
User.hasMany(MyGarden, { foreignKey: "userId" });

module.exports = MyGarden;

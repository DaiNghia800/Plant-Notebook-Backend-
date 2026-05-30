const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "plant_notebook",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "your_password",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false, // Bật console.log nếu muốn xem các câu lệnh SQL
    define: {
      timestamps: true,
    },
  }
);

module.exports = sequelize;

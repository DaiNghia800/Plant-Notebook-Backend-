const express = require("express");
require("dotenv").config();
const route = require("./routes/index.route");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const sequelize = require("./config/database");

// Import models để đảm bảo các bảng được đăng ký
require("./models/user.model");
require("./models/libraryPlant.model");
require("./models/myGarden.model");

const app = express();
const port = process.env.PORT || 5000;

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

route(app);

sequelize.sync({ force: false }) // Tự động tạo bảng nếu chưa có, không xóa dữ liệu cũ
  .then(() => {
    console.log("Database PostgreSQL synchronized successfully.");
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
      console.log(`Swagger: http://localhost:${port}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect or sync database:", err);
  });
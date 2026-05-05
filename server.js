const express = require("express");
require("dotenv").config();
const route = require("./routes/index.route");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { connectDB } = require("./config/database");

const app = express();
const port = process.env.PORT;

connectDB();

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log(`Swagger: http://localhost:${port}/api-docs`);
})
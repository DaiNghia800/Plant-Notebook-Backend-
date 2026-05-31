const express = require("express");
require("dotenv").config();
const cors = require("cors")
const routeClient = require("./routes/client/index.route");
const routeAdmin = require("./routes/admin/index.route");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { connectDB } = require("./config/database");
const { initReminderJob } = require('./jobs/reminder.job');

const app = express();
const port = process.env.PORT;

connectDB();
initReminderJob();
// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["POST", "GET", "PUT", "DELETE"]
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routeClient(app);
routeAdmin(app);

app.listen(port, "0.0.0.0", () => {
  console.log(`App listening on port ${port}`);
  console.log(`Swagger: http://localhost:${port}/api-docs`);
});
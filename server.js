const express = require("express");
const cors = require("cors");
require("dotenv").config();
const routeClient = require("./routes/client/index.route");
const routeAdmin = require("./routes/admin/index.route");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { connectDB } = require("./config/database");
const { initReminderJob } = require('./jobs/reminder.job');

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

connectDB();
initReminderJob();
// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["POST", "GET", "PUT", "DELETE"]
}))

app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const morgan = require('morgan');
const logger = require('./utils/logger');

// Morgan logging using Winston
app.use(morgan('combined', { stream: logger.stream }));

routeClient(app);
routeAdmin(app);

app.listen(port, "0.0.0.0", () => {
  console.log(`App listening on port ${port}`);
  console.log(`Swagger: http://localhost:${port}/api-docs`);
});

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
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.startsWith("http://localhost:");
    if (isAllowed) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true
}));

connectDB();

initReminderJob();
// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



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

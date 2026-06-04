'use strict';
const authRoute = require("./auth.route");
const libraryPlantRoute = require("./library_plant.route");
const geminiKeysRoute = require("./gemini_key.route");
const usersRoute = require("./users.route");
const dashboardRoute = require("./dashboard.route");
const logsRoute = require("./logs.route");
const rolesRoute = require("./roles.route");
const permissionsRoute = require("./permissions.route");
const adminRateLimiter = require("../../middlewares/adminRateLimiter");
const auditMiddleware = require("../../middlewares/audit.middleware");
const systemConfig = require("../../config/system");
const categoryRoute = require("./category.route");

module.exports = (app) => {
  const PATH_ADMIN = `/${systemConfig.prefixAdmin}`;

  // Global admin rate limiter
  app.use(PATH_ADMIN, adminRateLimiter);
  // Audit every non‑GET admin action after auth (auth is inside each sub‑router)
  app.use(PATH_ADMIN, auditMiddleware);

  app.use(`${PATH_ADMIN}/auth`, authRoute);
  app.use(`${PATH_ADMIN}/library-plants`, libraryPlantRoute);
  app.use(`${PATH_ADMIN}/gemini-keys`, geminiKeysRoute);
  app.use(`${PATH_ADMIN}/users`, usersRoute);
  app.use(`${PATH_ADMIN}/dashboard`, dashboardRoute);
  app.use(`${PATH_ADMIN}/logs`, logsRoute);
  app.use(`${PATH_ADMIN}/roles`, rolesRoute);
  app.use(`${PATH_ADMIN}/permissions`, permissionsRoute);
  app.use(`${PATH_ADMIN}/categories`, categoryRoute);
};
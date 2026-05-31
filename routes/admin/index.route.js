const authRoute = require("./auth.route");
const systemConfig = require("../../config/system");
const libraryPlantRoute = require("./library_plant.route");
const geminiKeysRoute = require("./gemini_key.route");


module.exports = (app) => {
  const PATH_ADMIN = `/${systemConfig.prefixAdmin}`;

  app.use(`${PATH_ADMIN}/auth`, authRoute);
  app.use(`${PATH_ADMIN}/library-plants`, libraryPlantRoute);
  app.use(`${PATH_ADMIN}/gemini-keys`, geminiKeysRoute);
};
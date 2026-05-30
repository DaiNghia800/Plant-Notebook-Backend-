const authRoute = require('./auth.route');
const plantRoute = require('./plant.route');

module.exports = (app) => {
  app.use("/auth", authRoute);
  app.use("/plants", plantRoute);
}
const authRoute = require('./auth.route');
const myGardenRoute = require("./my_garden.route");
const userRoute = require("./user.route")

module.exports = (app) => {
  app.use("/auth", authRoute);
  app.use("/my-garden", myGardenRoute);
  app.use("/user", userRoute)
};
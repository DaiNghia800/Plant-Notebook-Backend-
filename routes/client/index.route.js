const authRoute = require('./auth.route');
const myGardenRoute = require("./my_garden.route");
const userRoute = require("./user.route");
const storeRoute = require("./store.route");
const libraryPlantRoute = require("./library_plant.route");
module.exports = (app) => {
  app.use("/auth", authRoute);
  app.use("/my-garden", myGardenRoute);
  app.use("/user", userRoute);
  app.use("/store", storeRoute);
  app.use("/library-plants", libraryPlantRoute);
};

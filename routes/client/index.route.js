const express = require('express');
const router = express.Router();

const authRoute = require('./auth.route');
const myGardenRoute = require("./my_garden.route");
const userRoute = require("./user.route");
const libraryPlantRoute = require("./library_plant.route");

router.use("/auth", authRoute);
router.use("/my-garden", myGardenRoute);
router.use("/user", userRoute);
router.use("/library-plants", libraryPlantRoute);

module.exports = router;

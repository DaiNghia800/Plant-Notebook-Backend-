const express = require('express');
const router = express.Router();

const libraryPlantRoute = require("./library_plant.route");

router.use("/library-plants", libraryPlantRoute);

module.exports = router;

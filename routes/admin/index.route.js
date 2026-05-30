const express = require('express');
const router = express.Router();

const libraryPlantRoute = require("./library_plant.route");
const geminiKeysRoute = require("./gemini_key.route");

router.use("/library-plants", libraryPlantRoute);
router.use("/gemini-keys", geminiKeysRoute);

module.exports = router;

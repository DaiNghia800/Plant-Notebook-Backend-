const express = require("express");
const router = express.Router();
const controller = require("../controllers/my_garden.controller");
const uploadCloudinary = require("../middlewares/uploadCloudinary");

/**
 * @swagger
 * /my-garden/plants:
 *   get:
 *     summary: Get my garden plant profiles
 *     tags: [MyGarden]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/plants", controller.getMyGardenPlants);

/**
 * @swagger
 * /my-garden/catalog:
 *   get:
 *     summary: Get plant catalog
 *     tags: [MyGarden]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/catalog", controller.getPlantCatalog);
router.post("/catalog/seed", controller.seedPlantCatalog);

/**
 * @swagger
 * /my-garden/plants:
 *   post:
 *     summary: Create plant profile
 *     tags: [MyGarden]
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/plants", uploadCloudinary.singleImage, uploadCloudinary.uploadToCloudinary, controller.createMyGardenPlant);

/**
 * @swagger
 * /my-garden/plants/{id}:
 *   put:
 *     summary: Update plant profile
 *     tags: [MyGarden]
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/plants/:id", uploadCloudinary.singleImage, uploadCloudinary.uploadToCloudinary, controller.updateMyGardenPlant);

/**
 * @swagger
 * /my-garden/plants/{id}:
 *   delete:
 *     summary: Delete plant profile
 *     tags: [MyGarden]
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete("/plants/:id", controller.deleteMyGardenPlant);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("../controllers/my_garden.controller");
const imageUpload = require("../middlewares/imageUpload.middleware");

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
 * /my-garden/plants/:id:
 *   get:
 *     summary: Get my garden plant profiles
 *     tags: [MyGarden]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/plants/:id", controller.getMyGardenPlantById);

/**
 * @swagger
 * /my-garden/plants:
 *   post:
 *     summary: Create a new plant profile in my garden
 *     tags: [MyGarden]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên của cây
 *                 example: Cây Lưỡi Hổ
 *               type:
 *                 type: string
 *                 description: Loại cây
 *                 example: Cây mọng nước
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh của cây
 *     responses:
 *       201:
 *         description: Created successfully
 *       400:
 *         description: Bad request
 */
router.post("/plants", imageUpload.upload, controller.createMyGardenPlant);

/**
 * @swagger
 * /my-garden/category:
 *   get:
 *     summary: Get plant category
 *     tags: [MyGarden]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/category", controller.getPlantCategory);

/**
 * @swagger
 * /my-garden/reminders:
 *   post:
 *     summary: Tạo hoặc cập nhật reminder cho cây
 *     tags: [MyGarden]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gardenPlantId:
 *                 type: string
 *               wateringCycleDays:
 *                 type: integer
 *               fertilizingCycleDays:
 *                 type: integer
 *               isPushEnabled:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Reminder tạo thành công
 */
router.post("/reminders", controller.createOrUpdateReminders);
// router.post("/category/seed", controller.seedPlantCatalog);

// /**
//  * @swagger
//  * /my-garden/plants:
//  *   post:
//  *     summary: Create plant profile
//  *     tags: [MyGarden]
//  *     responses:
//  *       201:
//  *         description: Created
//  */
// router.post("/plants", controller.createMyGardenPlant);

// /**
//  * @swagger
//  * /my-garden/plants/{id}:
//  *   put:
//  *     summary: Update plant profile
//  *     tags: [MyGarden]
//  *     responses:
//  *       200:
//  *         description: Updated
//  */
router.put("/plants/:id", imageUpload.upload, controller.updateMyGardenPlant);

// /**
//  * @swagger
//  * /my-garden/plants/{id}:
//  *   delete:
//  *     summary: Delete plant profile
//  *     tags: [MyGarden]
//  *     responses:
//  *       200:
//  *         description: Deleted
//  */
router.delete("/plants/:id", controller.deleteMyGardenPlant);

/**
 * @swagger
 * /my-garden/plants/{gardenPlantId}/care-history:
 *   get:
 *     summary: Get care history for a plant
 *     tags: [MyGarden]
 *     parameters:
 *       - in: path
 *         name: gardenPlantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/plants/:gardenPlantId/care-history", controller.getCareHistory);

/**
 * @swagger
 * /my-garden/care-history:
 *   post:
 *     summary: Record a care action (watering or fertilizing)
 *     tags: [MyGarden]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gardenPlantId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [watering, fertilizing]
 *               actionDate:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/care-history", controller.createCareHistory);

module.exports = router;

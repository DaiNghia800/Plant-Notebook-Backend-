const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/my_garden.controller");
const uploadS3 = require("../../middlewares/uploadS3");

/**
 * @swagger
 * /my-garden/plants:
 *   get:
 *     summary: Xem hồ sơ cây trồng trong vườn của tôi
 *     tags: [MyGarden]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID of the user to filter plant profiles
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/plants", controller.getMyGardenPlants);

/**
 * @swagger
 * /my-garden/plants/{id}:
 *   get:
 *     summary: Tìm kiếm thông tin chi tiết về loại cây trồng trong vườn theo ID.
 *     tags: [MyGarden]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the garden plant profile
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Plant not found
 */
router.get("/plants/:id", controller.getMyGardenPlantById);

/**
 * @swagger
 * /my-garden/plants:
 *   post:
 *     summary: Thêm cây mới vào vườn
 *     tags: [MyGarden]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - plantName
 *               - categoryId
 *               - userId
 *             properties:
 *               plantId:
 *                 type: string
 *                 description: ID of the plant template (optional)
 *               plantName:
 *                 type: string
 *                 description: Name of the plant
 *                 example: Cây Lưỡi Hổ
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *               category:
 *                 type: string
 *                 description: Category name (fallback if categoryId is not resolved)
 *               status:
 *                 type: string
 *                 description: Plant health status
 *                 example: Khỏe mạnh
 *               startDate:
 *                 type: string
 *                 description: Start date of cultivation
 *               startedAt:
 *                 type: string
 *                 description: Start date (alternative key)
 *               wateringCycle:
 *                 type: number
 *                 description: Watering frequency in days
 *               fertilizingCycle:
 *                 type: number
 *                 description: Fertilizing frequency in days
 *               isPushEnabled:
 *                 type: boolean
 *                 description: Enable push reminders
 *               userId:
 *                 type: string
 *                 description: Owner User ID
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File image upload
 *     responses:
 *       201:
 *         description: Created successfully
 *       400:
 *         description: Bad request
 */
router.post("/plants", uploadS3.singleImage, uploadS3.uploadToS3, controller.createMyGardenPlant);

/**
 * @swagger
 * /my-garden/category:
 *   get:
 *     summary: Lấy danh sách các loại cây trồng
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
 *     summary: Tạo hoặc cập nhật cài đặt nhắc nhở cho cây
 *     tags: [MyGarden]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gardenPlantId
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
 *         description: Reminders created/updated successfully
 */
router.post("/reminders", controller.createOrUpdateReminders);

/**
 * @swagger
 * /my-garden/plants/{id}:
 *   put:
 *     summary: Cập nhật thông tin chi tiết về hồ sơ cây trồng trong vườn.
 *     tags: [MyGarden]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the garden plant profile to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               plantId:
 *                 type: string
 *               plantName:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               status:
 *                 type: string
 *               startedAt:
 *                 type: string
 *               startDate:
 *                 type: string
 *               wateringCycleDays:
 *                 type: integer
 *               fertilizingCycleDays:
 *                 type: integer
 *               isPushEnabled:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */
router.put("/plants/:id", uploadS3.singleImage, uploadS3.uploadToS3, controller.updateMyGardenPlant);

/**
 * @swagger
 * /my-garden/plants/{id}:
 *   delete:
 *     summary: Xóa hồ sơ cây trồng trong vườn
 *     tags: [MyGarden]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the garden plant profile to delete
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 */
router.delete("/plants/:id", controller.deleteMyGardenPlant);

/**
 * @swagger
 * /my-garden/plants/{gardenPlantId}/care-history:
 *   get:
 *     summary: Lấy lịch sử chăm sóc cho một cây trồng
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
 *     summary: Ghi lại một hành động chăm sóc (tưới nước hoặc bón phân)
 *     tags: [MyGarden]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gardenPlantId
 *               - type
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
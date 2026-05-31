const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/store.controller");

/**
 * @swagger
 * /store:
 *   get:
 *     summary: Get list of all stores and nurseries
 *     tags: [Store]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter stores by type ("Tất cả", "Vườn ươm", "Cửa hàng")
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", controller.getStores);

/**
 * @swagger
 * /store/{id}:
 *   get:
 *     summary: Get details of a single store and its reviews
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id", controller.getStoreById);

/**
 * @swagger
 * /store/{id}/reviews:
 *   post:
 *     summary: Submit a new review/rating for a store
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Cây đẹp và nhân viên thân thiện"
 *               userId:
 *                 type: string
 *                 example: "uuid-of-user"
 *     responses:
 *       201:
 *         description: Created successfully
 */
router.post("/:id/reviews", controller.createReview);

/**
 * @swagger
 * /store/seed:
 *   post:
 *     summary: Seed dummy store and nursery data with reviews
 *     tags: [Store]
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/seed", controller.seedStores);

module.exports = router;

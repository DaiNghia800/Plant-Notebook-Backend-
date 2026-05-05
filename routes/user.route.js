const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");

/**
 * @swagger
 * /user/all:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Trả về danh sách người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   firstName:
 *                     type: string
 *                     example: "A"
 *                   lastName:
 *                     type: string
 *                     example: "Van A"
 *                   email:
 *                     type: string
 *                     example: "vana@example.com"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/all", controller.getUsers);

module.exports = router;
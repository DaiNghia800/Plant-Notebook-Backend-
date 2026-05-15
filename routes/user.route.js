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

/**
 * @swagger
 * /user/update-fcm-token:
 *   post:
 *     summary: Cập nhật FCM token cho người dùng
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "b4d41cb9-d751-4e2d-9c85-a8dc3f0063ec"
 *               fcmToken:
 *                 type: string
 *                 example: "fcm_token_here"
 *     responses:
 *       200:
 *         description: FCM token cập nhật thành công
 *       404:
 *         description: Người dùng không tìm thấy
 *       500:
 *         description: Lỗi server
 */
router.post("/update-fcm-token", controller.updateFcmToken);

/**
 * @swagger
 * /user/send-test-notification:
 *   post:
 *     summary: Gửi thông báo thử nghiệm đến user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "b4d41cb9-d751-4e2d-9c85-a8dc3f0063ec"
 *     responses:
 *       200:
 *         description: Thông báo thử nghiệm gửi thành công
 *       404:
 *         description: User hoặc FCM token không tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post("/send-test-notification", controller.sendTestNotification);

module.exports = router;
const express = require("express");
const router = express.Router();
const controller = require("../controllers/plant.controller");
const authMiddleware = require("../middleware/auth.middleware");

// ==================== MY GARDEN / PLANT DETAIL (YÊU CẦU ĐĂNG NHẬP) ====================

/**
 * @swagger
 * /plants/garden:
 *   get:
 *     summary: Lấy danh sách cây trồng trong vườn cá nhân của User
 *     tags: [MyGarden]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách cây trong vườn
 *       401:
 *         description: Chưa đăng nhập hoặc token sai
 *       500:
 *         description: Lỗi server
 */
router.get("/garden", authMiddleware, controller.getMyGarden);

/**
 * @swagger
 * /plants/garden:
 *   post:
 *     summary: Thêm một cây trồng mẫu vào vườn cá nhân
 *     tags: [MyGarden]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - libraryPlantId
 *             properties:
 *               libraryPlantId:
 *                 type: string
 *                 description: ID của cây lấy từ backend danh mục (thư viện cây) của bạn
 *                 example: a0e829c6-6967-4a0b-9b48-18e3a2414167
 *               nickname:
 *                 type: string
 *                 example: Bà Bà
 *               wateringFrequencyLabel:
 *                 type: string
 *                 example: 2 times/week
 *     responses:
 *       201:
 *         description: Thêm thành công
 *       401:
 *         description: Chưa xác thực
 *       500:
 *         description: Lỗi server
 */
router.post("/garden", authMiddleware, controller.addMyGardenItem);

/**
 * @swagger
 * /plants/garden/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết cây trồng trong vườn cá nhân (Phục vụ màn hình Chi tiết cây - Plant Detail)
 *     tags: [MyGarden]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cây trong vườn (MyGarden ID)
 *     responses:
 *       200:
 *         description: Trả về chi tiết cây và lịch sử chăm sóc của cây này
 *       404:
 *         description: Không tìm thấy cây trồng
 */
router.get("/garden/:id", authMiddleware, controller.getMyGardenItemDetail);

/**
 * @swagger
 * /plants/garden/{id}/water:
 *   post:
 *     summary: Hành động xác nhận "Đã tưới nước" cho cây (Thêm bản ghi vào lịch sử và cập nhật trạng thái)
 *     tags: [MyGarden]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cây trong vườn
 *     responses:
 *       200:
 *         description: Xác nhận đã tưới thành công, lịch sử được cập nhật
 *       404:
 *         description: Không tìm thấy cây
 */
router.post("/garden/:id/water", authMiddleware, controller.waterPlant);

/**
 * @swagger
 * /plants/garden/{id}:
 *   put:
 *     summary: Chỉnh sửa thông tin cơ bản của cây trong vườn (nickname, sức khỏe)
 *     tags: [MyGarden]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cây trong vườn
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 example: Bé Cây Trầu Bà
 *               healthStatus:
 *                 type: string
 *                 example: Khỏe mạnh
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy cây
 */
router.put("/garden/:id", authMiddleware, controller.updateMyGardenItem);

module.exports = router;

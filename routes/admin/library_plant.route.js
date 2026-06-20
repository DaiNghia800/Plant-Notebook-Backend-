const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/library_plant.controller');
const uploadS3 = require('../../middlewares/uploadS3');

/**
 * @swagger
 * /library-plants:
 *   get:
 *     summary: Lấy danh sách cây trong thư viện (có phân trang, Admin)
 *     tags: [LibraryPlants]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng cây mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: approvalStatus
 *         schema:
 *           type: string
 *         description: Lọc theo trạng thái duyệt (approved/pending/rejected)
 *     responses:
 *       200:
 *         description: Trả về danh sách cây
 */
router.get('/', controller.getPlants);

/**
 * @swagger
 * /library-plants/{id}:
 *   get:
 *     summary: Lấy chi tiết cây (Admin)
 *     tags: [LibraryPlants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về thông tin cây
 *       404:
 *         description: Không tìm thấy cây
 */
router.get('/:id', controller.getPlantById);

/**
 * @swagger
 * /library-plants/seed:
 *   post:
 *     summary: Khởi tạo/nạp dữ liệu mẫu 40 cây vào PostgreSQL (Admin)
 *     tags: [LibraryPlants]
 *     responses:
 *       200:
 *         description: Đã nạp thành công
 */
router.post('/seed', controller.seedPlants);

/**
 * @swagger
 * /library-plants/{id}/approve:
 *   put:
 *     summary: Duyệt cây đề xuất (Dành cho Web Admin)
 *     tags: [LibraryPlants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã duyệt thành công (chuyển sang approved)
 *       404:
 *         description: Không tìm thấy cây
 */
router.put('/:id/approve', controller.approvePlant);

/**
 * @swagger
 * /library-plants/{id}/reject:
 *   put:
 *     summary: Từ chối cây đề xuất (Dành cho Web Admin)
 *     tags: [LibraryPlants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã từ chối thành công (chuyển sang rejected)
 *       404:
 *         description: Không tìm thấy cây
 */
router.put('/:id/reject', controller.rejectPlant);

/**
 * @swagger
 * /library-plants:
 *   post:
 *     summary: Thêm mới một cây vào thư viện trực tiếp (Dành cho Admin)
 *     tags: [LibraryPlants]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [id, name, category]
 *             properties:
 *               id:
 *                 type: string
 *                 example: "new-plant"
 *               name:
 *                 type: string
 *                 example: "Cây Mẫu Mới"
 *               scientificName:
 *                 type: string
 *                 example: "Epipremnum aureum"
 *               category:
 *                 type: string
 *                 example: "Trong nhà"
 *               shortDescription:
 *                 type: string
 *                 example: "Mô tả ngắn gọn"
 *               description:
 *                 type: string
 *                 example: "Mô tả chi tiết"
 *               lightLevel:
 *                 type: string
 *                 example: "Indirect sun"
 *               waterNeed:
 *                 type: string
 *                 example: "Trung bình"
 *               difficulty:
 *                 type: string
 *                 example: "Dễ"
 *               temperature:
 *                 type: string
 *                 example: "18-30°C"
 *               humidity:
 *                 type: string
 *                 example: "Trung bình"
 *               toxicity:
 *                 type: string
 *                 example: "Độc nhẹ với thú cưng"
 *               careGuide:
 *                 type: string
 *                 description: "JSON stringified array"
 *                 example: "[\"Tưới khi mặt đất khô.\", \"Tránh nắng gắt.\"]"
 *               growthTimeline:
 *                 type: string
 *                 description: "JSON stringified array"
 *                 example: "[{\"monthLabel\": \"Tháng 1\", \"note\": \"Cây ra lá mới\"}]"
 *               funFacts:
 *                 type: string
 *                 description: "JSON stringified array"
 *                 example: "[\"Có thể lọc sạch không khí.\"]"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "File ảnh tải lên"
 *               isTrending:
 *                 type: boolean
 *                 example: false
 *               isRare:
 *                 type: boolean
 *                 example: false
 *               badge:
 *                 type: string
 *                 example: "water"
 *     responses:
 *       201:
 *         description: Đã tạo thành công, trạng thái approved
 *       400:
 *         description: Thiếu thông tin bắt buộc
 */
router.post('/', uploadS3.singleImage, uploadS3.uploadToS3, controller.createPlant);

/**
 * @swagger
 * /library-plants/{id}:
 *   put:
 *     summary: Cập nhật thông tin cây trong thư viện
 *     tags: [LibraryPlants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tên đã cập nhật"
 *               scientificName:
 *                 type: string
 *                 example: "Tên khoa học mới"
 *               category:
 *                 type: string
 *                 example: "Trong nhà"
 *               shortDescription:
 *                 type: string
 *                 example: "Mô tả ngắn mới"
 *               description:
 *                 type: string
 *                 example: "Mô tả chi tiết mới"
 *               careGuide:
 *                 type: string
 *                 description: "JSON stringified array"
 *                 example: "[\"Tưới khi mặt đất khô.\", \"Tránh nắng gắt.\"]"
 *               growthTimeline:
 *                 type: string
 *                 description: "JSON stringified array"
 *                 example: "[{\"monthLabel\": \"Tháng 1\", \"note\": \"Cây ra lá mới\"}]"
 *               funFacts:
 *                 type: string
 *                 description: "JSON stringified array"
 *                 example: "[\"Có thể lọc sạch không khí.\"]"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "File ảnh tải lên"
 *               isTrending:
 *                 type: boolean
 *                 example: true
 *               isRare:
 *                 type: boolean
 *                 example: false
 *               badge:
 *                 type: string
 *                 example: "sun"
 *               temperature:
 *                 type: string
 *                 example: "20-25°C"
 *               humidity:
 *                 type: string
 *                 example: "Cao"
 *               toxicity:
 *                 type: string
 *                 example: "An toàn"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy cây
 */
router.put('/:id', uploadS3.singleImage, uploadS3.uploadToS3, controller.updatePlant);

/**
 * @swagger
 * /library-plants/{id}:
 *   delete:
 *     summary: Xóa một cây khỏi thư viện
 *     tags: [LibraryPlants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã xóa thành công
 *       404:
 *         description: Không tìm thấy cây
 */
router.delete('/:id', controller.deletePlant);

module.exports = router;

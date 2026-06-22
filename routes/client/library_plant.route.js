const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/library_plant.controller');
const uploadS3 = require('../../middlewares/uploadS3');
const authMiddleware = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: LibraryPlants
 */

/**
 * @swagger
 * /library-plants:
 *   get:
 *     summary: Lấy danh sách cây trong thư viện
 *     tags: [LibraryPlants]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục (Ví dụ "Trong nhà", "Ngoài trời")
 *       - in: query
 *         name: isTrending
 *         schema:
 *           type: boolean
 *         description: Lọc cây đang thịnh hành
 *       - in: query
 *         name: isRare
 *         schema:
 *           type: boolean
 *         description: Lọc cây quý hiếm
 *       - in: query
 *         name: approvalStatus
 *         schema:
 *           type: string
 *         description: Lọc theo trạng thái kiểm duyệt (approved, pending, rejected, all). Mặc định là approved.
 *     responses:
 *       200:
 *         description: Thành công
 *       500:
 *         description: Lỗi hệ thống nội bộ
 */
router.get('/', controller.getAllPlants);

/**
 * @swagger
 * /library-plants/contribute:
 *   post:
 *     summary: Gửi đề xuất đóng góp cây mới vào thư viện (Dành cho User mobile)
 *     tags: [LibraryPlants]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: ID của người dùng đóng góp
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
 *                 example: "cay-de-xuat-1"
 *               name:
 *                 type: string
 *                 example: "Cây Đóng Góp Mới"
 *               scientificName:
 *                 type: string
 *                 example: "Epipremnum aureum"
 *               category:
 *                 type: string
 *                 example: "Trong nhà"
 *               shortDescription:
 *                 type: string
 *                 example: "Mô tả AI tổng hợp"
 *               description:
 *                 type: string
 *                 example: "Mô tả chi tiết về cách trồng và chăm sóc"
 *               lightLevel:
 *                 type: string
 *                 example: "Sáng gián tiếp"
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
 *                 example: "Trung bình (40-60%)"
 *               toxicity:
 *                 type: string
 *                 example: "Độc nhẹ với thú cưng"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "File ảnh tải lên"
 *     responses:
 *       201:
 *         description: Gửi đề xuất thành công, trạng thái pending
 *       400:
 *         description: Thiếu thông tin bắt buộc (id, name, hoặc category)
 *       500:
 *         description: Lỗi hệ thống nội bộ
 */
router.post('/contribute', authMiddleware, uploadS3.singleImage, uploadS3.uploadToS3, controller.contributePlant);

/**
 * @swagger
 * /library-plants/check-existence:
 *   get:
 *     summary: Kiểm tra xem cây đã tồn tại trong thư viện chưa
 *     tags: [LibraryPlants]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Tên phổ thông của cây
 *       - in: query
 *         name: scientificName
 *         schema:
 *           type: string
 *         description: Tên khoa học của cây
 *     responses:
 *       200:
 *         description: "Thành công (trả về kết quả exists: true/false)"
 *       400:
 *         description: Yêu cầu ít nhất một trong hai tham số name hoặc scientificName
 *       500:
 *         description: Lỗi hệ thống nội bộ
 */
router.get('/check-existence', controller.checkExistence);

/**
 * @swagger
 * /library-plants/scan:
 *   post:
 *     summary: Nhận dạng và phân tích cây trồng qua ảnh sử dụng Gemini
 *     tags: [LibraryPlants]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh cây trồng cần scan
 *     responses:
 *       202:
 *         description: Đã nhận yêu cầu phân tích hình ảnh và đang xử lý trong hàng đợi
 *       400:
 *         description: Thiếu tệp ảnh hoặc tải ảnh lên thất bại
 *       500:
 *         description: Lỗi máy chủ nội bộ hoặc lỗi đẩy hàng đợi
 */
router.post('/scan', uploadS3.singleImage, uploadS3.uploadToS3, controller.scanPlantImage);

/**
 * @swagger
 * /library-plants/scan/{taskId}:
 *   get:
 *     summary: Lấy kết quả phân tích AI theo taskId
 *     tags: [LibraryPlants]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID của task phân tích AI
 *     responses:
 *       200:
 *         description: Trả về kết quả phân tích AI thành công
 *       404:
 *         description: Không tìm thấy task
 *       500:
 *         description: Lỗi hệ thống nội bộ
 */
router.get('/scan/:taskId', controller.getScanResult);

/**
 * @swagger
 * /library-plants/{id}:
 *   get:
 *     summary: Lấy chi tiết cây theo ID
 *     tags: [LibraryPlants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cây (ví dụ "pothos")
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy cây trong thư viện
 *       500:
 *         description: Lỗi hệ thống nội bộ
 */
router.get('/:id', controller.getPlantById);

module.exports = router;

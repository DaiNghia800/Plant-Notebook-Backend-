const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/library_plant.controller');
const uploadCloudinary = require('../../middlewares/uploadCloudinary');

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
 *         description: Thiếu thông tin bắt buộc
 */
router.post('/contribute', uploadCloudinary.singleImage, uploadCloudinary.uploadToCloudinary, controller.contributePlant);

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
 *         description: Không tìm thấy cây
 */
router.get('/:id', controller.getPlantById);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/library_plant.controller');
const uploadCloudinary = require('../middlewares/uploadCloudinary');

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
 * /library-plants/seed:
 *   post:
 *     summary: Khởi tạo/nạp dữ liệu mẫu 7 cây vào PostgreSQL (Admin)
 *     tags: [LibraryPlants]
 *     responses:
 *       200:
 *         description: Đã nạp thành công
 */
router.post('/seed', controller.seedPlants);

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
 *         application/json:
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
 *               category:
 *                 type: string
 *                 example: "Trong nhà"
 *               shortDescription:
 *                 type: string
 *                 example: "Mô tả AI tổng hợp"
 *               imageUrl:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-1604762524887-5a1a5f2c4f43?auto=format&fit=crop&w=1200&q=80"
 *     responses:
 *       201:
 *         description: Gửi đề xuất thành công, trạng thái pending
 *       400:
 *         description: Thiếu thông tin bắt buộc
 */
router.post('/contribute', uploadCloudinary.singleImage, uploadCloudinary.uploadToCloudinary, controller.contributePlant);

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

/**
 * @swagger
 * /library-plants:
 *   post:
 *     summary: Thêm mới một cây vào thư viện trực tiếp (Dành cho Admin)
 *     tags: [LibraryPlants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *               category:
 *                 type: string
 *                 example: "Trong nhà"
 *               shortDescription:
 *                 type: string
 *                 example: "Mô tả ngắn gọn"
 *               description:
 *                 type: string
 *                 example: "Mô tả chi tiết"
 *               imageUrl:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-1604762524887-5a1a5f2c4f43?auto=format&fit=crop&w=1200&q=80"
 *     responses:
 *       201:
 *         description: Đã tạo thành công, trạng thái approved
 *       400:
 *         description: Thiếu thông tin bắt buộc
 */
router.post('/', uploadCloudinary.singleImage, uploadCloudinary.uploadToCloudinary, controller.createPlant);

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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tên đã cập nhật"
 *               imageUrl:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-1604762524887-5a1a5f2c4f43?auto=format&fit=crop&w=1200&q=80"
 *               isTrending:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy cây
 */
router.put('/:id', uploadCloudinary.singleImage, uploadCloudinary.uploadToCloudinary, controller.updatePlant);

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

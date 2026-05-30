const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/gemini_key.controller');

/**
 * @swagger
 * tags:
 *   name: GeminiKeys
 *   description: API quản lý danh sách Gemini API Keys dùng để scan ảnh (Dành cho Web Admin)
 */

/**
 * @swagger
 * /gemini-keys:
 *   get:
 *     summary: Lấy danh sách toàn bộ API Keys
 *     tags: [GeminiKeys]
 *     responses:
 *       200:
 *         description: Danh sách API Keys
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/', controller.getAllKeys);

/**
 * @swagger
 * /gemini-keys:
 *   post:
 *     summary: Thêm mới một API Key
 *     tags: [GeminiKeys]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [apiKey]
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: Chuỗi Gemini API Key
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               dailyRequestLimit:
 *                 type: integer
 *                 default: 1500
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Key đã tồn tại hoặc thiếu tham số
 */
router.post('/', controller.createKey);

/**
 * @swagger
 * /gemini-keys/{id}:
 *   put:
 *     summary: Cập nhật thông tin một API Key
 *     tags: [GeminiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               isBanned:
 *                 type: boolean
 *               dailyRequestLimit:
 *                 type: integer
 *               cooldownUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy key
 */
router.put('/:id', controller.updateKey);

/**
 * @swagger
 * /gemini-keys/{id}:
 *   delete:
 *     summary: Xóa một API Key khỏi hệ thống
 *     tags: [GeminiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy key
 */
router.delete('/:id', controller.deleteKey);

/**
 * @swagger
 * /gemini-keys/{id}/ping:
 *   post:
 *     summary: Chạy thử nghiệm gửi request để kiểm tra hiệu lực của API Key và tự động cập nhật trạng thái trong database
 *     tags: [GeminiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API Key hoạt động bình thường
 *       400:
 *         description: API Key lỗi hoặc đã bị Google khóa
 *       404:
 *         description: Không tìm thấy key
 */
router.post('/:id/ping', controller.pingKey);

module.exports = router;

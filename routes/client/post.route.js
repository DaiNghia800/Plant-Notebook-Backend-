'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/post.controller');
const { singleImage, uploadToS3 } = require('../../middlewares/uploadS3');

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Lấy danh sách bài viết cộng đồng
 *     tags: [Community]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID người dùng hiện tại (để kiểm tra isLiked)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại (mặc định 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số bài viết mỗi trang (mặc định 20)
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', controller.getPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Lấy chi tiết bài viết kèm bình luận
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID người dùng hiện tại (để kiểm tra isLiked)
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.get('/:id', controller.getPostById);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Đăng bài viết mới
 *     tags: [Community]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - content
 *             properties:
 *               userId:
 *                 type: string
 *               content:
 *                 type: string
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', singleImage, uploadToS3, controller.createPost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Xóa bài viết (chỉ tác giả)
 *     tags: [Community]
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
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       403:
 *         description: Không có quyền
 */
router.delete('/:id', controller.deletePost);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Sửa bài viết (chỉ tác giả)
 *     tags: [Community]
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
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Sửa thành công
 */
router.put('/:id', singleImage, uploadToS3, controller.updatePost);

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Thích hoặc bỏ thích bài viết
 *     tags: [Community]
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
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/:id/like', controller.toggleLike);

/**
 * @swagger
 * /posts/{id}/comments:
 *   post:
 *     summary: Viết bình luận cho bài viết
 *     tags: [Community]
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
 *               userId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo bình luận thành công
 */
router.post('/:id/comments', controller.createComment);

/**
 * @swagger
 * /posts/comments/{commentId}:
 *   delete:
 *     summary: Xóa bình luận (chỉ tác giả)
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: commentId
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
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/comments/:commentId', controller.deleteComment);

/**
 * @swagger
 * /posts/comments/{commentId}:
 *   put:
 *     summary: Sửa bình luận (chỉ tác giả)
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: commentId
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
 *               userId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sửa thành công
 */
router.put('/comments/:commentId', controller.updateComment);

/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Lấy danh sách bài viết của một user
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: currentUserId
 *         schema:
 *           type: string
 *         description: ID người dùng hiện tại (để kiểm tra isLiked)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/user/:userId', controller.getPostsByUserId);

module.exports = router;

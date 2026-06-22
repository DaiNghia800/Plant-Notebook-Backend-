const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/auth.controller");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký user mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Thiếu thông tin hoặc Email đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post("/register", controller.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Sai mật khẩu
 *       404:
 *         description: User không tồn tại
 */
router.post("/login", controller.login);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Đăng nhập bằng Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: idToken nhận được từ Google Sign-In ở client
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZ...
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       400:
 *         description: Thiếu idToken
 *       401:
 *         description: Token không hợp lệ
 */
router.post("/google", controller.googleAuth);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Gửi mã OTP khôi phục mật khẩu qua email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *     responses:
 *       200:
 *         description: Mã OTP đã được gửi đến email của bạn
 *       400:
 *         description: Thiếu email
 *       404:
 *         description: Email không tồn tại trong hệ thống
 *       500:
 *         description: Lỗi server hoặc gửi mail thất bại
 */
router.post("/forgot-password", controller.forgotPassword);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Xác thực mã OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Xác thực OTP thành công
 *       400:
 *         description: Thiếu thông tin, OTP không chính xác hoặc đã hết hạn
 *       500:
 *         description: Lỗi server
 */
router.post("/verify-otp", controller.verifyOtp);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       400:
 *         description: Thiếu thông tin hoặc OTP không hợp lệ/hết hạn
 *       500:
 *         description: Lỗi server
 */
router.post("/reset-password", controller.resetPassword);

/**
 * @swagger
 * /auth/sync-firebase:
 *   post:
 *     summary: Đồng bộ dữ liệu người dùng từ Firebase
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - uid
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               displayName:
 *                 type: string
 *                 example: Nguyen Van A
 *               uid:
 *                 type: string
 *                 example: firebase_uid_123456
 *     responses:
 *       200:
 *         description: Đồng bộ thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 err:
 *                   type: integer
 *                   example: 0
 *                 msg:
 *                   type: string
 *                   example: Đồng bộ thành công!
 *                 data:
 *                   type: object
 *       500:
 *         description: Lỗi đồng bộ dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 err:
 *                   type: integer
 *                   example: 1
 *                 msg:
 *                   type: string
 *                   example: Lỗi đồng bộ dữ liệu
 */
router.post("/sync-firebase", controller.syncFirebase);

module.exports = router;
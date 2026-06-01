const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const controller = require('../../controllers/admin/auth.controller');

// Rate limiter: max 5 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { err: 429, msg: 'Too many login attempts, please try again later.' }
});

router.post('/login', loginLimiter, controller.login);

module.exports = router;
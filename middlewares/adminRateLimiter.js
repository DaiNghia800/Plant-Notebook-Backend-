'use strict';
const rateLimit = require('express-rate-limit');

// Global admin rate limiter: 100 requests per 15 minutes per IP
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { err: 429, msg: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

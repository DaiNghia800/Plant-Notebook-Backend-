'use strict';
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const permissionMiddleware = require('../../middlewares/permission.middleware');
const controller = require('../../controllers/admin/log.controller');

// All log routes require admin auth
router.use(authMiddleware);

router.get('/', permissionMiddleware('logs:read'), controller.getLogs);

module.exports = router;

'use strict';
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const permissionMiddleware = require('../../middlewares/permission.middleware');
const controller = require('../../controllers/admin/permission.controller');

// All permission routes require admin auth
router.use(authMiddleware);

router.get('/', permissionMiddleware('permissions:read'), controller.getAll);

module.exports = router;

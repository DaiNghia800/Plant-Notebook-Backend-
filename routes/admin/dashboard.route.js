'use strict';
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const permissionMiddleware = require('../../middlewares/permission.middleware');
const controller = require('../../controllers/admin/dashboard.controller');

// All dashboard routes require admin auth
router.use(authMiddleware);

router.get('/', permissionMiddleware('dashboard:read'), controller.getDashboardSummary);
router.get('/summary', permissionMiddleware('dashboard:read'), controller.summary);
router.get('/timeseries', permissionMiddleware('dashboard:read'), controller.timeseries);
router.get('/analytics', permissionMiddleware('dashboard:read'), controller.analytics);

module.exports = router;

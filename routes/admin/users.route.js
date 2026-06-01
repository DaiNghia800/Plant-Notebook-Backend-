'use strict';
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const permissionMiddleware = require('../../middlewares/permission.middleware');
const controller = require('../../controllers/admin/user.controller');

// All user routes require admin auth
router.use(authMiddleware);

router.get('/', permissionMiddleware('users:read'), controller.getAll);
router.get('/:id', permissionMiddleware('users:read'), controller.getById);
router.post('/', permissionMiddleware('users:create'), controller.create);
router.put('/:id', permissionMiddleware('users:update'), controller.update);
router.delete('/:id', permissionMiddleware('users:delete'), controller.delete);
router.post('/:id/role', permissionMiddleware('users:assignRole'), controller.assignRole);

module.exports = router;

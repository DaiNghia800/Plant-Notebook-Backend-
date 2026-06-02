'use strict';
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const permissionMiddleware = require('../../middlewares/permission.middleware');
const controller = require('../../controllers/admin/role.controller');

// All role routes require admin auth
router.use(authMiddleware);

router.get('/', permissionMiddleware('roles:read'), controller.getAll);
router.get('/:id', permissionMiddleware('roles:read'), controller.getById);
router.post('/', permissionMiddleware('roles:write'), controller.create);
router.put('/:id', permissionMiddleware('roles:write'), controller.update);
router.delete('/:id', permissionMiddleware('roles:delete'), controller.delete);

module.exports = router;

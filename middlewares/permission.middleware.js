'use strict';
/**
 * Middleware to enforce RBAC permissions.
 * Usage: app.use(requirePermission('users:read'))
 */
module.exports = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const { roleId } = req.user || {};
      if (!roleId) {
        return res.status(403).json({ err: 403, msg: 'No role assigned' });
      }
      const permissionService = require('../services/admin/permission.service');
      const has = await permissionService.hasPermission(roleId, requiredPermission);
      if (!has) {
        return res.status(403).json({ err: 403, msg: 'Bạn không có quyền thực hiện hành động này' });
      }
      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({ err: 500, msg: 'Server error in permission check' });
    }
  };
};

'use strict';
/** Permission service for checking RBAC */
module.exports = {
  /**
   * Check if a role (by roleId) has a specific permission string "resource:action".
   * Returns true/false.
   */
  async hasPermission(roleId, required) {
    const db = require('../../models');
    const role = await db.Role.findByPk(roleId, {
      include: [{ model: db.Permission, as: 'permissions' }]
    });
    if (!role) return false;
    return role.permissions.some(p => `${p.resource}:${p.action}` === required);
  }
};

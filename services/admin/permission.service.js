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
    // --- CÀI MÁY NGHE LÉN VÀO ĐÂY ---
    const myPermissions = role.permissions.map(p => `${p.resource}:${p.action}`);
    console.log("👉 1. Thằng Route đang đòi cái thẻ có chữ:", required);
    console.log("👉 2. Trong túi của Super Admin đang có:", myPermissions);
    return role.permissions.some(p => `${p.resource}:${p.action}` === required);
  }
};

'use strict';
const db = require('../../models');

/**
 * Service for Admin Role CRUD and permission assignment.
 */
module.exports = {
  /** Get all roles with their assigned permissions */
  async getAll() {
    return await db.Role.findAll({
      include: [{ model: db.Permission, as: 'permissions' }],
      order: [['createdAt', 'ASC']]
    });
  },

  /** Get a single role by id with permissions */
  async getById(id) {
    return await db.Role.findByPk(id, {
      include: [{ model: db.Permission, as: 'permissions' }]
    });
  },

  /** Create a new role and assign permissions */
  async create(data) {
    const { name, description, permissionIds } = data;
    const role = await db.Role.create({ name, description });

    // Assign permissions via the junction table
    if (Array.isArray(permissionIds) && permissionIds.length > 0) {
      await role.setPermissions(permissionIds);
    }

    // Reload with permissions included
    return await role.reload({
      include: [{ model: db.Permission, as: 'permissions' }]
    });
  },

  /** Update role info and reassign permissions */
  async update(id, data) {
    const role = await db.Role.findByPk(id);
    if (!role) return null;

    const { name, description, permissionIds } = data;
    await role.update({ name, description });

    // Overwrite permissions in the junction table
    if (Array.isArray(permissionIds)) {
      await role.setPermissions(permissionIds);
    }

    return await role.reload({
      include: [{ model: db.Permission, as: 'permissions' }]
    });
  },

  /** Delete a role (prevent deleting Super Admin) */
  async delete(id) {
    const role = await db.Role.findByPk(id);
    if (!role) return 0;

    // Prevent deletion of Super Admin role
    if (role.name === 'Super Admin') return -1;

    await role.destroy(); // RolePermissions cascade handled by Sequelize
    return 1;
  }
};

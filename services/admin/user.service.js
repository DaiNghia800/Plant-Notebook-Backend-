'use strict';
const db = require('../../models');

/**
 * Service for Admin User CRUD and role assignment.
 */
module.exports = {
  /** Get all users (paginated optional) */
  async getAll() {
    return await db.User.findAll({
      attributes: { exclude: ['password'] },
      include: [{
        model: db.Role,
        as: 'role'
      }]
    });
  },

  /** Get a single user by id */
  async getById(id) {
    return await db.User.findByPk(id, { include: [{ model: db.Role, as: 'role' }] });
  },

  /** Get user profile with role and permissions by id */
  async getProfile(id) {
    return await db.User.findByPk(id, {
      include: [{
        model: db.Role,
        as: 'role',
        include: [{ model: db.Permission, as: 'permissions' }]
      }]
    });
  },

  /** Create a new user (admin can set roleId) */
  async create(data) {
    // data may include roleId
    return await db.User.create(data);
  },

  /** Update user fields */
  async update(id, data) {
    const user = await db.User.findByPk(id);
    if (!user) return null;
    await user.update(data);
    const userData = user.toJSON();
    delete userData.password;
    return userData;
  },

  /** Delete a user */
  async delete(id) {
    const user = await db.User.findByPk(id);
    if (!user) return 0;
    await user.destroy();
    return 1;
  },

  /** Assign a role to a user */
  async assignRole(userId, roleId) {
    const user = await db.User.findByPk(userId);
    const role = await db.Role.findByPk(roleId);
    if (!user || !role) return null;
    user.roleId = roleId;
    await user.save();
    return user;
  }
};

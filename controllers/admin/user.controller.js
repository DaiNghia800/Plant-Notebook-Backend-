'use strict';
/**
 * Admin User Controller (CRUD + role assignment)
 */
const userService = require('../../services/admin/user.service');
const bcrypt = require('bcrypt');

module.exports = {
  // GET /admin/users
  async getAll(req, res) {
    try {
      const users = await userService.getAll();
      return res.status(200).json({ err: 0, data: users });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to fetch users' });
    }
  },

  // GET /admin/users/me
  async getMe(req, res) {
    try {
      const user = await userService.getProfile(req.user.id);
      if (!user) {
        return res.status(404).json({ err: 1, msg: 'User not found' });
      }
      
      const roleString = user.getDataValue('role');
      const roleObject = user.role;
      
      return res.status(200).json({
        err: 0,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: roleString,
          roleId: user.roleId,
          Role: roleObject
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to fetch profile' });
    }
  },

  // GET /admin/users/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getById(id);
      if (!user) return res.status(404).json({ err: 1, msg: 'User not found' });
      // Remove password before sending
      const { password, ...userData } = user.get({ plain: true });
      return res.status(200).json({ err: 0, data: userData });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to fetch user' });
    }
  },

  // POST /admin/users
  async create(req, res) {
    try {
      const { password, ...rest } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userService.create({ ...rest, password: hashedPassword });
      // Exclude password from response
      const { password: _, ...userData } = newUser.get({ plain: true });
      return res.status(201).json({ err: 0, data: userData });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to create user' });
    }
  },

  // PUT /admin/users/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await userService.update(id, req.body);
      if (!updated) return res.status(404).json({ err: 1, msg: 'User not found' });
      return res.status(200).json({ err: 0, data: updated });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to update user' });
    }
  },

  // DELETE /admin/users/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.delete(id);
      if (result === 0) return res.status(404).json({ err: 1, msg: 'User not found' });
      return res.status(200).json({ err: 0, msg: 'User deleted' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to delete user' });
    }
  },

  // POST /admin/users/:id/role
  async assignRole(req, res) {
    try {
      const { id } = req.params;
      const { roleId } = req.body;
      const user = await userService.assignRole(id, roleId);
      if (!user) return res.status(404).json({ err: 1, msg: 'User or role not found' });
      return res.status(200).json({ err: 0, data: user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to assign role' });
    }
  }
};

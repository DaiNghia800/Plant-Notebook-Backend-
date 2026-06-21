'use strict';
/**
 * Admin Role Controller (CRUD + permission assignment)
 */
const roleService = require('../../services/admin/role.service');
const { getCache, setCache, deleteCache } = require('../../config/redis');

module.exports = {
  // GET /admin/roles
  async getAll(req, res) {
    try {
      // Cache-Aside cho danh sách vai trò
      const cacheKey = 'roles:list';
      const cached = await getCache(cacheKey);
      if (cached) {
        console.log('Cache Hit!');
        return res.status(200).json({ err: 0, data: cached });
      }

      console.log('Cache Miss!');
      const roles = await roleService.getAll();
      await setCache(cacheKey, roles, 600); // TTL 10 phút
      return res.status(200).json({ err: 0, data: roles });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to fetch roles' });
    }
  },

  // GET /admin/roles/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const role = await roleService.getById(id);
      if (!role) return res.status(404).json({ err: 1, msg: 'Role not found' });
      return res.status(200).json({ err: 0, data: role });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to fetch role' });
    }
  },

  // POST /admin/roles
  async create(req, res) {
    try {
      const role = await roleService.create(req.body);
      await deleteCache('roles:list'); // Invalidate cache
      return res.status(201).json({ err: 0, data: role });
    } catch (error) {
      console.error(error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ err: 1, msg: 'Role name already exists' });
      }
      return res.status(500).json({ err: -1, msg: 'Failed to create role' });
    }
  },

  // PUT /admin/roles/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const role = await roleService.update(id, req.body);
      if (!role) return res.status(404).json({ err: 1, msg: 'Role not found' });
      await deleteCache('roles:list'); // Invalidate cache
      return res.status(200).json({ err: 0, data: role });
    } catch (error) {
      console.error(error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ err: 1, msg: 'Role name already exists' });
      }
      return res.status(500).json({ err: -1, msg: 'Failed to update role' });
    }
  },

  // DELETE /admin/roles/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await roleService.delete(id);
      if (result === 0) return res.status(404).json({ err: 1, msg: 'Role not found' });
      if (result === -1) return res.status(403).json({ err: 1, msg: 'Cannot delete Super Admin role' });
      await deleteCache('roles:list'); // Invalidate cache
      return res.status(200).json({ err: 0, msg: 'Role deleted' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to delete role' });
    }
  }
};

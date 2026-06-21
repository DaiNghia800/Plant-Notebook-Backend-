'use strict';
/**
 * Admin Permission Controller
 * Provides the full list of system permissions for the frontend checkbox UI.
 */
const db = require('../../models');
const { getCache, setCache } = require('../../config/redis');

module.exports = {
  // GET /admin/permissions
  async getAll(req, res) {
    try {
      // Cache-Aside cho danh sách quyền (rất ít thay đổi)
      const cacheKey = 'permissions:list';
      const cached = await getCache(cacheKey);
      if (cached) {
        console.log('Cache Hit!');
        return res.status(200).json({ err: 0, data: cached });
      }

      console.log('Cache Miss!');
      const permissions = await db.Permission.findAll({
        order: [['resource', 'ASC'], ['action', 'ASC']]
      });
      await setCache(cacheKey, permissions, 1800); // TTL 30 phút (permissions rất ít thay đổi)
      return res.status(200).json({ err: 0, data: permissions });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to fetch permissions' });
    }
  }
};

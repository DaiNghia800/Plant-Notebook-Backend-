'use strict';
/**
 * Admin Permission Controller
 * Provides the full list of system permissions for the frontend checkbox UI.
 */
const db = require('../../models');

module.exports = {
  // GET /admin/permissions
  async getAll(req, res) {
    try {
      const permissions = await db.Permission.findAll({
        order: [['resource', 'ASC'], ['action', 'ASC']]
      });
      return res.status(200).json({ err: 0, data: permissions });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to fetch permissions' });
    }
  }
};

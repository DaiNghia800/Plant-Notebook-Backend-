'use strict';
/**
 * Log controller exposing paginated log retrieval.
 */
const logService = require('../../services/admin/log.service');

module.exports = {
  // GET /admin/logs?page=1&limit=20
  async getLogs(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const result = await logService.getLogs(page, limit);
      return res.status(200).json({ err: 0, data: result });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to read logs' });
    }
  }
};

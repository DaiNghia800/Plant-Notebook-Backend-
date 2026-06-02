'use strict';
/**
 * Dashboard controller exposing summary and time‑series endpoints.
 */
const dashboardService = require('../../services/admin/dashboard.service');

module.exports = {
  // GET /admin/dashboard
  async getDashboardSummary(req, res) {
    try {
      const data = await dashboardService.getSummary();
      return res.status(200).json({ err: 0, data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Lỗi khi tải dữ liệu Dashboard' });
    }
  },

  // GET /admin/dashboard/summary
  async summary(req, res) {
    try {
      const data = await dashboardService.getSummary();
      return res.status(200).json({ err: 0, data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Lỗi khi tải dữ liệu Dashboard' });
    }
  },

  // GET /admin/dashboard/timeseries?days=30
  async timeseries(req, res) {
    try {
      const days = parseInt(req.query.days, 10) || 30;
      const data = await dashboardService.getUserTimeseries(days);
      return res.status(200).json({ err: 0, data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: -1, msg: 'Failed to fetch dashboard timeseries' });
    }
  }
};

'use strict';
/**
 * Log service to read log files with pagination.
 */
const fs = require('fs');
const path = require('path');

module.exports = {
  /**
   * Read log file (combined.log) and return paginated lines.
   * @param {number} page - 1-indexed page number.
   * @param {number} limit - items per page.
   * @returns {Object} { total, page, limit, logs: [] }
   */
  async getLogs(page = 1, limit = 20) {
    const logDir = path.resolve(__dirname, '..', '..', 'logs');
    const logFile = path.join(logDir, 'combined.log');
    if (!fs.existsSync(logFile)) {
      return { total: 0, page, limit, logs: [] };
    }
    const data = await fs.promises.readFile(logFile, 'utf-8');
    const lines = data.trim().split('\n').filter(l => l.length > 0);
    const total = lines.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const logs = lines.slice(start, end);
    return { total, page, limit, logs };
  }
};

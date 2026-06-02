'use strict';
/**
 * Log service to read daily-rotated log files with pagination.
 * Winston writes to files named combined-YYYY-MM-DD.log
 */
const fs = require('fs');
const path = require('path');

module.exports = {
  /**
   * Read the latest combined log file and return paginated, parsed entries.
   * @param {number} page - 1-indexed page number.
   * @param {number} limit - items per page.
   * @returns {Object} { total, page, limit, logs: [] }
   */
  async getLogs(page = 1, limit = 20) {
    const logDir = path.resolve(__dirname, '..', '..', 'logs');
    if (!fs.existsSync(logDir)) {
      return { total: 0, page, limit, logs: [] };
    }

    // Find all combined-*.log files (daily rotate pattern)
    const files = fs.readdirSync(logDir)
      .filter(f => f.startsWith('combined-') && f.endsWith('.log'));

    if (!files.length) {
      return { total: 0, page, limit, logs: [] };
    }

    // Sort descending so newest date file is first
    files.sort((a, b) => b.localeCompare(a));
    const latestLogPath = path.join(logDir, files[0]);

    const data = await fs.promises.readFile(latestLogPath, 'utf-8');
    const lines = data.trim().split('\n').filter(l => l.length > 0);

    // Parse each JSON line, skip unparseable lines
    const allLogs = lines.map(l => {
      try { return JSON.parse(l); }
      catch (_) { return null; }
    }).filter(Boolean).reverse(); // newest first

    const total = allLogs.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const logs = allLogs.slice(start, end);

    return { total, page, limit, logs };
  }
};

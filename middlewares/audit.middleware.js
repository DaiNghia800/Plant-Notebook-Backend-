'use strict';
const logger = require('../utils/logger');

/**
 * Audit middleware – logs every non-GET request performed by an admin.
 * It should be placed after auth middleware so that req.user is populated.
 */
module.exports = (req, res, next) => {
  // Listen for the response to finish so we log after the handler runs
  const onFinish = () => {
    res.removeListener('finish', onFinish);
    if (req.method !== 'GET') {
      const user = (req.user && req.user.email) ? req.user.email : 'Unknown';
      const logEntry = {
        user,
        method: req.method,
        endpoint: req.originalUrl,
        message: `${user} performed ${req.method} on ${req.originalUrl}`
      };
      // Write as JSON string to keep logger's format consistent
      logger.info(JSON.stringify(logEntry));
    }
  };
  res.on('finish', onFinish);
  next();
};

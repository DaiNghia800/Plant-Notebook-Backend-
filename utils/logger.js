'use strict';
const winston = require('winston');
require('winston-daily-rotate-file');

// Define log directory (create if not existent)
const path = require('path');
const logDir = path.resolve(__dirname, '..', 'logs');

// Transport for combined log (info and above)
const combinedTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

// Transport for error log (error level only)
const errorTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error'
});

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [combinedTransport, errorTransport]
});

// Stream for morgan integration
logger.stream = {
  write: function(message) {
    // Morgan adds newline at end; strip it
    logger.info(message.trim());
  }
};

module.exports = logger;

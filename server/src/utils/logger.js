/**
 * Logger Utility
 * ---------------
 * Uses Winston for application-level logging.
 *
 * WHY Winston?
 *   - It supports multiple log levels (error, warn, info, debug).
 *   - It can write logs to files AND the console at the same time.
 *   - Production apps need persistent logs for debugging.
 *
 * LOG LEVELS (from most to least severe):
 *   error → warn → info → http → debug
 */

const winston = require('winston');
const path = require('path');

// Define custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // include stack traces
  winston.format.printf(({ timestamp, level, message, stack }) => {
    // If there's a stack trace (error), include it
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Write all logs to console (with colors in development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // add colors to console output
        logFormat
      ),
    }),
    // Write error logs to a file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error', // only errors go here
      maxsize: 5242880, // 5MB max file size
      maxFiles: 5, // keep up to 5 rotated files
    }),
    // Write all logs to a combined file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;

/**
 * Error Middleware
 * -----------------
 * Catches all errors that happen in routes/controllers and sends
 * a consistent JSON error response.
 *
 * WHY?
 *   - Without this, unhandled errors crash the server.
 *   - It gives the client a consistent error format.
 *   - It logs errors for debugging in production.
 */

const logger = require('../utils/logger');

/**
 * 404 Handler — runs when no route matches the request.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler — catches all errors thrown in the app.
 * Express recognises this as an error handler because it has 4 arguments.
 */
const errorHandler = (err, req, res, next) => {
  // If status is still 200 (default), change it to 500 (server error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  logger.error(`${err.message} — ${req.method} ${req.originalUrl}`);

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only show the stack trace in development (never in production)
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };

/**
 * Rate Limiter Middleware
 * ------------------------
 * Prevents abuse by limiting how many requests a client can make.
 *
 * WHY?
 *   - Protects against brute-force login attacks.
 *   - Prevents API abuse (e.g. spamming the analysis endpoint).
 *   - Industry-standard security practice.
 */

const rateLimit = require('express-rate-limit');

/**
 * General rate limiter — 100 requests per 15 minutes per IP.
 * Applied to all API routes.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,     // include rate limit info in response headers
  legacyHeaders: false,      // disable X-RateLimit-* headers
});

/**
 * Auth rate limiter — 10 requests per 15 minutes per IP.
 * Applied only to login/register routes (stricter).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };

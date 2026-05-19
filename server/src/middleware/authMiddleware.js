/**
 * Auth Middleware
 * ----------------
 * Protects routes by verifying the JWT token in the Authorization header.
 *
 * HOW IT WORKS:
 *   1. Client sends: Authorization: Bearer <token>
 *   2. This middleware extracts the token.
 *   3. It verifies the token using the JWT_SECRET.
 *   4. If valid, it attaches the user info to req.user.
 *   5. If invalid, it returns 401 Unauthorized.
 *
 * WHY JWT?
 *   - Stateless: no need to store sessions on the server.
 *   - Scalable: works across multiple servers.
 *   - Self-contained: the token carries user info (id, role).
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Verify that the request has a valid JWT token.
 * If valid, attach user data to req.user and call next().
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]; // "Bearer <token>" → "<token>"
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    // Verify the token (throws an error if invalid or expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database (exclude password)
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists',
      });
    }

    // Attach user to the request object so routes can access it
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid token',
    });
  }
};

/**
 * Restrict access to admin users only.
 * Must be used AFTER the protect middleware.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied — admin privileges required',
    });
  }
};

module.exports = { protect, adminOnly };

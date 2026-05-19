/**
 * Auth Controller
 * -----------------
 * Handles user registration, login, and profile retrieval.
 *
 * ENDPOINTS:
 *   POST /api/auth/register — Create a new user account
 *   POST /api/auth/login    — Authenticate and get a JWT token
 *   GET  /api/auth/profile  — Get the logged-in user's profile
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Generate a JWT token for a user.
 * The token contains the user's ID and role.
 * It expires after the time set in JWT_EXPIRES_IN (default: 7 days).
 *
 * @param {number} id - User ID
 * @param {string} role - User role ('user' or 'admin')
 * @returns {string} JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * POST /api/auth/register
 * Creates a new user account.
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    // Create the user (password is auto-hashed by the model hook)
    const user = await User.create({ name, email, password });

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
};

/**
 * GET /api/auth/profile
 * Returns the logged-in user's profile (requires JWT token).
 */
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    logger.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
    });
  }
};

module.exports = { register, login, getProfile };

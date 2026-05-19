/**
 * Auth Routes
 * -------------
 * Maps HTTP endpoints to auth controller functions.
 *
 * POST /api/auth/register — Create account
 * POST /api/auth/login    — Log in
 * GET  /api/auth/profile  — Get profile (protected)
 */

const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes (no token needed)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes (token required)
router.get('/profile', protect, getProfile);

module.exports = router;

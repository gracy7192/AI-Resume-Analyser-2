/**
 * Admin Routes
 * ---------------
 * Maps HTTP endpoints to admin controller functions.
 * All routes require admin role.
 *
 * GET /api/admin/stats — Get platform statistics
 */

const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Admin-only routes (require auth + admin role)
router.get('/stats', protect, adminOnly, getStats);

module.exports = router;

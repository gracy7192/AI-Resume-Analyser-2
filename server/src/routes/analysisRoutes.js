/**
 * Analysis Routes
 * -----------------
 * Maps HTTP endpoints to analysis controller functions.
 * All routes are protected (require JWT token).
 *
 * POST /api/analysis/run — Run a new ATS analysis
 * GET  /api/analysis/:id — Get a specific analysis
 * GET  /api/analysis     — Get all user analyses
 */

const express = require('express');
const router = express.Router();
const { runAnalysis, getAnalysis, getUserAnalyses } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

// All analysis routes require authentication
router.post('/run', protect, runAnalysis);
router.get('/:id', protect, getAnalysis);
router.get('/', protect, getUserAnalyses);

module.exports = router;

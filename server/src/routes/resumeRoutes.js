/**
 * Resume Routes
 * ---------------
 * Maps HTTP endpoints to resume controller functions.
 * All routes are protected (require JWT token).
 *
 * POST /api/resume/upload  — Upload a resume (with file)
 * GET  /api/resume/history — Get upload history
 */

const express = require('express');
const router = express.Router();
const { uploadResume, getHistory } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All resume routes require authentication
router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/history', protect, getHistory);

module.exports = router;

/**
 * Express Application Setup (app.js)
 * -------------------------------------
 * This file configures the Express app:
 *   1. Middleware (CORS, JSON parsing, logging, rate limiting)
 *   2. API routes
 *   3. Error handling
 *
 * WHY separate app.js and server.js?
 *   - app.js = configuration (testable without starting a server)
 *   - server.js = starts the HTTP server and connects to the database
 *   - This separation makes testing much easier (Supertest can use app.js directly)
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables FIRST (before anything else uses them)
dotenv.config();

const { generalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Create Express app
const app = express();

// ──────────────────────────────────────────
// MIDDLEWARE
// ──────────────────────────────────────────

// CORS — allow the frontend (running on a different port) to talk to the backend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parse JSON request bodies (e.g. { "email": "...", "password": "..." })
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (shows each request in the console)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting (prevents API abuse)
app.use('/api/', generalLimiter);

// Serve uploaded files as static assets (for downloading resumes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Make socket.io accessible in routes via req.io
app.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

// ──────────────────────────────────────────
// API ROUTES
// ──────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint (useful for deployment monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI ATS Resume Scorer API is running',
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────
// ERROR HANDLING (must be AFTER routes)
// ──────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

module.exports = app;

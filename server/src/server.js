/**
 * Server Entry Point (server.js)
 * --------------------------------
 * This file:
 *   1. Creates an HTTP server from the Express app.
 *   2. Attaches Socket.IO for real-time communication.
 *   3. Connects to the MySQL database.
 *   4. Syncs Sequelize models (creates tables if they don't exist).
 *   5. Starts listening on the configured port.
 *
 * TO START: npm run dev (uses nodemon for auto-restart)
 */

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { sequelize, testConnection } = require('./config/db');
const { initializeSocket } = require('./sockets/socketHandler');
const logger = require('./utils/logger');

// Import models to register them with Sequelize
require('./models');

// Create HTTP server (needed for Socket.IO — it wraps the Express app)
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Socket.IO event handlers
initializeSocket(io);

// Make io accessible in routes (so controllers can emit events)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ──────────────────────────────────────────
// START THE SERVER
// ──────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Test database connection
    await testConnection();

    // 2. Sync models with database (creates tables if they don't exist)
    //    force: false = don't drop existing tables
    //    alter: true  = update table structure if models changed (dev only)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('✅ Database synced successfully');

    // 3. Create uploads directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 4. Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // 5. Start listening for requests
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📡 Socket.IO ready`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = server;

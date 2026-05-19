/**
 * Socket.IO Handler
 * -------------------
 * Sets up real-time communication between server and client.
 *
 * WHY Socket.IO?
 *   - The ATS analysis can take a few seconds.
 *   - Instead of the user waiting with no feedback, we send progress updates.
 *   - Socket.IO enables bi-directional, real-time communication.
 *
 * HOW IT WORKS:
 *   1. When a user connects, they join a private "room" (user_<id>).
 *   2. During analysis, the server emits progress events to that room.
 *   3. The frontend listens for these events and updates the UI.
 *
 * EVENTS:
 *   - analysis:started   — Analysis has begun
 *   - analysis:progress  — Progress update (step name + percentage)
 *   - analysis:completed — Analysis finished (includes score)
 *   - analysis:error     — Something went wrong
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Initialize Socket.IO event handlers.
 * @param {import('socket.io').Server} io - Socket.IO server instance
 */
const initializeSocket = (io) => {
  // Middleware: authenticate socket connections using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  // Handle new connections
  io.on('connection', (socket) => {
    logger.info(`Socket connected: user_${socket.userId}`);

    // Join the user's private room
    socket.join(`user_${socket.userId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user_${socket.userId}`);
    });

    // Handle custom events (extendable)
    socket.on('ping', () => {
      socket.emit('pong', { message: 'Server is alive' });
    });
  });

  logger.info('Socket.IO initialized');
};

module.exports = { initializeSocket };

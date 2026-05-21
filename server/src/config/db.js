/**
 * Database Configuration
 * ----------------------
 * Sets up Sequelize ORM to connect to MySQL.
 *
 * WHY Sequelize?
 *   - It lets us write JavaScript instead of raw SQL.
 *   - It handles table creation, relationships, and migrations.
 *   - Beginner-friendly: models look like plain JS objects.
 *
 * HOW it works:
 *   1. We read DB credentials from environment variables (.env).
 *   2. We create a Sequelize instance with those credentials.
 *   3. We export that instance so every model can use the same connection.
 */

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a new Sequelize instance (our connection to MySQL)
// If running tests, use a dedicated test database to protect development data from being wiped
const dbName = process.env.NODE_ENV === 'test'
  ? 'ats_resume_test'
  : (process.env.DB_NAME || 'ats_resume');

const sequelize = new Sequelize(
  dbName,                                    // database name
  process.env.DB_USER || 'root',             // username
  process.env.DB_PASSWORD || '',             // password
  {
    host: process.env.DB_HOST || 'localhost', // where MySQL is running
    port: process.env.DB_PORT || 3306,        // MySQL default port
    dialect: 'mysql',                         // we are using MySQL
    logging: false,                           // set to console.log to see SQL queries
    pool: {
      max: 10,    // max number of connections in pool
      min: 0,     // min number of connections in pool
      acquire: 30000, // max time (ms) to get a connection before throwing error
      idle: 10000     // max time (ms) a connection can be idle before being released
    },
    define: {
      timestamps: true,  // automatically add createdAt and updatedAt columns
      underscored: true, // use snake_case instead of camelCase for column names
    },
  }
);

/**
 * Test the database connection
 * Call this when the server starts to make sure MySQL is reachable.
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1); // stop the server if we can't reach the DB
  }
};

module.exports = { sequelize, testConnection };

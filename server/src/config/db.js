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
  dbName,
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',

    // Required for TiDB Cloud
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    logging: false,

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    define: {
      timestamps: true,
      underscored: true,
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
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
/**
 * Job Description Model
 * ----------------------
 * Stores job descriptions that users paste for comparison with their resumes.
 *
 * Fields:
 *   - id          : Auto-incrementing primary key
 *   - user_id     : Foreign key → which user created this JD
 *   - title       : Short title for the job (e.g. "Senior React Developer")
 *   - description : Full job description text
 *   - created_at  : Timestamp (auto)
 *
 * RELATIONSHIP: A User can have many Job Descriptions (1:N)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const JobDescription = sequelize.define('JobDescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Untitled Position',
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Job description cannot be empty' },
    },
  },
}, {
  tableName: 'job_descriptions',
});

module.exports = JobDescription;

/**
 * Resume Model
 * -------------
 * Stores information about uploaded resumes.
 *
 * Fields:
 *   - id             : Auto-incrementing primary key
 *   - user_id        : Foreign key → which user uploaded this resume
 *   - filename       : Original filename (e.g. "john_resume.pdf")
 *   - filepath       : Server path where the file is stored
 *   - extracted_text  : Plain text extracted from the PDF/DOCX
 *   - uploaded_at     : Timestamp (auto)
 *
 * RELATIONSHIP: A User can have many Resumes (1:N)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Resume = sequelize.define('Resume', {
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
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  extracted_text: {
    type: DataTypes.TEXT('long'), // can hold very large text
    allowNull: true,
  },
}, {
  tableName: 'resumes',
});

module.exports = Resume;

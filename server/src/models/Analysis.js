/**
 * Analysis Model
 * ---------------
 * Stores the results of each ATS analysis (resume vs job description).
 *
 * Fields:
 *   - id                   : Primary key
 *   - user_id              : Who ran this analysis
 *   - resume_id            : Which resume was analysed
 *   - job_description_id   : Which JD it was compared against
 *   - ats_score            : Final weighted ATS score (0–100)
 *   - keyword_score        : Score from keyword matching (0–100)
 *   - semantic_score       : Score from cosine similarity (0–100)
 *   - experience_score     : Score from experience detection (0–100)
 *   - education_score      : Score from education detection (0–100)
 *   - matched_skills       : JSON array of skills found in both resume & JD
 *   - missing_skills       : JSON array of skills in JD but NOT in resume
 *   - suggestions          : AI-generated improvement suggestions (text)
 *   - created_at           : Timestamp (auto)
 *
 * SCORING FORMULA:
 *   ATS Score = 40% Keyword + 30% Semantic + 20% Experience + 10% Education
 *
 * RELATIONSHIPS:
 *   - Analysis belongs to User (N:1)
 *   - Analysis belongs to Resume (N:1)
 *   - Analysis belongs to JobDescription (N:1)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Analysis = sequelize.define('Analysis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  resume_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'resumes', key: 'id' },
  },
  job_description_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'job_descriptions', key: 'id' },
  },
  ats_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0, max: 100 },
  },
  keyword_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  semantic_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  experience_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  education_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  matched_skills: {
    type: DataTypes.JSON, // stored as JSON array, e.g. ["javascript","react"]
    defaultValue: [],
  },
  missing_skills: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  suggestions: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
}, {
  tableName: 'analyses',
});

module.exports = Analysis;

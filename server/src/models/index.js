/**
 * Model Index — Central Model Registry
 * --------------------------------------
 * This file:
 *   1. Imports all Sequelize models.
 *   2. Defines relationships (associations) between them.
 *   3. Exports everything so the rest of the app can use them.
 *
 * WHY a central index?
 *   - Keeps associations in one place (easier to understand).
 *   - Avoids circular import issues.
 *   - Any file can do: const { User, Resume } = require('../models');
 */

const { sequelize } = require('../config/db');
const User = require('./User');
const Resume = require('./Resume');
const JobDescription = require('./JobDescription');
const Analysis = require('./Analysis');

// ──────────────────────────────────────────
// ASSOCIATIONS (Relationships)
// ──────────────────────────────────────────

// A User has many Resumes (1:N)
User.hasMany(Resume, { foreignKey: 'user_id', as: 'resumes', onDelete: 'CASCADE' });
Resume.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// A User has many Job Descriptions (1:N)
User.hasMany(JobDescription, { foreignKey: 'user_id', as: 'jobDescriptions', onDelete: 'CASCADE' });
JobDescription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// A User has many Analyses (1:N)
User.hasMany(Analysis, { foreignKey: 'user_id', as: 'analyses', onDelete: 'CASCADE' });
Analysis.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// An Analysis belongs to one Resume (N:1)
Resume.hasMany(Analysis, { foreignKey: 'resume_id', as: 'analyses', onDelete: 'CASCADE' });
Analysis.belongsTo(Resume, { foreignKey: 'resume_id', as: 'resume' });

// An Analysis belongs to one Job Description (N:1)
JobDescription.hasMany(Analysis, { foreignKey: 'job_description_id', as: 'analyses', onDelete: 'CASCADE' });
Analysis.belongsTo(JobDescription, { foreignKey: 'job_description_id', as: 'jobDescription' });

module.exports = {
  sequelize,
  User,
  Resume,
  JobDescription,
  Analysis,
};

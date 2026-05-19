/**
 * Scoring Service — ATS Score Calculator
 * -----------------------------------------
 * Combines all sub-scores into the final ATS score.
 *
 * FORMULA:
 *   ATS Score = 40% Keyword + 30% Semantic + 20% Experience + 10% Education
 *
 * Each sub-score is calculated by a specialized function:
 *   - Keyword Score  → keywordService.js (TF-IDF matching)
 *   - Semantic Score → similarityService.js (cosine similarity)
 *   - Experience Score → pattern matching (years, titles, action verbs)
 *   - Education Score → pattern matching (degrees, certifications)
 */

const { calculateKeywordScore } = require('./keywordService');
const { calculateSemanticScore } = require('./similarityService');
const { normalizeText } = require('../utils/textCleaner');
const logger = require('../utils/logger');

/**
 * Calculate the Experience Score (0–100).
 * Looks for indicators of professional experience in the resume.
 *
 * Checks for:
 *   - Years of experience mentions (e.g. "5 years experience")
 *   - Job titles (e.g. "Senior Developer", "Lead Engineer")
 *   - Action verbs (e.g. "developed", "managed", "implemented")
 *   - Company names or "worked at" patterns
 *
 * @param {string} resumeText - Cleaned resume text
 * @param {string} jdText - Cleaned job description text
 * @returns {number} Score from 0 to 100
 */
const calculateExperienceScore = (resumeText, jdText) => {
  const resumeLower = normalizeText(resumeText);
  let score = 0;
  let maxPoints = 0;

  // --- Check 1: Years of experience (30 points max) ---
  maxPoints += 30;
  const yearPatterns = [
    /(\d+)\+?\s*years?\s*(of\s+)?(experience|exp)/i,
    /experience[:\s]+(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*yrs?\s*(of\s+)?exp/i,
  ];
  for (const pattern of yearPatterns) {
    if (pattern.test(resumeLower)) {
      score += 30;
      break;
    }
  }

  // --- Check 2: Job titles (25 points max) ---
  maxPoints += 25;
  const titles = [
    'developer', 'engineer', 'designer', 'manager', 'analyst',
    'architect', 'consultant', 'specialist', 'director', 'lead',
    'senior', 'junior', 'intern', 'coordinator', 'administrator',
    'technician', 'scientist', 'researcher', 'professor', 'instructor',
  ];
  const foundTitles = titles.filter((t) => resumeLower.includes(t));
  score += Math.min(25, foundTitles.length * 5);

  // --- Check 3: Action verbs (25 points max) ---
  maxPoints += 25;
  const actionVerbs = [
    'developed', 'designed', 'implemented', 'managed', 'led',
    'built', 'created', 'optimized', 'improved', 'deployed',
    'delivered', 'architected', 'automated', 'maintained', 'resolved',
    'collaborated', 'mentored', 'launched', 'reduced', 'increased',
    'achieved', 'coordinated', 'established', 'negotiated', 'analyzed',
  ];
  const foundVerbs = actionVerbs.filter((v) => resumeLower.includes(v));
  score += Math.min(25, foundVerbs.length * 3);

  // --- Check 4: Work history section exists (20 points) ---
  maxPoints += 20;
  const workIndicators = [
    'work experience', 'professional experience', 'employment history',
    'work history', 'experience', 'career', 'positions held',
  ];
  for (const indicator of workIndicators) {
    if (resumeLower.includes(indicator)) {
      score += 20;
      break;
    }
  }

  // Normalize to 0-100 range
  return Math.min(100, Math.round((score / maxPoints) * 100));
};

/**
 * Calculate the Education Score (0–100).
 * Looks for educational qualifications in the resume.
 *
 * @param {string} resumeText - Cleaned resume text
 * @param {string} jdText - Cleaned job description text
 * @returns {number} Score from 0 to 100
 */
const calculateEducationScore = (resumeText, jdText) => {
  const resumeLower = normalizeText(resumeText);
  let score = 0;
  let maxPoints = 0;

  // --- Check 1: Degree level (40 points max) ---
  maxPoints += 40;
  const degrees = [
    { pattern: /ph\.?d|doctorate|doctoral/i, points: 40 },
    { pattern: /master|m\.?s\.?|m\.?a\.?|mba|m\.?tech|m\.?sc/i, points: 35 },
    { pattern: /bachelor|b\.?s\.?|b\.?a\.?|b\.?tech|b\.?sc|b\.?e\.?/i, points: 30 },
    { pattern: /associate|diploma/i, points: 20 },
    { pattern: /certificate|certification/i, points: 15 },
  ];
  for (const { pattern, points } of degrees) {
    if (pattern.test(resumeLower)) {
      score += points;
      break; // Take the highest degree found
    }
  }

  // --- Check 2: Education section exists (20 points) ---
  maxPoints += 20;
  const eduIndicators = ['education', 'academic', 'university', 'college', 'school', 'degree'];
  for (const indicator of eduIndicators) {
    if (resumeLower.includes(indicator)) {
      score += 20;
      break;
    }
  }

  // --- Check 3: Certifications (20 points max) ---
  maxPoints += 20;
  const certPatterns = [
    'certified', 'certification', 'aws certified', 'google certified',
    'microsoft certified', 'pmp', 'scrum master', 'cissp', 'comptia',
    'oracle certified', 'cisco certified',
  ];
  const foundCerts = certPatterns.filter((c) => resumeLower.includes(c));
  score += Math.min(20, foundCerts.length * 10);

  // --- Check 4: GPA or honors (20 points max) ---
  maxPoints += 20;
  const honorPatterns = [
    /gpa[:\s]+[34]\.\d/i,    // GPA 3.x or 4.x
    /cum laude/i,
    /magna cum laude/i,
    /summa cum laude/i,
    /dean.?s list/i,
    /honors/i,
    /distinction/i,
  ];
  for (const pattern of honorPatterns) {
    if (pattern.test(resumeLower)) {
      score += 20;
      break;
    }
  }

  return Math.min(100, Math.round((score / maxPoints) * 100));
};

/**
 * Calculate the FINAL ATS score using the weighted formula.
 *
 * @param {string} resumeText - Cleaned resume text
 * @param {string} jdText - Cleaned job description text
 * @returns {Object} All scores and breakdown
 */
const calculateATSScore = (resumeText, jdText) => {
  // Calculate each sub-score
  const keywordScore = calculateKeywordScore(resumeText, jdText);
  const semanticScore = calculateSemanticScore(resumeText, jdText);
  const experienceScore = calculateExperienceScore(resumeText, jdText);
  const educationScore = calculateEducationScore(resumeText, jdText);

  // Apply weights
  const atsScore = Math.round(
    0.40 * keywordScore +
    0.30 * semanticScore +
    0.20 * experienceScore +
    0.10 * educationScore
  );

  logger.info(
    `ATS Score: ${atsScore} (keyword=${keywordScore}, semantic=${semanticScore}, ` +
    `experience=${experienceScore}, education=${educationScore})`
  );

  return {
    atsScore: Math.min(100, Math.max(0, atsScore)), // clamp between 0 and 100
    keywordScore,
    semanticScore,
    experienceScore,
    educationScore,
  };
};

module.exports = { calculateATSScore, calculateExperienceScore, calculateEducationScore };

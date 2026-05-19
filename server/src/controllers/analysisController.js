/**
 * Analysis Controller
 * ---------------------
 * Runs the ATS analysis (resume vs. job description) and returns results.
 *
 * ENDPOINTS:
 *   POST /api/analysis/run   — Run a new ATS analysis
 *   GET  /api/analysis/:id   — Get a specific analysis by ID
 *   GET  /api/analysis       — Get all analyses for the current user
 *
 * THE ANALYSIS PIPELINE:
 *   1. Get the resume text (from database)
 *   2. Get/save the job description text
 *   3. Extract skills from both
 *   4. Compare skills (matched vs missing)
 *   5. Calculate all scores (keyword, semantic, experience, education)
 *   6. Generate improvement suggestions
 *   7. Save the analysis to the database
 *   8. Emit a Socket.IO event so the frontend gets real-time updates
 */

const { Analysis, Resume, JobDescription } = require('../models');
const { extractSkills, compareSkills } = require('../utils/skillExtractor');
const { calculateATSScore } = require('../services/scoringService');
const { generateSuggestions } = require('../services/suggestionService');
const logger = require('../utils/logger');

/**
 * POST /api/analysis/run
 * Run a new ATS analysis.
 *
 * Request body:
 *   - resumeId: ID of the uploaded resume
 *   - jobDescription: The job description text
 *   - jobTitle: (optional) Title of the job
 */
const runAnalysis = async (req, res) => {
  try {
    const { resumeId, jobDescription, jobTitle } = req.body;

    // ── Validate input ──
    if (!resumeId || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both a resume ID and a job description',
      });
    }

    // ── Get the resume from database ──
    const resume = await Resume.findOne({
      where: { id: resumeId, user_id: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found. Please upload a resume first.',
      });
    }

    const resumeText = resume.extracted_text;

    // ── Emit "analysis started" event via Socket.IO ──
    if (req.io) {
      req.io.to(`user_${req.user.id}`).emit('analysis:started', {
        message: 'Analysis started — parsing your resume...',
      });
    }

    // ── Save the job description ──
    const jd = await JobDescription.create({
      user_id: req.user.id,
      title: jobTitle || 'Untitled Position',
      description: jobDescription,
    });

    // ── Extract skills from both documents ──
    if (req.io) {
      req.io.to(`user_${req.user.id}`).emit('analysis:progress', {
        step: 'Extracting skills...',
        progress: 25,
      });
    }
    const resumeSkills = extractSkills(resumeText);
    const jdSkills = extractSkills(jobDescription);

    // ── Compare skills (matched vs missing) ──
    if (req.io) {
      req.io.to(`user_${req.user.id}`).emit('analysis:progress', {
        step: 'Comparing skills...',
        progress: 50,
      });
    }
    const { matched, missing } = compareSkills(resumeSkills, jdSkills);

    // ── Calculate ATS scores ──
    if (req.io) {
      req.io.to(`user_${req.user.id}`).emit('analysis:progress', {
        step: 'Calculating ATS score...',
        progress: 75,
      });
    }
    const scores = calculateATSScore(resumeText, jobDescription);

    // ── Generate improvement suggestions ──
    const suggestions = generateSuggestions({
      ...scores,
      matchedSkills: matched,
      missingSkills: missing,
    });

    // ── Save the analysis to database ──
    const analysis = await Analysis.create({
      user_id: req.user.id,
      resume_id: resume.id,
      job_description_id: jd.id,
      ats_score: scores.atsScore,
      keyword_score: scores.keywordScore,
      semantic_score: scores.semanticScore,
      experience_score: scores.experienceScore,
      education_score: scores.educationScore,
      matched_skills: matched,
      missing_skills: missing,
      suggestions,
    });

    // ── Emit "analysis complete" event ──
    if (req.io) {
      req.io.to(`user_${req.user.id}`).emit('analysis:completed', {
        analysisId: analysis.id,
        atsScore: scores.atsScore,
        message: 'Analysis complete!',
      });
    }

    logger.info(`Analysis completed: ID ${analysis.id}, Score ${scores.atsScore}`);

    res.status(201).json({
      success: true,
      message: 'Analysis completed successfully',
      data: {
        id: analysis.id,
        atsScore: scores.atsScore,
        keywordScore: scores.keywordScore,
        semanticScore: scores.semanticScore,
        experienceScore: scores.experienceScore,
        educationScore: scores.educationScore,
        matchedSkills: matched,
        missingSkills: missing,
        suggestions,
        resumeSkillsCount: resumeSkills.length,
        jdSkillsCount: jdSkills.length,
      },
    });
  } catch (error) {
    logger.error('Analysis error:', error.message);

    // Emit error event
    if (req.io) {
      req.io.to(`user_${req.user.id}`).emit('analysis:error', {
        message: 'Analysis failed. Please try again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Analysis failed. Please try again.',
    });
  }
};

/**
 * GET /api/analysis/:id
 * Get a specific analysis by its ID.
 */
const getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { model: Resume, as: 'resume', attributes: ['id', 'filename'] },
        { model: JobDescription, as: 'jobDescription', attributes: ['id', 'title', 'description'] },
      ],
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
      });
    }

    res.json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    logger.error('Get analysis error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis',
    });
  }
};

/**
 * GET /api/analysis
 * Get all analyses for the current user.
 */
const getUserAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Resume, as: 'resume', attributes: ['id', 'filename'] },
        { model: JobDescription, as: 'jobDescription', attributes: ['id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: { analyses },
    });
  } catch (error) {
    logger.error('Get analyses error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analyses',
    });
  }
};

module.exports = { runAnalysis, getAnalysis, getUserAnalyses };

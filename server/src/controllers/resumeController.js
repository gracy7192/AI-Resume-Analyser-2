/**
 * Resume Controller
 * -------------------
 * Handles resume upload and history retrieval.
 *
 * ENDPOINTS:
 *   POST /api/resume/upload  — Upload a PDF/DOCX resume
 *   GET  /api/resume/history — Get the user's upload history
 */

const path = require('path');
const { Resume } = require('../models');
const { parseResume } = require('../services/parserService');
const logger = require('../utils/logger');

/**
 * POST /api/resume/upload
 * Upload a resume file, extract its text, and save to database.
 */
const uploadResume = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF or DOCX file',
      });
    }

    const filePath = req.file.path;
    const filename = req.file.originalname;

    // Extract text from the uploaded file
    logger.info(`Parsing resume: ${filename}`);
    const extractedText = await parseResume(filePath);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from the file. Please check if the file is readable.',
      });
    }

    // Save resume record to database
    const resume = await Resume.create({
      user_id: req.user.id,
      filename,
      filepath: filePath,
      extracted_text: extractedText,
    });

    logger.info(`Resume uploaded successfully: ${filename} (ID: ${resume.id})`);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: {
        id: resume.id,
        filename: resume.filename,
        textLength: extractedText.length,
        uploadedAt: resume.created_at,
      },
    });
  } catch (error) {
    logger.error('Resume upload error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload resume',
    });
  }
};

/**
 * GET /api/resume/history
 * Returns all resumes uploaded by the current user.
 */
const getHistory = async (req, res) => {
  try {
    const resumes = await Resume.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'filename', 'created_at'], // don't send the full text
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: { resumes },
    });
  } catch (error) {
    logger.error('Get history error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume history',
    });
  }
};

module.exports = { uploadResume, getHistory };

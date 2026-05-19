/**
 * Parser Service
 * ----------------
 * Extracts plain text from PDF and DOCX resume files.
 *
 * WHY separate parsers?
 *   - PDFs and DOCX files have completely different internal formats.
 *   - pdf-parse reads the PDF binary format.
 *   - mammoth reads the DOCX XML format.
 *   - We detect the file type by extension and call the right parser.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const logger = require('../utils/logger');
const { cleanText } = require('../utils/textCleaner');

/**
 * Extract text from a PDF file.
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<string>} Extracted and cleaned text
 */
const parsePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    
    // Some versions of pdf-parse require a specific import style or have default exports
    let parseFunc = pdfParse;
    if (typeof pdfParse !== 'function' && pdfParse.default) {
      parseFunc = pdfParse.default;
    }
    
    if (typeof parseFunc !== 'function') {
      throw new Error('PDF parser initialized incorrectly. Please check the pdf-parse dependency.');
    }

    const data = await parseFunc(dataBuffer);
    logger.info(`Parsed PDF: ${path.basename(filePath)} — ${data.numpages} pages`);
    return cleanText(data.text);
  } catch (error) {
    logger.error(`PDF parsing failed: ${error.message}`);
    throw error;
  }
};


/**
 * Extract text from a DOCX file.
 * @param {string} filePath - Absolute path to the DOCX file
 * @returns {Promise<string>} Extracted and cleaned text
 */
const parseDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    logger.info(`Parsed DOCX: ${path.basename(filePath)}`);
    return cleanText(result.value);
  } catch (error) {
    logger.error(`DOCX parsing failed: ${error.message}`);
    throw new Error('Failed to parse DOCX file. Please ensure the file is not corrupted.');
  }
};

/**
 * Parse any supported resume file (PDF or DOCX).
 * Detects the type by file extension and calls the right parser.
 * @param {string} filePath - Absolute path to the resume file
 * @returns {Promise<string>} Extracted and cleaned text
 */
const parseResume = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.pdf':
      return parsePDF(filePath);
    case '.docx':
      return parseDOCX(filePath);
    default:
      throw new Error(`Unsupported file format: ${ext}. Only PDF and DOCX are supported.`);
  }
};

module.exports = { parsePDF, parseDOCX, parseResume };

/**
 * Upload Middleware
 * ------------------
 * Configures Multer to handle file uploads (PDF and DOCX only).
 *
 * WHY Multer?
 *   - It's the standard Express middleware for handling multipart/form-data.
 *   - It saves uploaded files to disk and makes them available via req.file.
 *
 * SECURITY:
 *   - Only .pdf and .docx files are allowed.
 *   - Max file size is 5 MB (configurable via .env).
 *   - Files are stored in the server/uploads/ directory.
 */

const multer = require('multer');
const path = require('path');
const logger = require('../utils/logger');

// Configure WHERE and HOW files are stored on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save all uploads to the /uploads folder
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Create a unique filename: userId_timestamp_originalName
    const uniqueName = `${req.user.id}_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Filter: only allow PDF and DOCX files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];
  const allowedExtensions = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true); // accept the file
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

// Create the Multer instance with our config
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5 MB default
  },
});

module.exports = upload;

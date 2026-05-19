/**
 * Text Cleaner Utility
 * ---------------------
 * Cleans and normalises raw text extracted from PDF/DOCX files.
 *
 * WHY?
 *   - PDF/DOCX extraction often produces messy text (extra spaces, special chars).
 *   - Clean text improves the accuracy of keyword matching and similarity scoring.
 *   - Normalisation ensures consistent comparisons.
 */

/**
 * Remove extra whitespace, special characters, and normalise the text.
 * @param {string} text - Raw text from a resume or job description
 * @returns {string} Cleaned text
 */
const cleanText = (text) => {
  if (!text) return '';

  return text
    .replace(/[\r\n]+/g, ' ')           // replace newlines with spaces
    .replace(/\s+/g, ' ')               // collapse multiple spaces into one
    // Keep letters, numbers, and common tech symbols (@, ., +, #, -, /)
    .replace(/[^\w\s@.+#\-/]/g, ' ')    
    .trim();                            
};


/**
 * Convert text to lowercase for case-insensitive comparisons.
 * @param {string} text
 * @returns {string}
 */
const normalizeText = (text) => {
  return cleanText(text).toLowerCase();
};

/**
 * Tokenize text into individual words.
 * Removes common English stop words that don't carry meaning.
 * @param {string} text
 * @returns {string[]} Array of meaningful words
 */
const tokenize = (text) => {
  // Common English stop words (words that don't carry meaning)
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'must',
    'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we',
    'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them',
    'their', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
    'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very', 'just',
    'about', 'above', 'after', 'again', 'all', 'also', 'am', 'any', 'as',
    'because', 'before', 'below', 'between', 'both', 'each', 'few', 'get',
    'got', 'here', 'into', 'more', 'most', 'other', 'out', 'over', 'own',
    'same', 'some', 'such', 'up', 'down', 'only', 'now', 'during', 'through',
    'etc', 'eg', 'ie', 'vs', 'per',
  ]);

  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);

  // Filter out stop words and very short words
  return words.filter((word) => word.length > 1 && !stopWords.has(word));
};

module.exports = { cleanText, normalizeText, tokenize };

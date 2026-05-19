/**
 * Keyword Service — TF-IDF Implementation
 * ------------------------------------------
 * Implements the TF-IDF algorithm for keyword extraction and matching.
 *
 * WHAT IS TF-IDF?
 *   TF-IDF = Term Frequency × Inverse Document Frequency
 *
 *   - TF (Term Frequency): How often a word appears in a document.
 *     Formula: TF(word) = (times word appears) / (total words in document)
 *
 *   - IDF (Inverse Document Frequency): How unique a word is across documents.
 *     Formula: IDF(word) = log(total documents / documents containing word)
 *
 *   - TF-IDF(word) = TF × IDF
 *     High TF-IDF = word is frequent in this document but rare overall = IMPORTANT
 *
 * WHY TF-IDF?
 *   - Works offline (no API key needed).
 *   - Educational — you learn how search engines rank content.
 *   - Good enough for keyword extraction in ATS systems.
 */

const { tokenize } = require('../utils/textCleaner');

/**
 * Calculate Term Frequency (TF) for each word in a document.
 * TF = (times word appears) / (total words)
 *
 * @param {string[]} tokens - Array of words
 * @returns {Object} Map of word → TF score
 */
const calculateTF = (tokens) => {
  const tf = {};
  const totalWords = tokens.length;

  if (totalWords === 0) return tf;

  // Count occurrences of each word
  for (const word of tokens) {
    tf[word] = (tf[word] || 0) + 1;
  }

  // Divide by total words to get frequency
  for (const word in tf) {
    tf[word] = tf[word] / totalWords;
  }

  return tf;
};

/**
 * Calculate Inverse Document Frequency (IDF) for words across documents.
 * IDF = log(total documents / documents containing the word)
 * 
 * IMPROVED: We add 1 to the numerator and denominator to avoid log(1) = 0
 * and division by zero. This is a common smoothing technique.
 *
 * @param {string[][]} tokenizedDocs - Array of tokenized documents
 * @returns {Object} Map of word → IDF score
 */
const calculateIDF = (tokenizedDocs) => {
  const idf = {};
  const totalDocs = tokenizedDocs.length;

  // For each document, track which words appear
  for (const tokens of tokenizedDocs) {
    const uniqueWords = new Set(tokens);
    for (const word of uniqueWords) {
      idf[word] = (idf[word] || 0) + 1;
    }
  }

  // Apply smoothed IDF formula: log(N / (1 + n)) + 1
  for (const word in idf) {
    // If we only have 1 or 2 docs, standard IDF often yields 0.
    // We use a simpler approach for small N:
    if (totalDocs <= 2) {
      idf[word] = 1.0; // treat all found words as equally "unique" if corpus is too small
    } else {
      idf[word] = Math.log(totalDocs / (idf[word])) + 1;
    }
  }

  return idf;
};

/**
 * Calculate TF-IDF scores for a document.
 * @param {string[]} tokens - Tokenized document
 * @param {Object} idf - Pre-calculated IDF scores
 * @returns {Object} Map of word → TF-IDF score
 */
const calculateTFIDF = (tokens, idf) => {
  const tf = calculateTF(tokens);
  const tfidf = {};

  for (const word in tf) {
    // Ensure we don't get 0 if the word exists
    tfidf[word] = tf[word] * (idf[word] || 0.1);
  }

  return tfidf;
};

/**
 * Extract the top N keywords from text based on TF-IDF scores.
 * @param {string} text - The document text
 * @param {string} referenceText - A second document (for IDF calculation)
 * @param {number} topN - How many keywords to return (default: 20)
 * @returns {string[]} Top keywords sorted by importance
 */
const extractKeywords = (text, referenceText = '', topN = 25) => {
  const tokens1 = tokenize(text);
  
  if (tokens1.length === 0) return [];

  // If no reference text, just use TF (word frequency)
  if (!referenceText || referenceText === text) {
    const tf = calculateTF(tokens1);
    return Object.entries(tf)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word]) => word);
  }

  const tokens2 = tokenize(referenceText);
  const idf = calculateIDF([tokens1, tokens2]);
  const tfidf = calculateTFIDF(tokens1, idf);

  const sorted = Object.entries(tfidf)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);

  return sorted;
};

/**
 * Calculate keyword match score between resume and job description.
 * @param {string} resumeText - Cleaned resume text
 * @param {string} jdText - Cleaned job description text
 * @returns {number} Score from 0 to 100
 */
const calculateKeywordScore = (resumeText, jdText) => {
  const jdKeywords = extractKeywords(jdText, resumeText, 30);
  
  if (jdKeywords.length === 0) return 0;

  const resumeTokens = new Set(tokenize(resumeText));
  let matchCount = 0;

  for (const keyword of jdKeywords) {
    if (resumeTokens.has(keyword)) {
      matchCount++;
    }
  }

  // Add bonus for exact phrase matching if JD has multi-word keywords
  // (e.g. "React JS")
  const resumeLower = resumeText.toLowerCase();
  for (const keyword of jdKeywords) {
    if (keyword.includes(' ') && resumeLower.includes(keyword)) {
      matchCount += 0.5; // slight bonus for phrase match
    }
  }

  return Math.min(100, Math.round((matchCount / jdKeywords.length) * 100));
};


module.exports = {
  calculateTF,
  calculateIDF,
  calculateTFIDF,
  extractKeywords,
  calculateKeywordScore,
};

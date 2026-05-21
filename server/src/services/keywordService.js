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
const { extractSkills, compareSkills } = require('../utils/skillExtractor');

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
 * Extract the top N keywords from text.
 * Prioritizes actual skills first, then supplements with general TF-IDF words.
 *
 * @param {string} text - The document text
 * @param {string} referenceText - A second document (for IDF calculation)
 * @param {number} topN - How many keywords to return (default: 25)
 * @returns {string[]} Top keywords sorted by importance
 */
const extractKeywords = (text, referenceText = '', topN = 25) => {
  // 1. Extract explicit technical & soft skills from SKILLS_DICTIONARY first
  const skills = extractSkills(text);
  let keywords = [...skills];

  // If we already have enough skills to fill topN, return them
  if (keywords.length >= topN) {
    return keywords.slice(0, topN);
  }

  // 2. Otherwise, tokenize and calculate TF/TF-IDF for supplemental general words
  const tokens1 = tokenize(text);
  if (tokens1.length === 0) return keywords;

  let sortedGeneralWords = [];
  if (!referenceText || referenceText === text) {
    const tf = calculateTF(tokens1);
    sortedGeneralWords = Object.entries(tf)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
  } else {
    const tokens2 = tokenize(referenceText);
    const idf = calculateIDF([tokens1, tokens2]);
    const tfidf = calculateTFIDF(tokens1, idf);
    sortedGeneralWords = Object.entries(tfidf)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
  }

  // 3. Add non-duplicate general words until we reach topN
  const currentSet = new Set(keywords.map(kw => kw.toLowerCase()));
  for (const word of sortedGeneralWords) {
    if (keywords.length >= topN) break;
    if (!currentSet.has(word.toLowerCase())) {
      keywords.push(word);
    }
  }

  return keywords;
};

/**
 * Calculate keyword match score between resume and job description.
 * Highly robust logic combining structured skills comparison and general keywords.
 *
 * @param {string} resumeText - Cleaned resume text
 * @param {string} jdText - Cleaned job description text
 * @returns {number} Score from 0 to 100
 */
const calculateKeywordScore = (resumeText, jdText) => {
  const jdSkills = extractSkills(jdText);
  const resumeSkills = extractSkills(resumeText);

  // If the JD contains explicit skills from our dictionary, use hybrid skill-scoring
  if (jdSkills.length > 0) {
    const { matched } = compareSkills(resumeSkills, jdSkills);
    const skillMatchScore = (matched.length / jdSkills.length) * 100;

    // Supplement with TF-IDF keyword overlap to reward matching other context in the JD
    const jdKeywords = extractKeywords(jdText, resumeText, 30);
    const skillSet = new Set(jdSkills.map(s => s.toLowerCase()));
    
    // Filter down to general (non-skill) words
    const generalKeywords = jdKeywords.filter(kw => !skillSet.has(kw.toLowerCase()));
    
    let generalMatchScore = 0;
    if (generalKeywords.length > 0) {
      const resumeTokens = new Set(tokenize(resumeText).map(t => t.toLowerCase()));
      let generalMatchCount = 0;
      for (const kw of generalKeywords) {
        if (resumeTokens.has(kw.toLowerCase())) {
          generalMatchCount++;
        }
      }
      generalMatchScore = (generalMatchCount / generalKeywords.length) * 100;
    } else {
      generalMatchScore = skillMatchScore; // Fallback if no general keywords
    }

    // Weighted match: 85% Core Skills + 15% General Vocabulary Context
    const finalScore = (0.85 * skillMatchScore) + (0.15 * generalMatchScore);
    return Math.min(100, Math.max(0, Math.round(finalScore)));
  }

  // Pure fallback: standard TF-IDF unigram matching if no skills were detected in the JD
  const jdKeywords = extractKeywords(jdText, resumeText, 30);
  if (jdKeywords.length === 0) return 0;

  const resumeTokens = new Set(tokenize(resumeText).map(t => t.toLowerCase()));
  let matchCount = 0;

  for (const keyword of jdKeywords) {
    if (resumeTokens.has(keyword.toLowerCase())) {
      matchCount++;
    }
  }

  // Add bonus for exact phrase matching (for multi-word words)
  const resumeLower = resumeText.toLowerCase();
  for (const keyword of jdKeywords) {
    if (keyword.includes(' ') && resumeLower.includes(keyword.toLowerCase())) {
      matchCount += 0.5;
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

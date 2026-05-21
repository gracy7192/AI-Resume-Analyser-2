/**
 * Similarity Service — Cosine Similarity
 * -----------------------------------------
 * Measures how similar two documents are using cosine similarity.
 *
 * WHAT IS COSINE SIMILARITY?
 *   Imagine each document as an arrow (vector) in space.
 *   Cosine similarity measures the angle between the two arrows:
 *     - 1.0 = arrows point in the same direction = identical content
 *     - 0.0 = arrows are perpendicular = completely unrelated
 *     - The value is always between 0 and 1.
 *
 *   Formula: cos(θ) = (A · B) / (|A| × |B|)
 *     - A · B = dot product (multiply matching elements, sum them up)
 *     - |A|   = magnitude (length) of vector A
 *
 * HOW WE USE IT:
 *   1. Convert resume text into a TF-IDF vector.
 *   2. Convert job description text into a TF-IDF vector.
 *   3. Calculate cosine similarity between the two vectors.
 *   4. Higher similarity = resume matches the JD better.
 */

const { tokenize } = require('../utils/textCleaner');
const { calculateTF, calculateIDF } = require('./keywordService');
const { extractSkills, compareSkills } = require('../utils/skillExtractor');

/**
 * Build a TF-IDF vector for a document.
 * The vector has one dimension for every unique word across both documents.
 *
 * @param {string[]} tokens - Tokenized document
 * @param {Object} idf - IDF scores
 * @param {string[]} vocabulary - Complete vocabulary (all unique words)
 * @returns {number[]} Vector of TF-IDF values
 */
const buildVector = (tokens, idf, vocabulary) => {
  const tf = calculateTF(tokens);
  return vocabulary.map((word) => (tf[word] || 0) * (idf[word] || 0));
};

/**
 * Calculate the dot product of two vectors.
 * Dot product = sum of (a[i] × b[i]) for each dimension.
 *
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
const dotProduct = (vecA, vecB) => {
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    sum += vecA[i] * vecB[i];
  }
  return sum;
};

/**
 * Calculate the magnitude (length) of a vector.
 * Magnitude = sqrt(sum of squares)
 *
 * @param {number[]} vec
 * @returns {number}
 */
const magnitude = (vec) => {
  let sum = 0;
  for (const val of vec) {
    sum += val * val;
  }
  return Math.sqrt(sum);
};

/**
 * Calculate cosine similarity between two texts.
 * Uses intelligent skills-vector similarity when skills are present in the JD.
 * Falls back to unigram raw token TF-IDF with non-linear scaling when no skills are matched.
 *
 * @param {string} textA - First document (e.g. resume)
 * @param {string} textB - Second document (e.g. job description)
 * @returns {number} Similarity score between 0 and 1
 */
const cosineSimilarity = (textA, textB) => {
  const skillsA = extractSkills(textA);
  const skillsB = extractSkills(textB);

  // If the Job Description contains explicit skills, do high-quality skills-vector similarity
  if (skillsB.length > 0) {
    const { matched } = compareSkills(skillsA, skillsB);
    const matchRatio = matched.length / skillsB.length;

    // Binary skills-space cosine similarity
    // JD Vector is all 1s (representing all required skills). Magnitude is sqrt(N).
    // Resume Vector has 1s for matches, 0s otherwise. Magnitude is sqrt(M).
    // Dot product is M (number of matched skills).
    // Cosine = M / (sqrt(N) * sqrt(M)) = sqrt(M / N) = sqrt(matchRatio)
    const skillCosine = Math.sqrt(matchRatio);

    // Combine skill-cosine and raw skill match ratio
    const skillScore = (0.7 * skillCosine) + (0.3 * matchRatio);
    return Math.min(1.0, Math.max(0, skillScore));
  }

  // Fallback: standard unigram raw-token TF similarity
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  // Calculate shared vocabulary
  const vocabulary = [...new Set([...tokensA, ...tokensB])];
  
  const tfA = calculateTF(tokensA);
  const tfB = calculateTF(tokensB);
  
  const vecA = vocabulary.map(word => tfA[word] || 0);
  const vecB = vocabulary.map(word => tfB[word] || 0);

  const dot = dotProduct(vecA, vecB);
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);

  if (magA === 0 || magB === 0) return 0;

  // Raw unigram cosine similarity
  const rawCosine = dot / (magA * magB);

  // Jaccard similarity
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  const jaccard = intersection.size / union.size;

  // Combined raw similarity
  const rawSimilarity = (0.7 * rawCosine) + (0.3 * jaccard);
  
  // Non-linear scaling curve (y = x^0.45 * 1.5) to lift small document overlaps (e.g. 0.08 -> 0.48)
  const scaledSimilarity = Math.min(1.0, Math.pow(rawSimilarity, 0.45) * 1.5);

  return Math.min(1.0, Math.max(0, scaledSimilarity));
};


/**
 * Calculate semantic similarity score (0–100).
 * This is a wrapper that converts the raw cosine similarity to a percentage.
 *
 * @param {string} resumeText
 * @param {string} jdText
 * @returns {number} Score from 0 to 100
 */
const calculateSemanticScore = (resumeText, jdText) => {
  const similarity = cosineSimilarity(resumeText, jdText);
  return Math.round(similarity * 100);
};

module.exports = { cosineSimilarity, calculateSemanticScore };

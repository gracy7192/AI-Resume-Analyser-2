/**
 * Embedding Service — OpenAI Integration Point
 * ------------------------------------------------
 * This file is a PLACEHOLDER for future OpenAI API integration.
 *
 * RIGHT NOW: We use TF-IDF + cosine similarity (100% offline, free).
 * LATER: You can add OpenAI embeddings here for more accurate similarity.
 *
 * HOW TO UPGRADE:
 *   1. Install: npm install openai
 *   2. Set OPENAI_API_KEY in your .env file
 *   3. Uncomment the OpenAI code below
 *   4. The rest of the app will automatically use the better embeddings
 *
 * WHY this design?
 *   - The app works without any API key (TF-IDF fallback).
 *   - When you're ready, you can "plug in" OpenAI with minimal changes.
 *   - This is called the "Strategy Pattern" — swap implementations easily.
 */

const logger = require('../utils/logger');

/**
 * Check if OpenAI is configured (API key is set).
 * @returns {boolean}
 */
const isOpenAIConfigured = () => {
  return !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-'));
};

/**
 * Get embeddings for a text.
 * Currently returns null (using TF-IDF instead).
 * Uncomment the OpenAI code when you're ready to upgrade.
 *
 * @param {string} text
 * @returns {Promise<number[]|null>} Embedding vector or null
 */
const getEmbedding = async (text) => {
  if (!isOpenAIConfigured()) {
    // No API key — fall back to TF-IDF (handled in similarityService)
    return null;
  }

  // ──────────────────────────────────────────
  // UNCOMMENT THIS BLOCK WHEN YOU HAVE AN OPENAI KEY:
  // ──────────────────────────────────────────
  //
  // const { OpenAI } = require('openai');
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  //
  // try {
  //   const response = await openai.embeddings.create({
  //     model: 'text-embedding-ada-002',
  //     input: text.slice(0, 8000), // API has a token limit
  //   });
  //   return response.data[0].embedding;
  // } catch (error) {
  //   logger.error('OpenAI embedding error:', error.message);
  //   return null;
  // }

  return null;
};

module.exports = { isOpenAIConfigured, getEmbedding };

/**
 * Suggestion Service
 * --------------------
 * Generates actionable improvement suggestions based on the analysis results.
 *
 * HOW IT WORKS:
 *   1. Looks at the ATS score breakdown (keyword, semantic, experience, education).
 *   2. Identifies weak areas.
 *   3. Generates specific, actionable suggestions for improvement.
 *   4. Includes missing skills the user should add.
 *
 * WHY?
 *   - Users need guidance on HOW to improve, not just a number.
 *   - Specific suggestions lead to better resumes and higher ATS scores.
 */

/**
 * Generate improvement suggestions based on analysis results.
 *
 * @param {Object} params
 * @param {number} params.atsScore - Overall ATS score
 * @param {number} params.keywordScore - Keyword match score
 * @param {number} params.semanticScore - Semantic similarity score
 * @param {number} params.experienceScore - Experience detection score
 * @param {number} params.educationScore - Education detection score
 * @param {string[]} params.matchedSkills - Skills found in both resume & JD
 * @param {string[]} params.missingSkills - Skills in JD but not in resume
 * @returns {string} Formatted suggestions text
 */
const generateSuggestions = ({
  atsScore,
  keywordScore,
  semanticScore,
  experienceScore,
  educationScore,
  matchedSkills = [],
  missingSkills = [],
}) => {
  const suggestions = [];

  // ──────────────────────────────────────────
  // 1. Overall Score Assessment
  // ──────────────────────────────────────────
  if (atsScore >= 80) {
    suggestions.push(
      '🎉 EXCELLENT! Your resume is well-optimized for this position. ' +
      'Focus on fine-tuning specific skills to get an even higher match.'
    );
  } else if (atsScore >= 60) {
    suggestions.push(
      '👍 GOOD! Your resume has a decent match with this job description. ' +
      'There are several areas where you can improve to stand out.'
    );
  } else if (atsScore >= 40) {
    suggestions.push(
      '⚠️ NEEDS IMPROVEMENT: Your resume has a moderate match. ' +
      'Consider tailoring it more closely to the job requirements.'
    );
  } else {
    suggestions.push(
      '🔴 LOW MATCH: Your resume needs significant improvements to match this role. ' +
      'Consider revising your resume to better align with the job description.'
    );
  }

  // ──────────────────────────────────────────
  // 2. Keyword-Specific Suggestions
  // ──────────────────────────────────────────
  if (keywordScore < 50) {
    suggestions.push(
      '📝 KEYWORDS: Your resume is missing many important keywords from the job description. ' +
      'Try to naturally incorporate relevant terms and phrases that the employer is looking for.'
    );
  } else if (keywordScore < 75) {
    suggestions.push(
      '📝 KEYWORDS: You have some keyword matches, but there is room for improvement. ' +
      'Review the job description and ensure key terms appear in your resume.'
    );
  }

  // ──────────────────────────────────────────
  // 3. Missing Skills Suggestions
  // ──────────────────────────────────────────
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 10); // Show top 10 missing
    suggestions.push(
      `🔧 MISSING SKILLS: Add these skills to your resume if you have them: ` +
      topMissing.map((s) => `"${s}"`).join(', ') + '. ' +
      'Only add skills you genuinely possess — honesty is key!'
    );
  }

  // ──────────────────────────────────────────
  // 4. Semantic Similarity Suggestions
  // ──────────────────────────────────────────
  if (semanticScore < 40) {
    suggestions.push(
      '📊 CONTENT ALIGNMENT: Your resume content is not closely aligned with the job description. ' +
      'Try rewriting your bullet points to use similar language and terminology as the job posting.'
    );
  } else if (semanticScore < 65) {
    suggestions.push(
      '📊 CONTENT ALIGNMENT: There is moderate alignment between your resume and the JD. ' +
      'Consider rephrasing some sections to better mirror the job requirements.'
    );
  }

  // ──────────────────────────────────────────
  // 5. Experience Suggestions
  // ──────────────────────────────────────────
  if (experienceScore < 50) {
    suggestions.push(
      '💼 EXPERIENCE: Your experience section could be stronger. Consider:\n' +
      '  • Start bullet points with strong action verbs (developed, led, implemented)\n' +
      '  • Include specific metrics and achievements (e.g., "increased sales by 25%")\n' +
      '  • Clearly state your years of experience\n' +
      '  • Add relevant job titles and company names'
    );
  }

  // ──────────────────────────────────────────
  // 6. Education Suggestions
  // ──────────────────────────────────────────
  if (educationScore < 50) {
    suggestions.push(
      '🎓 EDUCATION: Strengthen your education section:\n' +
      '  • Include your degree name, major, and university\n' +
      '  • Add relevant certifications\n' +
      '  • Mention GPA if it is 3.0 or above\n' +
      '  • List any relevant coursework or honors'
    );
  }

  // ──────────────────────────────────────────
  // 7. General Best Practices
  // ──────────────────────────────────────────
  suggestions.push(
    '💡 GENERAL TIPS:\n' +
    '  • Use a clean, ATS-friendly resume format (no tables, columns, or graphics)\n' +
    '  • Keep your resume to 1-2 pages\n' +
    '  • Use standard section headings (Experience, Education, Skills)\n' +
    '  • Tailor your resume for each job application\n' +
    '  • Proofread for spelling and grammar errors'
  );

  return suggestions.join('\n\n');
};

module.exports = { generateSuggestions };

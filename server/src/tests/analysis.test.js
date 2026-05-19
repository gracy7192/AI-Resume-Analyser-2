const { calculateKeywordScore, extractKeywords } = require('../services/keywordService');
const { calculateSemanticScore, cosineSimilarity } = require('../services/similarityService');
const { calculateExperienceScore, calculateEducationScore, calculateATSScore } = require('../services/scoringService');

describe('AI ATS Scoring Engine', () => {
  
  const sampleResume = `
    John Doe
    Software Engineer with 5 years of experience in web development.
    Skills: JavaScript, React, Node.js, Express, MongoDB.
    Experience: Developed scalable web applications using React and Node.js.
    Education: Bachelor of Science in Computer Science.
  `;

  const sampleJD = `
    We are looking for a Software Engineer with experience in JavaScript, React, and Node.js.
    Must have a Bachelor's degree in Computer Science.
    Database experience with MongoDB or PostgreSQL is a plus.
  `;

  const poorResume = `
    Jane Smith
    Graphic Designer.
    Skills: Photoshop, Illustrator, Figma.
    Experience: Created logos and branding materials.
    Education: High School Diploma.
  `;

  describe('Keyword Extraction & TF-IDF', () => {
    it('should extract correct keywords from text', () => {
      const keywords = extractKeywords(sampleJD, '', 10);
      expect(keywords.length).toBeGreaterThan(0);
      // Check if some expected tech words are extracted (lowercase)
      expect(keywords).toContain('react');
      expect(keywords).toContain('node.js');
      expect(keywords).toContain('javascript');
    });

    it('should calculate keyword match score > 0 for matching resume', () => {
      const score = calculateKeywordScore(sampleResume, sampleJD);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate very low keyword score for unrelated resume', () => {
      const score = calculateKeywordScore(poorResume, sampleJD);
      expect(score).toBeLessThan(20);
    });
  });

  describe('Semantic Similarity', () => {
    it('should calculate higher cosine similarity for matching resume', () => {
      const goodScore = calculateSemanticScore(sampleResume, sampleJD);
      const badScore = calculateSemanticScore(poorResume, sampleJD);
      
      expect(goodScore).toBeGreaterThan(badScore);
      expect(goodScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Pattern Matching (Experience & Education)', () => {
    it('should detect 5 years of experience and developer titles', () => {
      const expScore = calculateExperienceScore(sampleResume, sampleJD);
      expect(expScore).toBeGreaterThan(50); // Should get points for "5 years", "Engineer", "Developed"
    });

    it('should detect Bachelors degree', () => {
      const eduScore = calculateEducationScore(sampleResume, sampleJD);
      expect(eduScore).toBeGreaterThan(40); // Should get points for "Bachelor" and "Education" section
    });
  });

  describe('Final ATS Score', () => {
    it('should calculate a combined ATS score', () => {
      const result = calculateATSScore(sampleResume, sampleJD);
      
      expect(result.atsScore).toBeDefined();
      expect(result.keywordScore).toBeDefined();
      expect(result.semanticScore).toBeDefined();
      expect(result.experienceScore).toBeDefined();
      expect(result.educationScore).toBeDefined();
      
      // The good resume should score decently against the JD
      expect(result.atsScore).toBeGreaterThan(40);
    });
  });

});

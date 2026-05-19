/**
 * Skill Extractor Utility
 * ------------------------
 * Extracts technical and soft skills from text using a curated dictionary.
 *
 * HOW IT WORKS:
 *   1. We maintain a large dictionary of known skills (200+ entries).
 *   2. We search the text for each skill using case-insensitive matching.
 *   3. Multi-word skills (e.g. "machine learning") are matched as phrases.
 *
 * WHY a dictionary approach?
 *   - Simple, fast, and doesn't need an API.
 *   - Works offline (no OpenAI key needed).
 *   - Easy to extend — just add new skills to the list.
 */

// ──────────────────────────────────────────────────────────
// CURATED SKILLS DICTIONARY
// ──────────────────────────────────────────────────────────
const SKILLS_DICTIONARY = {
  // --- Programming Languages ---
  programming: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go',
    'golang', 'rust', 'swift', 'kotlin', 'php', 'scala', 'r', 'matlab',
    'perl', 'dart', 'lua', 'haskell', 'elixir', 'clojure', 'objective-c',
    'assembly', 'fortran', 'cobol', 'visual basic', 'vb.net', 'f#',
  ],

  // --- Frontend ---
  frontend: [
    'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind',
    'tailwindcss', 'bootstrap', 'material ui', 'mui', 'chakra ui',
    'react', 'reactjs', 'react.js', 'next.js', 'nextjs', 'gatsby',
    'angular', 'angularjs', 'vue', 'vuejs', 'vue.js', 'nuxt', 'nuxtjs',
    'svelte', 'jquery', 'webpack', 'vite', 'parcel', 'rollup',
    'redux', 'mobx', 'zustand', 'context api', 'framer motion',
    'three.js', 'webgl', 'canvas', 'd3.js', 'chart.js',
    'responsive design', 'progressive web app', 'pwa',
    'web accessibility', 'wcag', 'aria',
  ],

  // --- Backend ---
  backend: [
    'node.js', 'nodejs', 'express', 'expressjs', 'express.js',
    'django', 'flask', 'fastapi', 'spring', 'spring boot',
    'asp.net', '.net', '.net core', 'laravel', 'symfony',
    'ruby on rails', 'rails', 'gin', 'fiber', 'koa', 'nestjs',
    'graphql', 'rest', 'restful', 'rest api', 'api design',
    'microservices', 'serverless', 'websocket', 'socket.io',
    'grpc', 'soap', 'oauth', 'jwt', 'authentication', 'authorization',
  ],

  // --- Database ---
  database: [
    'mysql', 'postgresql', 'postgres', 'mongodb', 'sqlite', 'oracle',
    'sql server', 'mssql', 'mariadb', 'redis', 'cassandra', 'couchdb',
    'dynamodb', 'firebase', 'firestore', 'supabase', 'neo4j',
    'elasticsearch', 'memcached', 'influxdb',
    'sql', 'nosql', 'orm', 'sequelize', 'mongoose', 'prisma',
    'typeorm', 'knex', 'database design', 'data modeling',
  ],

  // --- DevOps & Cloud ---
  devops: [
    'aws', 'amazon web services', 'azure', 'google cloud', 'gcp',
    'docker', 'kubernetes', 'k8s', 'terraform', 'ansible',
    'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci',
    'ci/cd', 'continuous integration', 'continuous deployment',
    'linux', 'unix', 'bash', 'shell scripting', 'powershell',
    'nginx', 'apache', 'load balancing', 'reverse proxy',
    'monitoring', 'prometheus', 'grafana', 'datadog', 'new relic',
    'logging', 'elk stack', 'cloudflare', 'vercel', 'netlify', 'heroku',
    'digitalocean', 'linode',
  ],

  // --- Data Science / AI / ML ---
  datascience: [
    'machine learning', 'deep learning', 'artificial intelligence', 'ai',
    'neural network', 'natural language processing', 'nlp',
    'computer vision', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
    'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter',
    'data analysis', 'data visualization', 'big data', 'hadoop', 'spark',
    'data mining', 'feature engineering', 'model training',
    'classification', 'regression', 'clustering', 'reinforcement learning',
    'generative ai', 'large language model', 'llm', 'gpt', 'bert',
    'transformers', 'hugging face', 'langchain', 'openai',
    'statistical analysis', 'a/b testing', 'hypothesis testing',
  ],

  // --- Mobile Development ---
  mobile: [
    'react native', 'flutter', 'swift', 'swiftui', 'kotlin',
    'android', 'ios', 'xamarin', 'ionic', 'cordova',
    'mobile development', 'app development', 'responsive design',
  ],

  // --- Testing ---
  testing: [
    'unit testing', 'integration testing', 'end-to-end testing', 'e2e',
    'jest', 'mocha', 'chai', 'cypress', 'selenium', 'playwright',
    'pytest', 'junit', 'testng', 'rspec',
    'tdd', 'test-driven development', 'bdd', 'behavior-driven development',
    'qa', 'quality assurance', 'test automation', 'load testing',
    'performance testing', 'security testing', 'code review',
  ],

  // --- Tools & Practices ---
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'svn',
    'jira', 'confluence', 'trello', 'asana', 'notion', 'slack',
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    'vs code', 'visual studio', 'intellij', 'vim', 'emacs',
    'postman', 'swagger', 'insomnia',
    'agile', 'scrum', 'kanban', 'waterfall', 'sprint planning',
    'design patterns', 'solid principles', 'clean code',
    'object-oriented programming', 'oop', 'functional programming',
    'data structures', 'algorithms', 'system design',
  ],

  // --- Soft Skills ---
  soft: [
    'communication', 'teamwork', 'leadership', 'problem solving',
    'critical thinking', 'time management', 'project management',
    'presentation', 'collaboration', 'mentoring', 'adaptability',
    'attention to detail', 'analytical thinking', 'creativity',
    'decision making', 'conflict resolution', 'negotiation',
    'stakeholder management', 'client relations', 'strategic planning',
  ],

  // --- Security ---
  security: [
    'cybersecurity', 'penetration testing', 'ethical hacking',
    'encryption', 'ssl', 'tls', 'https', 'oauth2', 'saml',
    'xss', 'csrf', 'sql injection', 'owasp',
    'vulnerability assessment', 'security audit', 'compliance',
    'gdpr', 'hipaa', 'soc2', 'pci dss',
  ],
};

/**
 * Get a flat array of ALL known skills (across all categories).
 * @returns {string[]}
 */
const getAllSkills = () => {
  const all = [];
  for (const category of Object.values(SKILLS_DICTIONARY)) {
    all.push(...category);
  }
  return all;
};

/**
 * Extract skills found in the given text.
 * @param {string} text - The resume or job description text
 * @returns {string[]} Array of found skills (lowercase, deduplicated)
 */
const extractSkills = (text) => {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  const allSkills = getAllSkills();
  const foundSkills = new Set();

  for (const skill of allSkills) {
    // Use word boundary regex for accurate matching
    // For multi-word skills, we do a simple includes check
    if (skill.includes(' ') || skill.includes('.') || skill.includes('+') || skill.includes('#')) {
      // Multi-word or special-char skills: simple includes
      if (lowerText.includes(skill)) {
        foundSkills.add(skill);
      }
    } else {
      // Single-word skills: use word boundary matching
      const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i');
      if (regex.test(lowerText)) {
        foundSkills.add(skill);
      }
    }
  }

  return Array.from(foundSkills);
};

/**
 * Compare skills from resume against skills from job description.
 * @param {string[]} resumeSkills  - Skills found in the resume
 * @param {string[]} jdSkills      - Skills found in the job description
 * @returns {{ matched: string[], missing: string[] }}
 */
const compareSkills = (resumeSkills, jdSkills) => {
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  const matched = [];
  const missing = [];

  for (const skill of jdSkills) {
    if (resumeSet.has(skill.toLowerCase())) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  return { matched, missing };
};

/**
 * Escape special regex characters in a string.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  SKILLS_DICTIONARY,
  getAllSkills,
  extractSkills,
  compareSkills,
};

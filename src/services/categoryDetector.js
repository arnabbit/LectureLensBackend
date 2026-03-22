const llm = require('./llm');
const { categoryDetectPrompt } = require('../utils/prompts');

const cache = new Map();

const VALID_CATEGORIES = new Set(['dsa', 'language', 'photography', 'other']);

async function detect(courseId, courseName) {
  const cacheKey = String(courseId);

  if (cache.has(cacheKey)) {
    console.log(`[categoryDetector] Cache hit for courseId ${courseId}: "${cache.get(cacheKey)}"`);
    return cache.get(cacheKey);
  }

  const messages = [
    { role: 'user', content: categoryDetectPrompt(courseName) },
  ];

  const response = await llm.chat(messages);
  const category = response.trim().toLowerCase().split(/\s+/)[0];

  const resolved = VALID_CATEGORIES.has(category) ? category : 'other';

  cache.set(cacheKey, resolved);
  return resolved;
}

module.exports = { detect };

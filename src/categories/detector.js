const llm = require('../services/llm');
const { categoryDetectPrompt } = require('../utils/prompts');

const categoryCache = new Map();
const VALID_CATEGORIES = new Set(['dsa', 'generic']);

async function detectCategory(courseId, courseName) {
  const cacheKey = String(courseId);

  if (categoryCache.has(cacheKey)) {
    console.log(`[categoryDetector] Cache hit for courseId ${courseId}: "${categoryCache.get(cacheKey)}"`);
    return categoryCache.get(cacheKey);
  }

  try {
    const messages = [
      { role: 'user', content: categoryDetectPrompt(courseName) },
    ];

    const response = await llm.chat(messages);
    const category = response.trim().toLowerCase().split(/\s+/)[0];

    const resolved = VALID_CATEGORIES.has(category) ? category : 'generic';

    categoryCache.set(cacheKey, resolved);
    return resolved;
  } catch (error) {
    console.error('[categoryDetector] Category detection failed, defaulting to "generic":', error);
    return 'generic';
  }
}

function clearCategoryCache() {
  categoryCache.clear();
}

module.exports = { detectCategory, clearCategoryCache };

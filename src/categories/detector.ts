import { llm } from '../services/llm';
import { categoryDetectPrompt } from '../utils/prompts';

// Cache for storing detected categories per courseId
const categoryCache = new Map<string, string>();

// Valid categories that the system supports
const VALID_CATEGORIES = new Set(['dsa', 'generic']);

/**
 * Detects the category of a course based on its name
 * Uses LLM to classify and caches results per courseId
 */
export async function detectCategory(courseId: string, courseName: string): Promise<string> {
  const cacheKey = String(courseId);

  // Return cached result if available
  if (categoryCache.has(cacheKey)) {
    console.log(`[categoryDetector] Cache hit for courseId ${courseId}: "${categoryCache.get(cacheKey)}"`);
    return categoryCache.get(cacheKey)!;
  }

  try {
    const messages = [
      { role: 'user', content: categoryDetectPrompt(courseName) },
    ];

    const response = await llm.chat(messages);
    const category = response.trim().toLowerCase().split(/\s+/)[0];

    // Validate against known categories, default to 'generic' for unknown
    const resolved = VALID_CATEGORIES.has(category) ? category : 'generic';

    // Cache the result
    categoryCache.set(cacheKey, resolved);
    return resolved;
  } catch (error) {
    console.error('[categoryDetector] Category detection failed, defaulting to "generic":', error);
    return 'generic';
  }
}

/**
 * Clears the category detection cache
 * Useful for testing or when category mappings change
 */
export function clearCategoryCache() {
  categoryCache.clear();
}
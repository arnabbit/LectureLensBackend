import { detectCategory } from './detector';
import { getCategory, getAllCategories, getCategoryIds } from './registry';
import { CategoryModule } from './types';

/**
 * Routes a course to the appropriate category module.
 * Combines category detection with registry lookup.
 */
export async function routeCourse(courseId: string, courseName: string): Promise<CategoryModule> {
  // Step 1: Detect the category based on course name
  const categoryId = await detectCategory(courseId, courseName);

  // Step 2: Look up the category module in the registry (already falls back to generic)
  const categoryModule = getCategory(categoryId);

  if (categoryModule) {
    return categoryModule;
  }

  // Step 3: Final fallback — shouldn't happen since getCategory already falls back
  console.warn(`[categoryRouter] All category lookups failed, returning undefined`);
  return undefined as CategoryModule;
}

/**
 * Synchronous version for when category is already known
 * @param courseId The course ID
 * @param categoryId The pre-determined category ID
 * @returns The category module
 */
export function routeByCategoryId(courseId: string, categoryId: string): CategoryModule {
  const categoryModule = getCategory(categoryId);

  if (!categoryModule) {
    console.warn(`[categoryRouter] No module found for category "${categoryId}", falling back to generic`);
    // Fallback to generic category
    return getCategory('generic')!;
  }

  return categoryModule;
}
import { CategoryModule } from './types';
import fs from 'fs';
import path from 'path';

// Cache for storing category modules
const categoryRegistry = new Map<string, CategoryModule>();

/**
 * Automatically discovers and loads category modules from src/categories/
 * Each subdirectory is treated as a potential category module
 */
export function loadCategories(): void {
  const categoriesPath = path.join(process.cwd(), 'src', 'categories');

  try {
    const entries = fs.readdirSync(categoriesPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const categoryId = entry.name;
        const modulePath = path.join(categoriesPath, categoryId, 'index.ts');

        try {
          // Dynamically import the category module
          const module = require(modulePath);

          // Assume the module exports a class that extends CategoryProcessor
          if (module && module.default) {
            const categoryInstance = new module.default();
            categoryRegistry.set(categoryId, categoryInstance);
            console.log(`[categoryRegistry] Loaded category: ${categoryId}`);
          } else if (module && typeof module === 'object' && module.config) {
            // Handle case where module exports an instance directly
            categoryRegistry.set(categoryId, module as CategoryModule);
            console.log(`[categoryRegistry] Loaded category: ${categoryId}`);
          }
        } catch (error) {
          console.error(`[categoryRegistry] Failed to load category ${categoryId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('[categoryRegistry] Failed to scan categories directory:', error);
  }
}

/**
 * Gets a category module by its ID.
 * Falls back to generic if the requested category is not found.
 * @param id The category ID (e.g., 'dsa', 'generic')
 * @returns The category module
 */
export function getCategory(id: string): CategoryModule | undefined {
  const category = categoryRegistry.get(id);
  if (category) return category;

  // Fallback: return generic category if the requested one doesn't exist
  const generic = categoryRegistry.get('generic');
  if (generic) {
    console.log(`[categoryRegistry] Category "${id}" not found, falling back to generic`);
    return generic;
  }

  return undefined;
}

/**
 * Registers a category module manually
 * @param id The category ID
 * @param module The category module instance
 */
export function registerCategory(id: string, module: CategoryModule): void {
  categoryRegistry.set(id, module);
  console.log(`[categoryRegistry] Registered category: ${id}`);
}

/**
 * Gets all registered category IDs
 * @returns Array of category IDs
 */
export function getCategoryIds(): string[] {
  return Array.from(categoryRegistry.keys());
}

/**
 * Gets all registered category modules
 * @returns Array of category modules
 */
export function getAllCategories(): CategoryModule[] {
  return Array.from(categoryRegistry.values());
}

/**
 * Gets all registered category modules
 * @returns Array of category modules
 */
export function getAllCategories(): CategoryModule[] {
  return Array.from(categoryRegistry.values());
}

/**
 * Clears the category registry
 * Useful for testing
 */
export function clearRegistry(): void {
  categoryRegistry.clear();
}

// Auto-load categories when this module is imported
loadCategories();
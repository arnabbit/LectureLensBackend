const fs = require('fs');
const path = require('path');

const categoryRegistry = new Map();

function loadCategories() {
  const categoriesPath = path.join(__dirname);

  try {
    const entries = fs.readdirSync(categoriesPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const categoryId = entry.name;
        const modulePath = path.join(categoriesPath, categoryId, 'index.js');

        if (!fs.existsSync(modulePath)) continue;

        try {
          const mod = require(modulePath);
          if (mod && mod.config) {
            categoryRegistry.set(categoryId, mod);
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

function getCategory(id) {
  const category = categoryRegistry.get(id);
  if (category) return category;

  const generic = categoryRegistry.get('generic');
  if (generic) {
    console.log(`[categoryRegistry] Category "${id}" not found, falling back to generic`);
    return generic;
  }

  return undefined;
}

function registerCategory(id, module) {
  categoryRegistry.set(id, module);
  console.log(`[categoryRegistry] Registered category: ${id}`);
}

function getCategoryIds() {
  return Array.from(categoryRegistry.keys());
}

function getAllCategories() {
  return Array.from(categoryRegistry.values());
}

function clearRegistry() {
  categoryRegistry.clear();
}

loadCategories();

module.exports = { getCategory, registerCategory, getCategoryIds, getAllCategories, clearRegistry, loadCategories };

require('dotenv').config();

module.exports = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/transcript-processor',
  PORT: process.env.PORT || 3001,

  // Category-related settings
  ENABLE_CATEGORY_ROUTER: process.env.ENABLE_CATEGORY_ROUTER !== 'false', // default: true
  FALLBACK_CATEGORY: process.env.FALLBACK_CATEGORY || 'generic', // default: 'generic'
  CATEGORY_CACHE_TTL: parseInt(process.env.CATEGORY_CACHE_TTL, 10) || 3600, // default: 3600 seconds
};

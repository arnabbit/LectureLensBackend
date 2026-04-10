require('dotenv').config();

module.exports = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/transcript-processor',
  PORT: process.env.PORT || 3001,
  LLM_MODEL: process.env.LLM_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
};

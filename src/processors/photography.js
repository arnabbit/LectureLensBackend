const BaseProcessor = require('./base');
const llm = require('../services/llm');
const { photographyExtractPrompt } = require('../utils/prompts');

class PhotographyProcessor extends BaseProcessor {
  async process(chunks) {
    const allProblems = [];

    for (const chunk of chunks) {
      const messages = [
        { role: 'user', content: photographyExtractPrompt(chunk) },
      ];

      let response;
      try {
        response = await llm.chat(messages, { json: true });
      } catch (err) {
        console.error('[PhotographyProcessor] LLM call failed for chunk:', err.message);
        continue;
      }

      let parsed;
      try {
        parsed = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (err) {
        console.error('[PhotographyProcessor] JSON parse failed:', err.message, 'Response:', response);
        continue;
      }

      if (parsed && Array.isArray(parsed.problems)) {
        allProblems.push(...parsed.problems);
      }
    }

    return allProblems;
  }
}

module.exports = PhotographyProcessor;

const CategoryProcessor = require('../base');
const llm = require('../../services/llm');
const { genericExtractPrompt } = require('./prompts');
const { GenericQuizGenerator } = require('./quiz');

class GenericCategory extends CategoryProcessor {
  constructor() {
    super();
    this.config = {
      id: 'generic',
      name: 'Generic',
      description: 'Universal extractor for any course type without a specialized module',
    };
  }

  async extract(transcript) {
    try {
      const messages = [
        { role: 'user', content: genericExtractPrompt(transcript) },
      ];

      const response = await llm.chat(messages, { json: true });

      let parsed;
      try {
        parsed = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (err) {
        console.error('[GenericCategory] JSON parse failed:', err.message);
        return { concepts: [], metadata: { error: 'Failed to parse LLM response' } };
      }

      // Map to Problem-compatible shape so it fits the DB schema
      const concepts = this.mapToProblemShape(parsed);

      return {
        concepts,
        metadata: {
          processedAt: new Date().toISOString(),
          processor: 'Generic',
        },
      };
    } catch (error) {
      console.error('[GenericCategory] Processing failed:', error);
      return { concepts: [], metadata: { error: error.message } };
    }
  }

  async generateQuiz(result) {
    return GenericQuizGenerator.generateQuiz(result);
  }

  /**
   * Maps generic concepts to Problem-compatible shape:
   * { problemName, problemStatement, approaches[], keyInsights[] }
   */
  mapToProblemShape(raw) {
    if (!raw || !Array.isArray(raw.concepts)) return [];

    return raw.concepts.map((c) => ({
      problemName: c.name || '',
      problemStatement: c.explanation || '',
      approaches: [{
        name: 'Overview',
        complexity: { time: 'N/A', space: 'N/A' },
        optimisationScore: 1,
        explanation: c.explanation || '',
      }],
      keyInsights: Array.isArray(c.keyTakeaways) ? c.keyTakeaways : [],
    }));
  }
}

const instance = new GenericCategory();
module.exports = instance;

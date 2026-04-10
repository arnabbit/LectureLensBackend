const CategoryProcessor = require('../base');
const DSAProcessor = require('../../processors/dsa');
const { DSAQuizGenerator } = require('./quiz');

class DSACategory extends CategoryProcessor {
  constructor() {
    super();
    this.config = {
      id: 'dsa',
      name: 'Data Structures and Algorithms',
      description: 'Specialized processor for DSA content including problem statements, approaches, and complexity analysis',
    };
    this.processor = new DSAProcessor();
  }

  async extract(transcript) {
    try {
      const problems = await this.processor.process([transcript]);

      return {
        concepts: problems,
        metadata: {
          processedAt: new Date().toISOString(),
          processor: 'DSA',
        },
      };
    } catch (error) {
      console.error('[DSACategory] Processing failed:', error);
      return {
        concepts: [],
        metadata: {
          error: error.message,
          processedAt: new Date().toISOString(),
        },
      };
    }
  }

  async generateQuiz(result) {
    return DSAQuizGenerator.generateQuiz(result);
  }
}

const instance = new DSACategory();
module.exports = instance;

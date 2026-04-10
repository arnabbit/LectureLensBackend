class CategoryProcessor {
  constructor() {
    this.config = null; // subclass must set { id, name, description }
    this.maxRetries = 3;
  }

  async extract(transcript) {
    throw new Error('extract() must be implemented by subclass');
  }

  async generateQuiz(result) {
    throw new Error('generateQuiz() must be implemented by subclass');
  }

  async processWithRetry(transcript) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.extract(transcript);
      } catch (error) {
        lastError = error;
        console.log(`[${this.config.id}] Attempt ${attempt} failed: ${error}`);
      }
    }

    throw new Error(`Failed after ${this.maxRetries} attempts: ${lastError}`);
  }

  validate(result) {
    if (!result.concepts || result.concepts.length === 0) {
      throw new Error(`[${this.config.id}] No concepts extracted`);
    }

    for (const concept of result.concepts) {
      if (!concept.name && !concept.problemName) {
        throw new Error(`[${this.config.id}] Concept missing name`);
      }
    }

    return true;
  }
}

module.exports = CategoryProcessor;

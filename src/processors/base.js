class BaseProcessor {
  /**
   * Extract problems from an array of transcript chunks.
   * @param {string[]} chunks
   * @returns {Promise<Object[]>} array of problem objects
   */
  async process(chunks) {
    throw new Error('process() must be implemented by subclass');
  }

  /**
   * Process with retry logic and validation.
   * @param {string[]} chunks
   * @param {Object} validator - service with validate(extraction, rawTranscript)
   * @param {string} rawTranscript
   * @param {number} maxRetries
   * @returns {Promise<Object[]>}
   */
  async processWithRetry(chunks, validator, rawTranscript, maxRetries = 3) {
    let lastFeedback = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let problems;

      try {
        // On retry, prepend feedback as a hint to the chunks
        const chunksToProcess = lastFeedback
          ? [`[Previous attempt feedback: ${lastFeedback}]\n\n${chunks[0]}`, ...chunks.slice(1)]
          : chunks;

        problems = await this.process(chunksToProcess);
      } catch (err) {
        console.error(`[processor] Attempt ${attempt}/${maxRetries} - process() error:`, err.message);
        lastFeedback = `Processing error: ${err.message}`;
        if (attempt === maxRetries) {
          throw new Error(`Failed after ${maxRetries} attempts. Last error: ${err.message}`);
        }
        continue;
      }

      if (!problems || problems.length === 0) {
        lastFeedback = 'No problems were extracted. Try harder to find relevant content.';
        if (attempt === maxRetries) {
          return [];
        }
        continue;
      }

      // Validate the first problem as a representative sample
      let validationResult;
      try {
        validationResult = await validator.validate(problems[0], rawTranscript);
      } catch (err) {
        console.error(`[processor] Attempt ${attempt}/${maxRetries} - validation error:`, err.message);
        validationResult = { valid: true, feedback: '' }; // Proceed if validator itself fails
      }

      if (validationResult.valid) {
        console.log(`[processor] Attempt ${attempt}/${maxRetries} - validation passed, ${problems.length} problems extracted`);
        return problems;
      }

      lastFeedback = validationResult.feedback || 'Validation failed with no specific feedback.';
      console.warn(`[processor] Attempt ${attempt}/${maxRetries} - validation failed: ${lastFeedback}`);

      if (attempt === maxRetries) {
        throw new Error(`Validation failed after ${maxRetries} attempts. Feedback: ${lastFeedback}`);
      }
    }

    throw new Error(`processWithRetry exhausted ${maxRetries} attempts`);
  }
}

module.exports = BaseProcessor;

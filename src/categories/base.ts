import { CategoryConfig, CategoryModule, ExtractionResult, QuizItem } from './types';

// Abstract base class for category processors
export abstract class CategoryProcessor implements CategoryModule {
  abstract config: CategoryConfig;
  protected maxRetries = 3;

  // Abstract methods that each category must implement
  abstract extract(transcript: string): Promise<ExtractionResult<any>>;
  abstract generateQuiz(result: ExtractionResult<any>): Promise<QuizItem[]>;

  // Shared utility methods that every category gets for free

  /**
   * Extract with automatic retry on failure.
   * If extraction fails, try again up to maxRetries times.
   */
  async processWithRetry(transcript: string): Promise<ExtractionResult<any>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.extract(transcript);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.log(`[${this.config.id}] Attempt ${attempt} failed: ${error}`);
      }
    }

    throw new Error(`Failed after ${this.maxRetries} attempts: ${lastError}`);
  }

  /**
   * Validate that extraction result has required fields.
   * Returns true if valid, throws with clear error if not.
   */
  validate(result: ExtractionResult<any>): boolean {
    if (!result.concepts || result.concepts.length === 0) {
      throw new Error(`[${this.config.id}] No concepts extracted`);
    }

    for (const concept of result.concepts) {
      if (!concept.name || !concept.explanation) {
        throw new Error(`[${this.config.id}] Concept missing name or explanation`);
      }
    }

    return true;
  }

  protected sanitizeConcept(concept: any): any {
    // Basic sanitization - can be overridden by specific categories
    return concept;
  }
}
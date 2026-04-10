import { CategoryProcessor } from '../base';
import { DSAExtractionResult, DSAProblem } from './types';
import { DSAProcessor } from '../../processors/dsa';
import { DSAQuizItem } from './types';
import { DSAQuizGenerator } from './quiz';

// DSA Category Module implementing the CategoryModule interface
export class DSACategory extends CategoryProcessor {
  config = {
    id: 'dsa',
    name: 'Data Structures and Algorithms',
    description: 'Specialized processor for DSA content including problem statements, approaches, and complexity analysis',
    icon: '💻'
  };

  private processor: DSAProcessor;
  private quizGenerator: typeof DSAQuizGenerator;

  constructor() {
    super();
    this.processor = new DSAProcessor();
    this.quizGenerator = DSAQuizGenerator;
  }

  /**
   * Extract DSA problems and approaches from transcript
   * Maps existing DSAProcessor output to new DSAExtractionResult type
   */
  async extract(transcript: string): Promise<DSAExtractionResult> {
    try {
      // Use the existing DSA processor logic
      const chunks = [transcript];
      const problems = await this.processor.process(chunks);

      // Map to DSAExtractionResult format
      const result: DSAExtractionResult = {
        concepts: problems as DSAProblem[],
        metadata: {
          processedAt: new Date().toISOString(),
          processor: 'DSA',
          chunkCount: chunks.length
        }
      };

      return result;
    } catch (error) {
      console.error('[DSACategory] Processing failed:', error);
      // Return empty result on failure
      return {
        concepts: [],
        metadata: {
          error: error.message,
          processedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate quiz questions from extracted DSA content
   * Uses the DSAQuizGenerator to create quiz items
   */
  async generateQuiz(result: DSAExtractionResult): Promise<DSAQuizItem[]> {
    return this.quizGenerator.generateQuiz(result);
  }
}

// Export the category module for registry discovery
export default DSACategory;
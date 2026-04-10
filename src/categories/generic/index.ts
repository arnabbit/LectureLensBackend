import { CategoryProcessor } from '../base';
import { GenericExtractionResult, GenericConcept } from './types';
import { GenericQuizItem } from './types';
import { GenericQuizGenerator } from './quiz';
import llm from '../../services/llm';
import { genericExtractPrompt } from './prompts';

// Generic Category Module implementing the CategoryModule interface
export class GenericCategory extends CategoryProcessor {
  config = {
    id: 'generic',
    name: 'Generic',
    description: 'Universal extractor for any course type without a specialized module',
    icon: '📚'
  };

  private quizGenerator: typeof GenericQuizGenerator;

  constructor() {
    super();
    this.quizGenerator = GenericQuizGenerator;
  }

  /**
   * Extract generic concepts from transcript
   * LLM prompt: extract concepts, explanations, key takeaways
   */
  async extract(transcript: string): Promise<GenericExtractionResult> {
    try {
      const messages = [
        { role: 'user', content: genericExtractPrompt(transcript) },
      ];

      const response = await llm.chat(messages, { json: true });

      let parsed;
      try {
        parsed = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (err) {
        console.error('[GenericCategory] JSON parse failed:', err.message, 'Response:', response);
        // Return empty result on parse failure
        return {
          concepts: [],
          metadata: {
            error: 'Failed to parse LLM response',
            processedAt: new Date().toISOString()
          }
        };
      }

      // Map to GenericExtractionResult format
      const result: GenericExtractionResult = {
        concepts: this.mapToGenericConcepts(parsed),
        metadata: {
          processedAt: new Date().toISOString(),
          processor: 'Generic',
          rawResponse: response
        }
      };

      return result;
    } catch (error) {
      console.error('[GenericCategory] Processing failed:', error);
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
   * Generate quiz questions from extracted generic content
   * Quiz types: "What was the main concept?", "Explain X", "True/False"
   */
  async generateQuiz(result: GenericExtractionResult): Promise<GenericQuizItem[]> {
    return this.quizGenerator.generateQuiz(result);
  }

  /**
   * Maps LLM response to GenericConcept array
   */
  private mapToGenericConcepts(raw: any): GenericConcept[] {
    if (!raw || !Array.isArray(raw.concepts)) {
      return [];
    }

    return raw.concepts.map((concept: any) => ({
      name: concept.name || '',
      explanation: concept.explanation || '',
      keyTakeaways: Array.isArray(concept.keyTakeaways) ? concept.keyTakeaways : []
    }));
  }
}

// Export the category module for registry discovery
export default GenericCategory;
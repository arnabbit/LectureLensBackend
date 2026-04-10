import { GenericCategory } from './index';
import { GenericExtractionResult, GenericQuizItem } from './types';
import { gradeAnswerPrompt, rephrasePrompt, rephraseApproachPrompt } from '../../utils/prompts';
import llm from '../../services/llm';

/**
 * Generic Quiz Generator
 * Handles quiz generation and answer grading for generic content
 */
export class GenericQuizGenerator {
  /**
   * Generate quiz questions from extracted generic content
   * Creates quiz items based on concepts and key takeaways
   */
  static async generateQuiz(result: GenericExtractionResult): Promise<GenericQuizItem[]> {
    const quizItems: GenericQuizItem[] = [];

    for (const concept of result.concepts) {
      // Create a "key_point" quiz about the main concept
      quizItems.push({
        question: `What was the main concept discussed?`,
        options: [
          concept.name,
          `A related but different concept`,
          `An unrelated concept`
        ],
        correctAnswer: 0,
        explanation: concept.explanation,
        type: 'key_point',
        conceptName: concept.name
      });

      // Create a "recall" question for each key takeaway
      for (const takeaway of concept.keyTakeaways) {
        quizItems.push({
          question: `Recall: What was the key takeaway about ${takeaway}?`,
          options: [
            takeaway,
            `An incorrect explanation`,
            `A partially correct explanation`
          ],
          correctAnswer: 0,
          explanation: takeaway,
          type: 'recall',
          conceptName: concept.name
        });
      }

      // Create an "explain" type question
      quizItems.push({
        question: `Explain the concept of ${concept.name}`,
        options: [
          concept.explanation,
          `An incorrect explanation`,
          `A partially correct explanation`
        ],
        correctAnswer: 0,
        explanation: concept.explanation,
        type: 'explain',
        conceptName: concept.name
      });
    }

    return quizItems;
  }

  /**
   * Grade a student's answer to a generic quiz question
   * Uses existing grading logic from prompts
   */
  static async gradeAnswer(
    conceptData: any,
    userAnswer: string
  ): Promise<{ grade: string; feedback: string }> {
    try {
      const messages = [
        { role: 'user', content: gradeAnswerPrompt(conceptData, userAnswer, undefined) },
      ];

      const response = await llm.chat(messages);

      let parsed;
      try {
        parsed = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (err) {
        console.error('[GenericQuizGenerator] JSON parse failed for grading:', err.message, 'Response:', response);
        return { grade: 'incorrect', feedback: 'Failed to parse grading response' };
      }

      return {
        grade: parsed.grade || 'incorrect',
        feedback: parsed.feedback || 'No feedback provided'
      };
    } catch (error) {
      console.error('[GenericQuizGenerator] Failed to grade answer:', error);
      return { grade: 'incorrect', feedback: 'Error during grading' };
    }
  }

  /**
   * Rephrase a generic concept explanation in a different style
   */
  static async rephraseExplanation(
    conceptData: any,
    style: string = 'clear, engaging educator',
    context: string = ''
  ): Promise<string> {
    try {
      const messages = [
        { role: 'user', content: rephrasePrompt(conceptData, style, context) },
      ];

      const response = await llm.chat(messages);
      return response.trim();
    } catch (error) {
      console.error('[GenericQuizGenerator] Failed to rephrase explanation:', error);
      return conceptData.explanation || 'Unable to rephrase explanation';
    }
  }
}

// Update the GenericCategory class to use this quiz generator
// We'll modify the index.ts file to import and use this
import { DSACategory } from './index';
import { DSAExtractionResult, DSAQuizItem } from './types';
import { gradeAnswerPrompt, rephrasePrompt, rephraseApproachPrompt } from '../../utils/prompts';
import llm from '../../services/llm';

/**
 * DSA Quiz Generator
 * Handles quiz generation and answer grading for DSA content
 */
export class DSAQuizGenerator {
  /**
   * Generate quiz questions from extracted DSA content
   * Creates quiz items based on problems and approaches
   */
  static async generateQuiz(result: DSAExtractionResult): Promise<DSAQuizItem[]> {
    const quizItems: DSAQuizItem[] = [];

    for (const problem of result.concepts) {
      // For each problem, create quiz questions about each approach
      for (let i = 0; i < problem.approaches.length; i++) {
        const approach = problem.approaches[i];

        // Create an "optimality" type question about explaining approaches
        const quizItem: DSAQuizItem = {
          question: `Explain the ${approach.name} approach for solving "${problem.problemName}"`,
          options: [
            approach.explanation,
            `Alternative explanation for ${problem.problemName}`,
            `Another approach to ${problem.problemName}`
          ],
          correctAnswer: 0,
          explanation: approach.explanation,
          type: 'optimality',
          problemName: problem.problemName,
          approachIndex: i
        };

        quizItems.push(quizItem);
      }

      // Create a "complexity_identification" question for each approach
      for (let i = 0; i < problem.approaches.length; i++) {
        const approach = problem.approaches[i];

        quizItems.push({
          question: `What is the time complexity of the ${approach.name} approach for "${problem.problemName}"?`,
          options: [
            approach.complexity.time,
            `O(n^2)`,
            `O(2^n)`
          ],
          correctAnswer: 0,
          explanation: `${approach.name} runs in ${approach.complexity.time} time and ${approach.complexity.space} space`,
          type: 'complexity_identification',
          problemName: problem.problemName,
          approachIndex: i
        });
      }

      // Also create a question about key insights
      if (problem.keyInsights.length > 0) {
        const insightQuizItem: DSAQuizItem = {
          question: `What is a key insight from the discussion of "${problem.problemName}"?`,
          options: [
            problem.keyInsights[0],
            `Placeholder insight 1`,
            `Placeholder insight 2`
          ],
          correctAnswer: 0,
          explanation: problem.keyInsights[0],
          type: 'approach_comparison',
          problemName: problem.problemName
        };

        quizItems.push(insightQuizItem);
      }
    }

    return quizItems;
  }

  /**
   * Grade a student's answer to a DSA quiz question
   * Uses existing grading logic from prompts
   */
  static async gradeAnswer(
    problemData: any,
    userAnswer: string,
    approachIndex: number = 0
  ): Promise<{ grade: string; feedback: string }> {
    try {
      const messages = [
        { role: 'user', content: gradeAnswerPrompt(problemData, userAnswer, approachIndex) },
      ];

      const response = await llm.chat(messages);

      let parsed;
      try {
        parsed = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (err) {
        console.error('[DSAQuizGenerator] JSON parse failed for grading:', err.message, 'Response:', response);
        return { grade: 'incorrect', feedback: 'Failed to parse grading response' };
      }

      return {
        grade: parsed.grade || 'incorrect',
        feedback: parsed.feedback || 'No feedback provided'
      };
    } catch (error) {
      console.error('[DSAQuizGenerator] Failed to grade answer:', error);
      return { grade: 'incorrect', feedback: 'Error during grading' };
    }
  }

  /**
   * Rephrase a DSA problem explanation in a different style
   */
  static async rephraseExplanation(
    problemData: any,
    style: string = 'clear, engaging educator',
    context: string = ''
  ): Promise<string> {
    try {
      const messages = [
        { role: 'user', content: rephrasePrompt(problemData, style, context) },
      ];

      const response = await llm.chat(messages);
      return response.trim();
    } catch (error) {
      console.error('[DSAQuizGenerator] Failed to rephrase explanation:', error);
      return problemData.explanation || 'Unable to rephrase explanation';
    }
  }

  /**
   * Rephrase a specific approach explanation in a different style
   */
  static async rephraseApproach(
    approach: any,
    problemStatement: string,
    style: string = 'clear, engaging educator',
    context: string = ''
  ): Promise<string> {
    try {
      const messages = [
        { role: 'user', content: rephraseApproachPrompt(approach, problemStatement, style, context) },
      ];

      const response = await llm.chat(messages);
      return response.trim();
    } catch (error) {
      console.error('[DSAQuizGenerator] Failed to rephrase approach:', error);
      return approach.explanation || 'Unable to rephrase approach';
    }
  }
}

// Update the DSACategory class to use this quiz generator
// We'll modify the index.ts file to import and use this
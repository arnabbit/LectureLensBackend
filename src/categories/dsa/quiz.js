const llm = require('../../services/llm');
const { gradeAnswerPrompt, rephrasePrompt, rephraseApproachPrompt } = require('../../utils/prompts');

class DSAQuizGenerator {
  static async generateQuiz(result) {
    const quizItems = [];

    for (const problem of result.concepts) {
      for (let i = 0; i < problem.approaches.length; i++) {
        const approach = problem.approaches[i];

        quizItems.push({
          question: `Explain the ${approach.name} approach for solving "${problem.problemName}"`,
          options: [approach.explanation],
          correctAnswer: 0,
          explanation: approach.explanation,
          type: 'optimality',
          problemName: problem.problemName,
          approachIndex: i,
        });

        quizItems.push({
          question: `What is the time complexity of the ${approach.name} approach for "${problem.problemName}"?`,
          options: [approach.complexity.time, 'O(n^2)', 'O(2^n)'],
          correctAnswer: 0,
          explanation: `${approach.name} runs in ${approach.complexity.time} time and ${approach.complexity.space} space`,
          type: 'complexity_identification',
          problemName: problem.problemName,
          approachIndex: i,
        });
      }

      if (problem.keyInsights && problem.keyInsights.length > 0) {
        quizItems.push({
          question: `What is a key insight from the discussion of "${problem.problemName}"?`,
          options: [problem.keyInsights[0]],
          correctAnswer: 0,
          explanation: problem.keyInsights[0],
          type: 'approach_comparison',
          problemName: problem.problemName,
        });
      }
    }

    return quizItems;
  }

  static async gradeAnswer(problemData, userAnswer, approachIndex = 0) {
    try {
      const messages = [
        { role: 'user', content: gradeAnswerPrompt(problemData, userAnswer, approachIndex) },
      ];
      const response = await llm.chat(messages);

      let parsed;
      try {
        parsed = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (err) {
        console.error('[DSAQuizGenerator] JSON parse failed for grading:', err.message);
        return { grade: 'incorrect', feedback: 'Failed to parse grading response' };
      }

      return {
        grade: parsed.grade || 'incorrect',
        feedback: parsed.feedback || 'No feedback provided',
      };
    } catch (error) {
      console.error('[DSAQuizGenerator] Failed to grade answer:', error);
      return { grade: 'incorrect', feedback: 'Error during grading' };
    }
  }

  static async rephraseExplanation(problemData, style, context) {
    try {
      const messages = [
        { role: 'user', content: rephrasePrompt(problemData, style, context) },
      ];
      const response = await llm.chat(messages);
      return response.trim();
    } catch (error) {
      console.error('[DSAQuizGenerator] Failed to rephrase:', error);
      return problemData.explanation || 'Unable to rephrase';
    }
  }

  static async rephraseApproach(approach, problemStatement, style, context) {
    try {
      const messages = [
        { role: 'user', content: rephraseApproachPrompt(approach, problemStatement, style, context) },
      ];
      const response = await llm.chat(messages);
      return response.trim();
    } catch (error) {
      console.error('[DSAQuizGenerator] Failed to rephrase approach:', error);
      return approach.explanation || 'Unable to rephrase';
    }
  }
}

module.exports = { DSAQuizGenerator };

const llm = require('../../services/llm');
const { gradeAnswerPrompt, rephrasePrompt } = require('../../utils/prompts');

class GenericQuizGenerator {
  static async generateQuiz(result) {
    const quizItems = [];

    for (const concept of result.concepts) {
      const name = concept.problemName || concept.name || '';

      quizItems.push({
        question: `What was the main concept discussed regarding "${name}"?`,
        options: [name],
        correctAnswer: 0,
        explanation: concept.problemStatement || concept.explanation || '',
        type: 'key_point',
        conceptName: name,
      });

      const insights = concept.keyInsights || concept.keyTakeaways || [];
      for (const takeaway of insights) {
        quizItems.push({
          question: `Recall: What was the key takeaway about "${takeaway}"?`,
          options: [takeaway],
          correctAnswer: 0,
          explanation: takeaway,
          type: 'recall',
          conceptName: name,
        });
      }

      quizItems.push({
        question: `Explain the concept of "${name}"`,
        options: [concept.problemStatement || concept.explanation || ''],
        correctAnswer: 0,
        explanation: concept.problemStatement || concept.explanation || '',
        type: 'explain',
        conceptName: name,
      });
    }

    return quizItems;
  }

  static async gradeAnswer(conceptData, userAnswer) {
    try {
      const messages = [
        { role: 'user', content: gradeAnswerPrompt(conceptData, userAnswer) },
      ];
      const response = await llm.chat(messages);

      let parsed;
      try {
        parsed = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (err) {
        console.error('[GenericQuizGenerator] JSON parse failed for grading:', err.message);
        return { grade: 'incorrect', feedback: 'Failed to parse grading response' };
      }

      return {
        grade: parsed.grade || 'incorrect',
        feedback: parsed.feedback || 'No feedback provided',
      };
    } catch (error) {
      console.error('[GenericQuizGenerator] Failed to grade answer:', error);
      return { grade: 'incorrect', feedback: 'Error during grading' };
    }
  }

  static async rephraseExplanation(conceptData, style, context) {
    try {
      const messages = [
        { role: 'user', content: rephrasePrompt(conceptData, style, context) },
      ];
      const response = await llm.chat(messages);
      return response.trim();
    } catch (error) {
      console.error('[GenericQuizGenerator] Failed to rephrase:', error);
      return conceptData.explanation || 'Unable to rephrase';
    }
  }
}

module.exports = { GenericQuizGenerator };

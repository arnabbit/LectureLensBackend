const llm = require('./llm');
const { rephrasePrompt, rephraseApproachPrompt } = require('../utils/prompts');

async function rephrase(problem, style, context) {
  const messages = [
    { role: 'user', content: rephrasePrompt(problem, style, context) },
  ];

  const response = await llm.chat(messages);
  return response.trim();
}

async function rephraseApproach(approach, problemStatement, style, context) {
  const messages = [
    { role: 'user', content: rephraseApproachPrompt(approach, problemStatement, style, context) },
  ];

  const response = await llm.chat(messages);
  return response.trim();
}

module.exports = { rephrase, rephraseApproach };

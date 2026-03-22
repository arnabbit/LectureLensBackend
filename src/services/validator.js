const llm = require('./llm');
const { validatePrompt } = require('../utils/prompts');

async function validate(extraction, rawTranscript) {
  const messages = [
    { role: 'user', content: validatePrompt(extraction, rawTranscript) },
  ];

  let response;
  try {
    response = await llm.chat(messages, { json: true });
  } catch (err) {
    console.error('[validator] LLM call failed:', err.message);
    return { valid: false, feedback: `Validator LLM error: ${err.message}` };
  }

  try {
    const parsed = typeof response === 'string' ? JSON.parse(response) : response;
    const valid = parsed.valid === true;
    const feedback = parsed.feedback || '';
    console.log(`[validator] Result: valid=${valid}${feedback ? ` feedback="${feedback}"` : ''}`);
    return { valid, feedback };
  } catch (err) {
    // Try to extract valid from raw text if JSON parse fails
    const lowerResponse = String(response).toLowerCase();
    const valid = lowerResponse.includes('"valid": true') || lowerResponse.includes('"valid":true');
    return { valid, feedback: String(response) };
  }
}

module.exports = { validate };

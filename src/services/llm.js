const fetch = require('node-fetch');
const { OPENROUTER_API_KEY } = require('../config');

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

async function chat(messages, { json = false } = {}) {
  const body = {
    model: MODEL,
    messages,
  };

  if (json) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://github.com/transcript-processor',
      'X-Title': 'Transcript Processor',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('LLM returned no choices');
  }

  return data.choices[0].message.content;
}

module.exports = { chat };

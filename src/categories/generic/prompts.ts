// Generic extraction prompts
export function genericExtractPrompt(transcript: string): string {
  return `You are an expert educator. Extract the main concepts from this lecture transcript.

For each concept, extract:
1. A clear concept name
2. A detailed explanation of the concept
3. Key takeaways or important points to remember

Return ONLY valid JSON in this exact format:
{
  "concepts": [
    {
      "name": "concept name",
      "explanation": "detailed explanation of the concept",
      "keyTakeaways": ["key takeaway 1", "key takeaway 2"]
    }
  ]
}

If no clear concepts can be extracted, return { "concepts": [] }.

Transcript:
${transcript}`;
}
function dsaExtractPrompt(transcript) {
  return `You are an expert computer science educator. Analyze the following lecture transcript and extract all DSA (Data Structures and Algorithms) problems discussed.

For each problem, extract:
1. A clear problem statement
2. All approaches/solutions discussed, with their time and space complexity
3. Key insights or takeaways

IMPORTANT rules:
- For complexity values, return ONLY the O() notation with no extra text. Correct: "O(n log n)". Incorrect: "O(n log n) due to sorting" or "Time: O(n)".
- Each approach must include an "optimisationScore" integer. Rank all approaches for a problem from 1 (brute force / least optimal) to N (most optimal), where N is the total number of approaches. For example, with 3 approaches: brute force = 1, intermediate = 2, most optimal = 3.

Return ONLY valid JSON in this exact format:
{
  "problems": [
    {
      "problemName": "short recognizable name (e.g., Two Sum, Merge Intervals, LRU Cache)",
      "problemStatement": "string describing the problem",
      "approaches": [
        {
          "name": "approach name (e.g., Brute Force, Dynamic Programming)",
          "complexity": {
            "time": "O(...)",
            "space": "O(...)"
          },
          "optimisationScore": 1,
          "explanation": "detailed explanation of this approach"
        }
      ],
      "keyInsights": ["insight 1", "insight 2"]
    }
  ]
}

If no DSA problems are found, return { "problems": [] }.

Transcript:
${transcript}`;
}

module.exports = { dsaExtractPrompt };

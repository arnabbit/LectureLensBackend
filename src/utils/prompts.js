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

function languageExtractPrompt(transcript) {
  return `You are an expert programming language educator. Analyze the following lecture transcript and extract all quiz Q&A pairs about programming language concepts.

For each concept, create a question and answer pair.

Return ONLY valid JSON in this exact format:
{
  "problems": [
    {
      "problemStatement": "Question about the concept",
      "approaches": [
        {
          "name": "Answer",
          "complexity": {
            "time": "N/A",
            "space": "N/A"
          },
          "explanation": "Detailed explanation of the answer"
        }
      ],
      "keyInsights": ["key takeaway 1", "key takeaway 2"]
    }
  ]
}

If no clear Q&A pairs can be extracted, return { "problems": [] }.

Transcript:
${transcript}`;
}

function photographyExtractPrompt(transcript) {
  return `You are an expert photography educator. Analyze the following lecture transcript and extract key photography concepts as recall cards.

For each concept, create a recall card with a concept name/question and a detailed explanation.

Return ONLY valid JSON in this exact format:
{
  "problems": [
    {
      "problemStatement": "Photography concept or question (e.g., What is the exposure triangle?)",
      "approaches": [
        {
          "name": "Core Answer",
          "complexity": {
            "time": "N/A",
            "space": "N/A"
          },
          "explanation": "Detailed explanation of the concept"
        }
      ],
      "keyInsights": ["practical tip 1", "practical tip 2"]
    }
  ]
}

If no clear concepts can be extracted, return { "problems": [] }.

Transcript:
${transcript}`;
}

function validatePrompt(extraction, transcript) {
  return `You are a strict content validator. Given a lecture transcript and a JSON extraction, verify the quality of the extraction.

Check:
1. Does the problem statement actually appear (or is clearly derived from) the transcript?
2. Is each approach/solution actually discussed in the transcript?
3. Are the complexities (if applicable) mentioned or clearly implied in the transcript?

Respond ONLY in this JSON format:
{
  "valid": true or false,
  "feedback": "Specific feedback explaining why valid or invalid, and what needs correction if invalid"
}

Transcript:
${transcript}

Extraction:
${JSON.stringify(extraction, null, 2)}`;
}

function gradeAnswerPrompt(problemData, userAnswer, approachIndex) {
  const idx = approachIndex !== undefined ? Number(approachIndex) : 0;
  const approach = problemData.approaches && problemData.approaches[idx];
  const explanation = approach ? approach.explanation : 'N/A';
  const score = approach && approach.optimisationScore ? approach.optimisationScore : 'N/A';

  return `You are an expert educator grading a student's answer.

Problem: ${problemData.problemStatement}

Expected explanation: ${explanation}
Optimisation score of this approach: ${score} (1 = brute force, higher = more optimal)

Student's answer: ${userAnswer}

Grade the student's answer and respond ONLY in this JSON format:
{
  "grade": "correct" | "half" | "almost" | "incorrect",
  "feedback": "Detailed feedback explaining the grade and what the student did well or missed"
}

Grading criteria:
- correct: Student's answer covers all key points accurately
- almost: Student's answer is mostly right but missing 1-2 minor points
- half: Student's answer is partially correct but missing significant concepts
- incorrect: Student's answer is wrong or fundamentally misunderstands the concept`;
}

function rephrasePrompt(problem, style, context) {
  return `You are an expert at explaining technical concepts in different styles.

Rephrase the following problem and its explanation in the style of ${style || 'a clear, engaging educator'}.
${context ? `Additional context: ${context}` : ''}

Problem Statement: ${problem.problemStatement}

Explanation: ${problem.approaches && problem.approaches.length > 0 ? problem.approaches.map(a => `${a.name}: ${a.explanation}`).join('\n\n') : 'No explanation available'}

Key Insights: ${problem.keyInsights ? problem.keyInsights.join(', ') : 'None'}

Provide a rephrased, cohesive explanation that captures the essence of this problem in the requested style. Return only the rephrased text, no JSON.`;
}

function rephraseApproachPrompt(approach, problemStatement, style, context) {
  return `You are an expert at explaining technical concepts in different styles.

Rephrase the following approach/solution explanation in the style of ${style || 'a clear, engaging educator'}.
${context ? `Additional context: ${context}` : ''}

Problem: ${problemStatement}
Approach: ${approach.name}
Explanation: ${approach.explanation}

Provide a rephrased explanation for this specific approach only. Return only the rephrased text, no JSON.`;
}

function categoryDetectPrompt(courseName) {
  return `You are a course categorization expert. Given a course name, classify it into exactly one of these categories:

- dsa: Data Structures and Algorithms, coding interviews, competitive programming
- language: Programming language tutorials (Python, JavaScript, Java, C++, etc.), frameworks, web development
- photography: Photography, videography, photo editing, camera techniques
- other: Anything that doesn't fit the above categories

Course name: "${courseName}"

Respond ONLY with the category name (one word, lowercase): dsa, language, photography, or other`;
}

module.exports = {
  dsaExtractPrompt,
  languageExtractPrompt,
  photographyExtractPrompt,
  validatePrompt,
  gradeAnswerPrompt,
  rephrasePrompt,
  rephraseApproachPrompt,
  categoryDetectPrompt,
};

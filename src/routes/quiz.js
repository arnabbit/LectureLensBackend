const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const llm = require('../services/llm');
const rephraser = require('../services/rephraser');
const { gradeAnswerPrompt } = require('../utils/prompts');

const VALID_GRADES = new Set(['correct', 'half', 'almost', 'incorrect']);

// POST /quiz/grade
router.post('/grade', async (req, res) => {
  try {
    const { problemId, approachIndex, userAnswer } = req.body;

    if (!problemId || userAnswer === undefined) {
      return res.status(400).json({ error: 'Missing required fields: problemId, userAnswer' });
    }

    const problem = await Problem.findById(problemId).lean();
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const idx = approachIndex !== undefined ? Number(approachIndex) : 0;
    const approach = problem.approaches && problem.approaches[idx];

    const problemData = {
      problemStatement: problem.problemStatement,
      approaches: problem.approaches,
    };

    const messages = [
      { role: 'user', content: gradeAnswerPrompt(problemData, userAnswer, idx) },
    ];

    let response;
    try {
      response = await llm.chat(messages, { json: true });
    } catch (err) {
      return res.status(502).json({ error: `LLM error: ${err.message}` });
    }

    let grade, feedback;
    try {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      grade = parsed.grade;
      feedback = parsed.feedback;
    } catch (err) {
      console.error('[quiz/grade] JSON parse failed:', err.message);
      return res.status(500).json({ error: 'Failed to parse LLM grading response' });
    }

    if (!VALID_GRADES.has(grade)) {
      // Attempt to recover a grade from raw text
      const lower = String(grade).toLowerCase();
      if (lower.includes('correct')) grade = 'correct';
      else if (lower.includes('half')) grade = 'half';
      else if (lower.includes('almost')) grade = 'almost';
      else grade = 'incorrect';
    }

    const responseBody = { grade, feedback };

    // Include optimisationScore for frontend sorting
    if (approach && approach.optimisationScore !== undefined) {
      responseBody.optimisationScore = approach.optimisationScore;
    }

    // Include model explanation if answer is not fully correct
    if (grade !== 'correct' && approach) {
      responseBody.explanation = approach.explanation;
    }

    return res.status(200).json(responseBody);
  } catch (err) {
    console.error('[quiz/grade] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /rephrase/:problemId
router.get('/rephrase/:problemId', async (req, res) => {
  try {
    const { style, context, approachIndex } = req.query;

    const problem = await Problem.findById(req.params.problemId).lean();
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const idx = approachIndex !== undefined ? Number(approachIndex) : null;

    // If approachIndex provided, rephrase only that approach
    if (idx !== null && problem.approaches && problem.approaches[idx]) {
      const approach = problem.approaches[idx];
      let rephrased;
      try {
        rephrased = await rephraser.rephraseApproach(approach, problem.problemStatement, style, context);
      } catch (err) {
        return res.status(502).json({ error: `LLM error: ${err.message}` });
      }
      return res.status(200).json({ rephrased });
    }

    // Fallback: rephrase whole problem (legacy)
    let rephrased;
    try {
      rephrased = await rephraser.rephrase(problem, style, context);
    } catch (err) {
      return res.status(502).json({ error: `LLM error: ${err.message}` });
    }

    return res.status(200).json({ rephrased });
  } catch (err) {
    console.error('[rephrase] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

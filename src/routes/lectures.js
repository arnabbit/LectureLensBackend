const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Problem = require('../models/Problem');

// GET /lectures?courseName=&section=
router.get('/', async (req, res) => {
  try {
    const { courseName, section } = req.query;

    const problemQuery = {};

    if (courseName) {
      const course = await Course.findOne({
        name: { $regex: courseName, $options: 'i' },
      });

      if (!course) {
        return res.status(404).json({ error: `No course found matching: ${courseName}` });
      }

      problemQuery.courseId = course._id;
    }

    if (section) {
      problemQuery.sectionName = { $regex: section, $options: 'i' };
    }

    const problems = await Problem.find(problemQuery).lean();

    // Group by sectionName
    const grouped = {};
    for (const problem of problems) {
      const key = problem.sectionName || 'Uncategorized';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(problem);
    }

    return res.status(200).json({ sections: grouped, total: problems.length });
  } catch (err) {
    console.error('[lectures] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /lectures/:id
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('courseId', 'name courseId category')
      .populate('lectureId', 'sectionName lectureName udemyLectureId')
      .lean();

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    return res.status(200).json(problem);
  } catch (err) {
    console.error('[lectures/:id] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

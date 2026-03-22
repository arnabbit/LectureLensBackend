const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const { triggerProcessing, runBackgroundProcessing } = require('../services/processingRunner');

// POST /process/:courseId
router.post('/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await triggerProcessing(course);

    return res.status(200).json({
      status: 'processing',
      total: course.lectureCount,
    });
  } catch (err) {
    console.error('[process] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /process/:courseId/status
router.get('/:courseId/status', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.status(200).json({
      total: course.lectureCount,
      done: course.processedCount,
      failed: course.failedCount,
      status: course.processingStatus,
    });
  } catch (err) {
    console.error('[process] Status error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /process/:courseId/failed — list failed lectures
router.get('/:courseId/failed', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const failed = await Lecture.find(
      { courseId: course._id, failed: true },
      'udemyLectureId sectionName lectureName failReason'
    ).lean();

    return res.status(200).json({ total: failed.length, lectures: failed });
  } catch (err) {
    console.error('[process] Failed lectures error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /process/:courseId/retry-failed — retry all failed lectures
router.post('/:courseId/retry-failed', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const failedCount = await Lecture.countDocuments({ courseId: course._id, failed: true });
    if (failedCount === 0) {
      return res.status(200).json({ message: 'No failed lectures to retry' });
    }

    await Lecture.updateMany(
      { courseId: course._id, failed: true },
      { $set: { failed: false, failReason: '' } }
    );

    course.processingStatus = 'processing';
    await course.save();

    setImmediate(() => runBackgroundProcessing(course, { processed: false }));

    return res.status(200).json({
      status: 'processing',
      retrying: failedCount,
    });
  } catch (err) {
    console.error('[process] Retry error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

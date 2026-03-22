const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const vttFetcher = require('../services/vttFetcher');
const vttParser = require('../services/vttParser');
const { triggerProcessing } = require('../services/processingRunner');

router.post('/', async (req, res) => {
  try {
    const { courseName, courseId, lectures } = req.body;

    if (!courseName || courseId === undefined || !Array.isArray(lectures)) {
      return res.status(400).json({
        error: 'Missing required fields: courseName, courseId, lectures (array)',
      });
    }

    if (lectures.length === 0) {
      return res.status(400).json({ error: 'lectures array must not be empty' });
    }

    console.log(`[ingest] Validated input: course="${courseName}" courseId=${courseId} lectures=${lectures.length}`);

    // Upsert course
    const course = await Course.findOneAndUpdate(
      { courseId },
      {
        $set: {
          name: courseName,
          lectureCount: lectures.length,
          processingStatus: 'pending',
          processedCount: 0,
          failedCount: 0,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`[ingest] Course upserted: ${course._id}`);

    // Fetch all VTT files in parallel
    const vttResults = await vttFetcher.fetchAll(lectures);

    // Build a map of lectureId -> vttText for quick lookup
    const vttMap = new Map(vttResults.map((r) => [r.lectureId, r.vttText]));
    const fetchedCount = vttResults.filter((r) => r.vttText).length;
    const failedFetchCount = vttResults.length - fetchedCount;
    console.log(`[ingest] VTTs fetched: ${fetchedCount} ok, ${failedFetchCount} failed out of ${vttResults.length}`);

    let lecturesStored = 0;

    for (const lecture of lectures) {
      const { lectureId, captionUrl, sectionName, lectureName } = lecture;
      const vttText = vttMap.get(lectureId);

      if (!vttText) continue;

      const rawTranscript = vttParser.toPlainText(vttText);

      await Lecture.findOneAndUpdate(
        { courseId: course._id, udemyLectureId: lectureId },
        {
          $set: {
            courseId: course._id,
            udemyLectureId: lectureId,
            sectionName: sectionName || '',
            lectureName: lectureName || '',
            rawTranscript,
            captionUrl: captionUrl || '',
            fetchedAt: new Date(),
            processed: false,
          },
        },
        { upsert: true, new: true }
      );

      lecturesStored++;
    }

    console.log(`[ingest] Lectures stored: ${lecturesStored}/${lectures.length}`);

    if (lecturesStored > 0) {
      triggerProcessing(course);
    }

    return res.status(200).json({
      courseId: course._id,
      lecturesStored,
    });
  } catch (err) {
    console.error('[ingest] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

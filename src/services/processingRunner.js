const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Problem = require('../models/Problem');
const categoryDetector = require('./categoryDetector');
const validator = require('./validator');
const registry = require('../processors/registry');

const LLM_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

async function processLecture(lecture, course) {
  if (!lecture.rawTranscript || lecture.rawTranscript.trim() === '') {
    console.log(`[process] Skipping lecture ${lecture._id} (${lecture.lectureName}): empty transcript`);
    await Lecture.findByIdAndUpdate(lecture._id, { processed: true });
    return;
  }

  console.log(`[process] Processing lecture ${lecture._id} (${lecture.lectureName})`);

  const processor = registry.get(course.category || 'other');
  const problems = await processor.processWithRetry([lecture.rawTranscript], validator, lecture.rawTranscript);
  console.log(`[process] LLM extraction done for lecture ${lecture._id}: ${problems.length} problems`);

  await Problem.deleteMany({ lectureId: lecture._id });

  if (problems.length > 0) {
    const docs = problems.map((p) => ({
      courseId: course._id,
      lectureId: lecture._id,
      sectionName: lecture.sectionName,
      lectureName: lecture.lectureName,
      problemName: p.problemName || '',
      problemStatement: p.problemStatement,
      approaches: p.approaches || [],
      keyInsights: p.keyInsights || [],
      category: course.category,
      processedAt: new Date(),
      llmModel: LLM_MODEL,
      validationPassed: true,
    }));
    await Problem.insertMany(docs);
    console.log(`[process] Stored ${docs.length} problems for lecture ${lecture._id}`);
  }

  await Lecture.findByIdAndUpdate(lecture._id, { processed: true, failed: false, failReason: '' });
  console.log(`[process] Lecture complete: ${lecture._id} (${lecture.lectureName})`);
}

async function runBackgroundProcessing(course, lectureFilter = {}) {
  const courseObjectId = course._id;

  try {
    const query = { courseId: courseObjectId, ...lectureFilter };
    if (!lectureFilter._id) {
      query.processed = false;
    }
    const lectures = await Lecture.find(query);
    console.log(`[process] Starting background processing: ${lectures.length} lectures for course ${courseObjectId}`);

    for (const lecture of lectures) {
      try {
        await processLecture(lecture, course);
        await Course.findByIdAndUpdate(courseObjectId, { $inc: { processedCount: 1 } });
      } catch (err) {
        console.error(`[process] Failed lecture ${lecture._id} (${lecture.lectureName}):`, err.message);
        await Lecture.findByIdAndUpdate(lecture._id, {
          processed: false,
          failed: true,
          failReason: err.message,
        });
        await Course.findByIdAndUpdate(courseObjectId, { $inc: { failedCount: 1 } });
      }
    }

    const failedRemaining = await Lecture.countDocuments({ courseId: courseObjectId, failed: true });
    const status = failedRemaining > 0 ? 'done_with_errors' : 'done';
    await Course.findByIdAndUpdate(courseObjectId, { processingStatus: status });
    console.log(`[process] Completed course ${courseObjectId}: ${status}`);
  } catch (err) {
    console.error('[process] Fatal background error:', err.message);
    await Course.findByIdAndUpdate(courseObjectId, { processingStatus: 'failed' }).catch(() => {});
  }
}

async function triggerProcessing(course) {
  try {
    let category;
    try {
      category = await categoryDetector.detect(course.courseId, course.name);
      console.log(`[process] Category detected: "${category}" for course "${course.name}"`);
    } catch (err) {
      category = 'other';
      console.error('[process] Category detection failed, defaulting to "other":', err.message);
    }

    course.category = category;
    course.detectedAt = new Date();
    course.processingStatus = 'processing';
    course.processedCount = 0;
    course.failedCount = 0;
    await course.save();

    setImmediate(() => runBackgroundProcessing(course));
  } catch (err) {
    console.error('[process] triggerProcessing error:', err.message);
  }
}

async function resumeIncompleteProcessing() {
  try {
    const incompleteCourses = await Course.find({ processingStatus: 'processing' });

    if (incompleteCourses.length === 0) {
      console.log('[resume] No incomplete processing found');
      return;
    }

    console.log(`[resume] Found ${incompleteCourses.length} course(s) with incomplete processing`);

    for (const course of incompleteCourses) {
      const pending = await Lecture.countDocuments({ courseId: course._id, processed: false, failed: false });
      const failed = await Lecture.countDocuments({ courseId: course._id, failed: true });

      console.log(`[resume] Course "${course.name}" (${course._id}): ${pending} pending, ${failed} failed`);

      if (pending === 0 && failed === 0) {
        await Course.findByIdAndUpdate(course._id, { processingStatus: 'done' });
        console.log(`[resume] Course "${course.name}" marked done (no remaining lectures)`);
        continue;
      }

      // Reset failed lectures so they get retried
      if (failed > 0) {
        await Lecture.updateMany(
          { courseId: course._id, failed: true },
          { failed: false, failReason: '' }
        );
        console.log(`[resume] Reset ${failed} failed lectures for retry`);
      }

      setImmediate(() => runBackgroundProcessing(course));
    }
  } catch (err) {
    console.error('[resume] Error resuming incomplete processing:', err.message);
  }
}

module.exports = { processLecture, runBackgroundProcessing, triggerProcessing, resumeIncompleteProcessing };

const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  udemyLectureId: { type: Number, required: true },
  sectionName: { type: String },
  lectureName: { type: String },
  rawTranscript: { type: String },
  captionUrl: { type: String },
  fetchedAt: { type: Date },
  processed: { type: Boolean, default: false },
  failed: { type: Boolean, default: false },
  failReason: { type: String, default: '' },
});

lectureSchema.index({ courseId: 1, udemyLectureId: 1 }, { unique: true });

module.exports = mongoose.model('Lecture', lectureSchema);

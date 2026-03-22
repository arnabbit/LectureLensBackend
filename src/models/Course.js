const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  courseId: { type: Number, required: true, unique: true },
  category: { type: String },
  detectedAt: { type: Date },
  lectureCount: { type: Number, default: 0 },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'done', 'done_with_errors', 'failed'],
    default: 'pending',
  },
  processedCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Course', courseSchema);

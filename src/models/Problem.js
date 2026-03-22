const mongoose = require('mongoose');

const approachSchema = new mongoose.Schema({
  name: { type: String },
  complexity: {
    time: { type: String },
    space: { type: String },
  },
  optimisationScore: { type: Number },
  explanation: { type: String },
});

const problemSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
  sectionName: { type: String },
  lectureName: { type: String },
  problemName: { type: String },
  problemStatement: { type: String },
  approaches: [approachSchema],
  keyInsights: [{ type: String }],
  category: { type: String },
  processedAt: { type: Date },
  llmModel: { type: String },
  validationPassed: { type: Boolean },
});

// Non-unique: multiple problems per lecture allowed
problemSchema.index({ courseId: 1, sectionName: 1, lectureName: 1 });
problemSchema.index({ lectureId: 1 });

module.exports = mongoose.model('Problem', problemSchema);

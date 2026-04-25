const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  icon: { type: String, default: '📚' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  order: { type: Number, default: 0 },
  notes: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, default: 0 },
  }],
  videos: [{
    title: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    duration: { type: String, default: '' },
    order: { type: Number, default: 0 },
  }],
  roadmap: [{
    step: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    completed: { type: Boolean, default: false },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);

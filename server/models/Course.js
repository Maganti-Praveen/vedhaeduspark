const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: { type: String, enum: ['video', 'pdf', 'notes'], required: true },
  title: { type: String, required: true, trim: true },
  videoUrl: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  contentText: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { _id: true });

const sectionSchema = new mongoose.Schema({
  sectionTitle: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
  contents: [contentSchema],
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  instructor: { type: String, default: 'VedhaEduSpark Team' },
  duration: { type: String, default: '8 weeks' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  topics: [{ type: String }],
  price: { type: Number, default: 0 },
  enrolled: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5 },
  sections: [sectionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  category: { type: String, required: true, enum: ['DSA', 'DBMS', 'OS', 'CN', 'Web Dev', 'Mobile Dev', 'AI/ML', 'Cloud', 'DevOps', 'Interview Prep', 'Other'] },
  type: { type: String, enum: ['article', 'video', 'github', 'tool', 'course', 'other'], default: 'article' },
  description: { type: String },
  icon: { type: String, default: '📚' },
}, { timestamps: true });

resourceSchema.index({ category: 1 });

module.exports = mongoose.model('Resource', resourceSchema);

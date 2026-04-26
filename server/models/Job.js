const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['Software Development', 'Data Science', 'Web Development', 'Mobile Development', 'DevOps', 'Cybersecurity', 'AI/ML', 'Cloud Computing', 'Database', 'Internship', 'Other'] },
  type: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'], default: 'Full-time' },
  location: { type: String, trim: true, default: 'Remote' },
  experience: { type: String, trim: true, default: 'Fresher' },
  salary: { type: String, trim: true },
  description: { type: String, required: true },
  requirements: { type: String },
  link: { type: String, required: true },
  deadline: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

jobSchema.index({ category: 1, type: 1, isActive: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);

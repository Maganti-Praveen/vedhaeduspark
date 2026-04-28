const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, default: '' },
  title: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  summary: { type: String, default: '' },
  experience: [{
    title: String,
    company: String,
    dates: String,
    bullets: [String],
  }],
  education: [{
    degree: String,
    institution: String,
    year: String,
    gpa: String,
  }],
  skills: [String],
  projects: [{
    title: String,
    description: String,
    tech: String,
    link: String,
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
  }],
  languages: [String],
  selectedTemplate: { type: String, default: 'clean' },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);

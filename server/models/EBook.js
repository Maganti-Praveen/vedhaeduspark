const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  author: { type: String, default: 'VedhaEduSpark Team' },
  category: { type: String, enum: ['Programming', 'DSA', 'Web Development', 'Database', 'Computer Science', 'AI & ML', 'Interview Prep', 'Other'], default: 'Programming' },
  image: { type: String, default: '' },
  pdfUrl: { type: String, required: true },
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  qrCodeImage: { type: String, default: '' },
  accessMode: { type: String, enum: ['website', 'email', 'both'], default: 'website' },
  downloadCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  accessGranted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('EBook', ebookSchema);

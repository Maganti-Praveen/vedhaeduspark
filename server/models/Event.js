const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Webinar', 'Workshop', 'Hackathon', 'Seminar', 'Meetup', 'Other'], default: 'Webinar' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: String, default: '1 hour' },
  speaker: { type: String, default: '' },
  link: { type: String, default: '' },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);

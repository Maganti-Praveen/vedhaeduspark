const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const discussionSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['general', 'course', 'problem'], default: 'general' },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [replySchema],
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

discussionSchema.index({ createdAt: -1 });
discussionSchema.index({ type: 1, referenceId: 1 });

module.exports = mongoose.model('Discussion', discussionSchema);

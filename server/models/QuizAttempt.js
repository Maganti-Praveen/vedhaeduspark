const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [{ type: Number }], // index of selected option per question
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  timeTaken: { type: Number, default: 0 }, // seconds
}, { timestamps: true });

quizAttemptSchema.index({ userId: 1, quizId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);

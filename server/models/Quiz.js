const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index of correct option
  explanation: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  description: { type: String, default: '' },
  questions: [questionSchema],
  duration: { type: Number, default: 15 }, // minutes
  passingScore: { type: Number, default: 60 }, // percentage
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);

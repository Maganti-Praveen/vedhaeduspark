const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { protect, admin } = require('../middleware/auth');

// GET /api/quizzes — all active quizzes (user) 
router.get('/', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true })
      .populate('courseId', 'title')
      .select('-questions.correctAnswer -questions.explanation')
      .sort({ createdAt: -1 });
    // Attach user attempt status
    const result = await Promise.all(quizzes.map(async (q) => {
      const attempt = await QuizAttempt.findOne({ userId: req.user._id, quizId: q._id }).sort({ createdAt: -1 });
      return { ...q.toObject(), lastAttempt: attempt || null };
    }));
    res.json(result);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/quizzes/admin — all quizzes for admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('courseId', 'title').sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/quizzes/:id — single quiz for taking (includes questions but not answers)
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('courseId', 'title');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    // Strip answers for user
    const safe = quiz.toObject();
    safe.questions = safe.questions.map(q => ({ ...q, correctAnswer: undefined, explanation: undefined }));
    res.json(safe);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/quizzes — create (admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/quizzes/:id — update (admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) return res.status(404).json({ message: 'Not found' });
    res.json(quiz);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/quizzes/:id — delete (admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/quizzes/:id/submit — submit quiz answers (user)
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Grade
    let correct = 0;
    const results = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) correct++;
      return { question: q.question, options: q.options, selected: answers[i], correct: q.correctAnswer, isCorrect, explanation: q.explanation };
    });

    const percentage = Math.round((correct / quiz.questions.length) * 100);
    const passed = percentage >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      userId: req.user._id, quizId: quiz._id,
      answers, score: correct, percentage, passed, timeTaken: timeTaken || 0,
    });

    res.json({ attempt, results, correct, total: quiz.questions.length, percentage, passed });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/quizzes/:id/attempts — user's attempts
router.get('/:id/attempts', protect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id, quizId: req.params.id }).sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;

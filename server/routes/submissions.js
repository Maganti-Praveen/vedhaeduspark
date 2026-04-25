const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { protect } = require('../middleware/auth');

// GET /api/submissions - user's submissions
router.get('/', protect, async (req, res) => {
  try {
    const { problemId, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };
    if (problemId) filter.problemId = problemId;

    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter)
      .populate('problemId', 'title difficulty topic')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ submissions, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/submissions/stats - user's stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const totalSubmissions = await Submission.countDocuments({ userId });
    const accepted = await Submission.countDocuments({ userId, status: 'Accepted' });
    const uniqueSolved = await Submission.distinct('problemId', { userId, status: 'Accepted' });
    
    const recentSubmissions = await Submission.find({ userId })
      .populate('problemId', 'title difficulty topic')
      .sort({ createdAt: -1 })
      .limit(10);

    const difficultyStats = await Submission.aggregate([
      { $match: { userId, status: 'Accepted' } },
      { $lookup: { from: 'problems', localField: 'problemId', foreignField: '_id', as: 'problem' } },
      { $unwind: '$problem' },
      { $group: { _id: '$problem.difficulty', count: { $sum: 1 } } },
    ]);

    res.json({
      totalSubmissions,
      accepted,
      successRate: totalSubmissions > 0 ? Math.round((accepted / totalSubmissions) * 100) : 0,
      uniqueSolved: uniqueSolved.length,
      recentSubmissions,
      difficultyStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

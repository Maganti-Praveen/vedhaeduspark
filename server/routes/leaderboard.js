const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    // Get all users with stats
    const users = await User.find({ role: 'user' })
      .select('name avatar college progressStats streak badges solvedProblems')
      .sort({ 'progressStats.totalSolved': -1 })
      .limit(100);

    // Enrich with course + quiz data
    const leaderboard = await Promise.all(users.map(async (u, i) => {
      const enrollments = await Enrollment.countDocuments({ userId: u._id });
      const completed = await Enrollment.countDocuments({ userId: u._id, progress: 100 });
      const quizzes = await QuizAttempt.countDocuments({ userId: u._id, passed: true });
      const points = (u.progressStats?.totalSolved || 0) * 10 + completed * 50 + quizzes * 25 + (u.streak || 0) * 2;
      return {
        _id: u._id,
        rank: i + 1,
        name: u.name,
        avatar: u.avatar,
        college: u.college,
        problemsSolved: u.progressStats?.totalSolved || 0,
        coursesCompleted: completed,
        coursesEnrolled: enrollments,
        quizzesPassed: quizzes,
        streak: u.streak || 0,
        badges: u.badges || [],
        points,
      };
    }));

    // Sort by points
    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((u, i) => u.rank = i + 1);

    res.json(leaderboard);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;

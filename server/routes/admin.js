const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const { protect, admin } = require('../middleware/auth');
const { sendNotificationEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationHelper');

// GET /api/admin/stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const [users, courses, problems, submissions, enrollments] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Problem.countDocuments(),
      Submission.countDocuments(),
      Enrollment.countDocuments(),
    ]);
    res.json({ users, courses, problems, submissions, enrollments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/analytics
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const submissionTrends = await Submission.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]);

    const difficultyDist = await Problem.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    const topPerformers = await User.find({ 'progressStats.totalSolved': { $gt: 0 } })
      .select('name email avatar progressStats.totalSolved')
      .sort({ 'progressStats.totalSolved': -1 }).limit(10);

    const coursePopularity = await Course.find().select('title enrolled').sort({ enrolled: -1 }).limit(10);

    const languageUsage = await Submission.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const submissionsToday = await Submission.countDocuments({ createdAt: { $gte: today } });

    const totalSubs = await Submission.countDocuments();
    const acceptedSubs = await Submission.countDocuments({ status: 'Accepted' });
    const acceptanceRate = totalSubs > 0 ? Math.round((acceptedSubs / totalSubs) * 100) : 0;

    res.json({
      userGrowth: userGrowth.map(u => ({ date: u._id, users: u.count })),
      submissionTrends: submissionTrends.map(s => ({ date: s._id, total: s.total, accepted: s.accepted })),
      difficultyDist: difficultyDist.map(d => ({ name: d._id, value: d.count })),
      topPerformers,
      coursePopularity: coursePopularity.map(c => ({ name: c.title, enrolled: c.enrolled || 0 })),
      languageUsage: languageUsage.map(l => ({ name: l._id, value: l.count })),
      submissionsToday,
      acceptanceRate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users — with optional pagination & search
router.get('/users', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';

    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(req.query.page ? { users, total, page, pages: Math.ceil(total / limit) } : users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) return res.status(400).json({ message: 'Cannot delete yourself' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Submission.deleteMany({ userId: req.params.id });
    await Enrollment.deleteMany({ userId: req.params.id });
    res.json({ message: 'User and associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/send-notification
router.post('/send-notification', protect, admin, async (req, res) => {
  try {
    const { subject, content, userIds } = req.body;
    if (!subject || !content || !userIds || userIds.length === 0) {
      return res.status(400).json({ message: 'Subject, content, and at least one user are required' });
    }
    const users = await User.find({ _id: { $in: userIds } }).select('name email');
    if (users.length === 0) return res.status(404).json({ message: 'No valid users found' });

    // Send emails + in-app notifications
    const results = await Promise.allSettled(
      users.map(async (user) => {
        await sendNotificationEmail(user.name, user.email, subject, content);
        await createNotification(user._id, 'admin', subject, content);
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    res.json({ message: `Notification sent to ${sent} user(s)${failed > 0 ? `, ${failed} failed` : ''}`, sent, failed, total: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

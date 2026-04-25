const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const { protect, admin } = require('../middleware/auth');
const { sendNotificationEmail } = require('../utils/emailService');

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

// GET /api/admin/users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
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

    // Fetch selected users
    const users = await User.find({ _id: { $in: userIds } }).select('name email');

    if (users.length === 0) {
      return res.status(404).json({ message: 'No valid users found' });
    }

    // Send emails concurrently (batch)
    const results = await Promise.allSettled(
      users.map((user) => sendNotificationEmail(user.name, user.email, subject, content))
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`📧 Notifications: ${sent} sent, ${failed} failed out of ${users.length}`);

    res.json({
      message: `Notification sent to ${sent} user(s)${failed > 0 ? `, ${failed} failed` : ''}`,
      sent,
      failed,
      total: users.length,
    });
  } catch (error) {
    console.error('Send notification error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

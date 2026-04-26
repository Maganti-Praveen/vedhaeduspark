const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');

// GET /api/courses - public
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/courses/:id - public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/courses - admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const course = await Course.create(req.body);

    // Notify ALL users about the new course
    const users = await User.find({}, '_id');
    users.forEach(u => {
      createNotification(
        u._id, 'course',
        `New Course: ${course.title} 🚀`,
        `A new ${course.level} course "${course.title}" is now available!`,
        `/dashboard/learning`
      );
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/courses/:id - admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/courses/:id - admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

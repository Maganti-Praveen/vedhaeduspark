const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

// GET /api/enrollments - user's enrollments
router.get('/', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id })
      .populate('courseId')
      .sort({ updatedAt: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/enrollments - enroll in course
router.post('/', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const existing = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existing) return res.status(400).json({ message: 'Already enrolled in this course' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrollment = await Enrollment.create({ userId: req.user._id, courseId });
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolled: 1 } });
    const populated = await enrollment.populate('courseId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/enrollments/:id/complete-content - mark content as done
router.put('/:id/complete-content', protect, async (req, res) => {
  try {
    const { contentId } = req.body;
    const enrollment = await Enrollment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    const course = await Course.findById(enrollment.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Add to completed if not already there
    if (!enrollment.completedContents.includes(contentId)) {
      enrollment.completedContents.push(contentId);
    }

    // Calculate progress = completed / total contents
    let totalContents = 0;
    course.sections.forEach(s => { totalContents += s.contents.length; });
    enrollment.progress = totalContents > 0 ? Math.round((enrollment.completedContents.length / totalContents) * 100) : 0;

    await enrollment.save();
    const populated = await enrollment.populate('courseId');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/enrollments/:id/uncomplete-content - unmark content
router.put('/:id/uncomplete-content', protect, async (req, res) => {
  try {
    const { contentId } = req.body;
    const enrollment = await Enrollment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    const course = await Course.findById(enrollment.courseId);
    enrollment.completedContents = enrollment.completedContents.filter(c => c !== contentId);

    let totalContents = 0;
    course.sections.forEach(s => { totalContents += s.contents.length; });
    enrollment.progress = totalContents > 0 ? Math.round((enrollment.completedContents.length / totalContents) * 100) : 0;

    await enrollment.save();
    const populated = await enrollment.populate('courseId');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/enrollments/:id/progress
router.put('/:id/progress', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { progress: req.body.progress },
      { new: true }
    ).populate('courseId');
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

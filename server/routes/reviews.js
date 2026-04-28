const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

// GET /api/reviews/:courseId
router.get('/:courseId', async (req, res) => {
  try {
    const reviews = await Review.find({ courseId: req.params.courseId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
    // Calculate avg
    const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
    res.json({ reviews, average: Number(avg), total: reviews.length });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;
    if (!courseId || !rating) return res.status(400).json({ message: 'courseId and rating required' });
    // Upsert
    const review = await Review.findOneAndUpdate(
      { userId: req.user._id, courseId },
      { rating, comment },
      { upsert: true, new: true }
    ).populate('userId', 'name avatar');
    // Update course avg rating
    const all = await Review.find({ courseId });
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
    await Course.findByIdAndUpdate(courseId, { rating: Number(avg.toFixed(1)) });
    res.json(review);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/reviews/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) return res.status(404).json({ message: 'Not found' });
    await review.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;

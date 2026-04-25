const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const { protect, admin } = require('../middleware/auth');

// GET /api/problems
router.get('/', async (req, res) => {
  try {
    const { difficulty, topic, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await Problem.countDocuments(filter);
    const problems = await Problem.find(filter)
      .select('-hiddenTestCases')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ problems, total, pages: Math.ceil(total / limit), page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/problems/topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await Problem.distinct('topic');
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/problems/:id
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).select('-hiddenTestCases');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/problems - admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/problems/:id - admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/problems/:id - admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

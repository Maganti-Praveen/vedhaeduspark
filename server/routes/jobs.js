const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect, admin } = require('../middleware/auth');

// GET /api/jobs — public (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, type, search, experience } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (experience) filter.experience = experience;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } },
    ];
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/jobs/categories — list categories with counts
router.get('/categories', async (req, res) => {
  try {
    const cats = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(cats.map(c => ({ name: c._id, count: c.count })));
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/jobs — admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/jobs/:id — admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ message: 'Not found' });
    res.json(job);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/jobs/:id — admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;

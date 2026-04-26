const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect, admin } = require('../middleware/auth');

// GET /api/resources
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const resources = await Resource.find(filter).sort({ category: 1, createdAt: -1 });
    res.json(resources);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/resources — admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/resources/:id — admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ message: 'Not found' });
    res.json(resource);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/resources/:id — admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;

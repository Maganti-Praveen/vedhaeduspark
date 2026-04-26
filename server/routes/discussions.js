const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const { protect } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');

// GET /api/discussions
router.get('/', async (req, res) => {
  try {
    const { type, referenceId, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (referenceId) filter.referenceId = referenceId;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const discussions = await Discussion.find(filter)
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar')
      .sort({ isPinned: -1, createdAt: -1 }).limit(50);
    res.json(discussions);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/discussions/:id
router.get('/:id', async (req, res) => {
  try {
    const d = await Discussion.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar');
    if (!d) return res.status(404).json({ message: 'Not found' });
    res.json(d);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/discussions
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, type, referenceId, tags } = req.body;
    const d = await Discussion.create({ author: req.user._id, title, content, type: type || 'general', referenceId, tags: tags || [] });
    const populated = await d.populate('author', 'name avatar');
    res.status(201).json(populated);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/discussions/:id/reply
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const d = await Discussion.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    d.replies.push({ author: req.user._id, content: req.body.content });
    await d.save();
    // Notify discussion author
    if (d.author.toString() !== req.user._id.toString()) {
      createNotification(d.author, 'discussion', 'New Reply 💬', `Someone replied to "${d.title}"`, `/dashboard/community`);
    }
    const populated = await d.populate(['author', 'replies.author'].map(p => ({ path: p, select: 'name avatar' })));
    res.json(populated);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/discussions/:id/like
router.put('/:id/like', protect, async (req, res) => {
  try {
    const d = await Discussion.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    const idx = d.likes.indexOf(req.user._id);
    if (idx === -1) d.likes.push(req.user._id); else d.likes.splice(idx, 1);
    await d.save();
    res.json({ likes: d.likes.length, liked: idx === -1 });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/discussions/:id/replies/:replyId/like
router.put('/:id/replies/:replyId/like', protect, async (req, res) => {
  try {
    const d = await Discussion.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    const reply = d.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });
    const idx = reply.likes.indexOf(req.user._id);
    if (idx === -1) reply.likes.push(req.user._id); else reply.likes.splice(idx, 1);
    await d.save();
    res.json({ likes: reply.likes.length, liked: idx === -1 });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/discussions/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const d = await Discussion.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    if (d.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;

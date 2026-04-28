const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');
const User = require('../models/User');

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });
    res.json(events);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/events/admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/events — admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    // Notify all users
    const users = await User.find({ role: 'user' }, '_id');
    users.forEach(u => {
      createNotification(u._id, 'event', `New ${event.type}: ${event.title} 🎉`, `Join us on ${new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${event.time}`, '/dashboard/events');
    });
    res.status(201).json(event);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/events/:id — admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Not found' });
    res.json(event);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/events/:id — admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/events/:id/register — user register for event
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    if (event.registeredUsers.includes(req.user._id)) return res.status(400).json({ message: 'Already registered' });
    event.registeredUsers.push(req.user._id);
    await event.save();
    res.json({ message: 'Registered!' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;

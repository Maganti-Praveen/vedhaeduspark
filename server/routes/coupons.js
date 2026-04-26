const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Course = require('../models/Course');
const { protect, admin } = require('../middleware/auth');
const crypto = require('crypto');

// Generate random coupon code
const generateCode = (length = 8) => {
  return crypto.randomBytes(length).toString('hex').toUpperCase().slice(0, length);
};

// GET /api/coupons/courses — get paid courses for coupon panel (admin)
router.get('/courses', protect, admin, async (req, res) => {
  try {
    const courses = await Course.find({ isFree: false }).select('title price image level').sort({ createdAt: -1 });
    // Attach coupon stats to each course
    const result = await Promise.all(courses.map(async (c) => {
      const total = await Coupon.countDocuments({ courseId: c._id });
      const used = await Coupon.countDocuments({ courseId: c._id, isUsed: true });
      return { ...c.toObject(), coupons: { total, used, available: total - used } };
    }));
    res.json(result);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/coupons/:courseId — get coupons for a course (admin)
router.get('/:courseId', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find({ courseId: req.params.courseId })
      .populate('usedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/coupons/generate — generate coupons (admin)
router.post('/generate', protect, admin, async (req, res) => {
  try {
    const { courseId, count, customCodes } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.isFree) return res.status(400).json({ message: 'Cannot create coupons for free courses' });

    const coupons = [];
    if (customCodes && customCodes.length > 0) {
      // Custom codes
      for (const code of customCodes) {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) continue;
        const exists = await Coupon.findOne({ code: trimmed });
        if (exists) return res.status(400).json({ message: `Code "${trimmed}" already exists` });
        coupons.push({ code: trimmed, courseId, createdBy: req.user._id });
      }
    } else {
      // Random codes
      const num = Math.min(count || 1, 100); // max 100 at once
      for (let i = 0; i < num; i++) {
        let code;
        let attempts = 0;
        do {
          code = `VES-${generateCode(6)}`;
          attempts++;
        } while (await Coupon.findOne({ code }) && attempts < 10);
        coupons.push({ code, courseId, createdBy: req.user._id });
      }
    }

    const created = await Coupon.insertMany(coupons);
    res.status(201).json({ message: `${created.length} coupons created`, coupons: created });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/coupons/validate — validate coupon for enrollment (user)
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, courseId } = req.body;
    if (!code || !courseId) return res.status(400).json({ message: 'Code and courseId required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), courseId });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code for this course' });
    if (coupon.isUsed) return res.status(400).json({ message: 'This coupon has already been used' });

    // Mark as used
    coupon.isUsed = true;
    coupon.usedBy = req.user._id;
    coupon.usedAt = new Date();
    await coupon.save();

    res.json({ message: 'Coupon validated successfully', valid: true });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/coupons/:id — delete a coupon (admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Not found' });
    if (coupon.isUsed) return res.status(400).json({ message: 'Cannot delete a used coupon' });
    await coupon.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;

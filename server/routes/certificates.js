const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/certificates — user's certificates
router.get('/', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id, progress: 100 })
      .populate('courseId', 'title instructor level');
    res.json(enrollments.map(e => ({
      _id: e._id,
      courseTitle: e.courseId?.title,
      instructor: e.courseId?.instructor,
      level: e.courseId?.level,
      completedAt: e.completedAt || e.updatedAt,
      certificateId: e.certificateId,
    })));
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/certificates/:enrollmentId/generate
router.get('/:enrollmentId/generate', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.enrollmentId, userId: req.user._id });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    if (enrollment.progress < 100) return res.status(400).json({ message: 'Course not completed yet' });

    const course = await Course.findById(enrollment.courseId);
    const user = await User.findById(req.user._id);
    if (!course || !user) return res.status(404).json({ message: 'Data not found' });

    // Generate or reuse certificate ID
    if (!enrollment.certificateId) {
      enrollment.certificateId = `VES-${uuidv4().slice(0, 8).toUpperCase()}`;
      enrollment.completedAt = enrollment.completedAt || new Date();
      await enrollment.save();
    }

    // Generate PDF
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=VES-Certificate-${enrollment.certificateId}.pdf`);
    doc.pipe(res);

    const w = doc.page.width;
    const h = doc.page.height;

    // Background
    doc.rect(0, 0, w, h).fill('#fafbff');

    // Border
    doc.rect(30, 30, w - 60, h - 60).lineWidth(3).stroke('#2563eb');
    doc.rect(35, 35, w - 70, h - 70).lineWidth(1).stroke('#93c5fd');

    // Corner decorations
    const cornerSize = 60;
    doc.save().translate(40, 40).moveTo(0, cornerSize).lineTo(0, 0).lineTo(cornerSize, 0).lineWidth(4).stroke('#f59e0b').restore();
    doc.save().translate(w - 40, 40).moveTo(0, cornerSize).lineTo(0, 0).lineTo(-cornerSize, 0).lineWidth(4).stroke('#f59e0b').restore();
    doc.save().translate(40, h - 40).moveTo(0, -cornerSize).lineTo(0, 0).lineTo(cornerSize, 0).lineWidth(4).stroke('#f59e0b').restore();
    doc.save().translate(w - 40, h - 40).moveTo(0, -cornerSize).lineTo(0, 0).lineTo(-cornerSize, 0).lineWidth(4).stroke('#f59e0b').restore();

    // Logo
    const path = require('path');
    const logoPath = path.join(__dirname, '..', '..', 'assets', 'logo.png');
    try { doc.image(logoPath, w / 2 - 30, 45, { width: 60, height: 60 }); } catch {}
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#2563eb').text('VEDHAEDUSPARK CENTRE', 0, 110, { align: 'center' });

    // Title
    doc.moveDown(2);
    doc.fontSize(32).font('Helvetica-Bold').fillColor('#1e293b').text('Certificate of Completion', 0, 110, { align: 'center' });

    // Decorative line
    doc.moveTo(w / 2 - 120, 150).lineTo(w / 2 + 120, 150).lineWidth(2).stroke('#f59e0b');

    // Body
    doc.fontSize(13).font('Helvetica').fillColor('#64748b').text('This is to certify that', 0, 175, { align: 'center' });

    doc.fontSize(28).font('Helvetica-Bold').fillColor('#1e40af').text(user.name, 0, 200, { align: 'center' });

    // Underline name
    const nameWidth = doc.widthOfString(user.name);
    doc.moveTo((w - nameWidth) / 2, 232).lineTo((w + nameWidth) / 2, 232).lineWidth(1).stroke('#93c5fd');

    doc.fontSize(13).font('Helvetica').fillColor('#64748b').text('has successfully completed the course', 0, 248, { align: 'center' });

    doc.fontSize(22).font('Helvetica-Bold').fillColor('#0f172a').text(`"${course.title}"`, 0, 275, { align: 'center' });

    doc.fontSize(11).font('Helvetica').fillColor('#94a3b8').text(`Level: ${course.level || 'General'} • Instructor: ${course.instructor || 'VES Team'}`, 0, 308, { align: 'center' });

    // Date and Certificate ID
    const completedDate = new Date(enrollment.completedAt || enrollment.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    doc.fontSize(11).fillColor('#64748b');
    doc.text(`Date: ${completedDate}`, 80, h - 120);
    doc.text(`Certificate ID: ${enrollment.certificateId}`, 80, h - 105);

    // Signature
    doc.moveTo(w - 280, h - 100).lineTo(w - 100, h - 100).lineWidth(1).stroke('#cbd5e1');
    doc.fontSize(10).fillColor('#64748b').text('VedhaEduSpark', w - 280, h - 95, { width: 180, align: 'center' });
    doc.fontSize(8).fillColor('#94a3b8').text('Authorized Signature', w - 280, h - 82, { width: 180, align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Certificate error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { uploadImage, uploadPdf } = require('../utils/cloudinary');

// POST /api/upload/image — Upload image (admin only)
router.post('/image', protect, admin, uploadImage.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: req.file.path, publicId: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/upload/avatar — Upload profile photo (any authenticated user)
router.post('/avatar', protect, uploadImage.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: req.file.path, publicId: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/upload/pdf — Upload PDF (admin only)
router.post('/pdf', protect, admin, uploadPdf.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: req.file.path, publicId: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const EBook = require('../models/EBook');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');
const { sendEbookEmail } = require('../utils/emailService');

// GET /api/ebooks — public listing (hide pdfUrl for paid ones)
router.get('/', async (req, res) => {
  try {
    const ebooks = await EBook.find({ isActive: true }).sort({ createdAt: -1 });
    const safe = ebooks.map(e => {
      const obj = e.toObject();
      if (!obj.isFree) delete obj.pdfUrl;
      return obj;
    });
    res.json(safe);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/ebooks/admin — admin listing (all fields)
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const ebooks = await EBook.find().sort({ createdAt: -1 });
    res.json(ebooks);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/ebooks/:id — user detail (pdfUrl only if free or has access)
router.get('/:id', protect, async (req, res) => {
  try {
    const ebook = await EBook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'E-Book not found' });
    const obj = ebook.toObject();
    const hasAccess = ebook.isFree || ebook.accessGranted.some(uid => uid.toString() === req.user._id.toString());
    obj.hasAccess = hasAccess;
    if (!hasAccess) delete obj.pdfUrl;
    res.json(obj);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/ebooks — admin create
router.post('/', protect, admin, async (req, res) => {
  try {
    const ebook = await EBook.create(req.body);
    res.status(201).json(ebook);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/ebooks/:id — admin update
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const ebook = await EBook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ebook) return res.status(404).json({ message: 'E-Book not found' });
    res.json(ebook);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/ebooks/:id — admin delete
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const ebook = await EBook.findByIdAndDelete(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'E-Book not found' });
    res.json({ message: 'E-Book deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/ebooks/:id/access — user requests access (free = instant, paid = coupon)
router.post('/:id/access', protect, async (req, res) => {
  try {
    const ebook = await EBook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'E-Book not found' });

    // Already has access
    if (ebook.accessGranted.some(uid => uid.toString() === req.user._id.toString())) {
      return res.json({ message: 'Access already granted', pdfUrl: ebook.pdfUrl });
    }

    if (ebook.isFree) {
      // Free — grant instantly
      ebook.accessGranted.push(req.user._id);
      ebook.downloadCount += 1;
      await ebook.save();
      return res.json({ message: 'Access granted!', pdfUrl: ebook.pdfUrl });
    }

    // Paid — validate coupon
    const { couponCode } = req.body;
    if (!couponCode) return res.status(400).json({ message: 'Coupon code required for paid e-books' });

    const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isUsed: false });
    if (!coupon) return res.status(400).json({ message: 'Invalid or already used coupon code' });

    // Mark coupon as used
    coupon.isUsed = true;
    coupon.usedBy = req.user._id;
    coupon.usedAt = new Date();
    await coupon.save();

    // Grant access
    ebook.accessGranted.push(req.user._id);
    ebook.downloadCount += 1;
    await ebook.save();

    res.json({ message: 'Access granted!', pdfUrl: ebook.pdfUrl });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/ebooks/:id/send-email — admin sends PDF to user email
router.post('/:id/send-email', protect, admin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const ebook = await EBook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'E-Book not found' });

    const sent = await sendEbookEmail(email, ebook.title, ebook.pdfUrl, ebook.author);
    if (sent) {
      ebook.downloadCount += 1;
      await ebook.save();
      res.json({ message: `E-Book sent to ${email}` });
    } else {
      res.status(500).json({ message: 'Failed to send email. Check BREVO SMTP settings.' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;

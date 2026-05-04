const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationHelper');

// ─── Rate Limiters ────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 15,
  message: { message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many reset requests. Try again later.' },
});

// ─── Helpers ─────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Google token verification (cryptographic)
let googleClient = null;
try {
  const { OAuth2Client } = require('google-auth-library');
  if (process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID);
  }
} catch { /* google-auth-library not installed, fall back to manual decode */ }

const verifyGoogleToken = async (credential) => {
  // Try cryptographic verification first
  if (googleClient) {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  }
  // Fallback: manual decode (for dev without google-auth-library)
  const parts = credential.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString());
};

// ─── Register ────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(name, email).catch((err) => console.error('Welcome email failed:', err.message));
    // Welcome notification
    createNotification(user._id, 'welcome', 'Welcome to VedhaEduSpark! 🎉', 'Start your learning journey. Explore courses and practice coding problems.', '/dashboard');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Login ───────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }
    const user = await User.findOne({ email });
    if (user && user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ message: 'This account uses Google Sign-In. Please use the Google button to log in.' });
    }
    if (user && (await user.matchPassword(password))) {
      // Update lastActive
      user.lastActive = new Date();
      await user.save({ validateBeforeSave: false });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Google OAuth ────────────────────────────
router.post('/google', authLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential is required' });

    // Verify the Google token
    const payload = await verifyGoogleToken(credential);
    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) return res.status(400).json({ message: 'Google email not verified' });

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Existing user — update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.authProvider || user.authProvider === 'local') {
          // Keep as local if they had a password
          user.authProvider = user.password ? 'local' : 'google';
        }
        if (picture && !user.avatar) user.avatar = picture;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // New user — create account
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        avatar: picture || '',
      });
      sendWelcomeEmail(name, email).catch(() => {});
      createNotification(user._id, 'welcome', 'Welcome to VedhaEduSpark! 🎉', 'Start your learning journey. Explore courses and practice coding problems.', '/dashboard');
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// ─── Get Me ──────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Update Profile ──────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, bio, college, branch, year, skills, avatar, currentPassword, newPassword } = req.body;

    // Password change
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required' });
      if (user.authProvider === 'google' && !user.password) {
        // Google user setting password for first time
        if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
        user.password = newPassword;
      } else {
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
        if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
        user.password = newPassword;
      }
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (branch !== undefined) user.branch = branch;
    if (year !== undefined) user.year = year;
    if (skills !== undefined) user.skills = skills;
    if (avatar !== undefined) user.avatar = avatar;

    // Update lastActive
    user.lastActive = new Date();

    await user.save({ validateBeforeSave: false });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Forgot Password ────────────────────────
router.post('/forgot-password', forgotLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide your email' });

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists — always say "sent"
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Block password reset for Google-only users
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ message: 'This account uses Google Sign-In. Please log in with Google instead.' });
    }

    // Generate reset token
    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    // Build reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Send email
    await sendResetPasswordEmail(user.name, user.email, resetUrl);

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    // If email fails, clear the token
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({ message: 'Failed to send reset email. Try again later.' });
  }
});

// ─── Reset Password ─────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash the token from URL and find matching user
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now login with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Create Admin ───────────────────────────
router.post('/create-admin', async (req, res) => {
  try {
    const { secretCode, name, email, password } = req.body;

    // Verify secret code
    if (!secretCode || secretCode !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: 'Invalid secret code. Access denied.' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === 'admin') {
        return res.status(400).json({ message: 'An admin with this email already exists' });
      }
      // Upgrade existing user to admin
      existingUser.role = 'admin';
      await existingUser.save({ validateBeforeSave: false });
      return res.json({
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: 'admin',
        token: generateToken(existingUser._id),
        message: 'Existing user upgraded to admin',
      });
    }

    // Create new admin user
    const user = await User.create({ name, email, password, role: 'admin' });

    sendWelcomeEmail(name, email).catch(() => {});
    createNotification(user._id, 'welcome', 'Welcome Admin! 🎉', 'You have admin access to VedhaEduSpark.', '/admin');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chat } = require('../utils/aiService');
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, message: { message: 'Too many AI requests. Try again later.' } });

// POST /api/ai/ask
router.post('/ask', protect, aiLimiter, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !messages.length) return res.status(400).json({ message: 'Message is required' });
    const response = await chat('ask', messages);
    res.json({ response });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/ai/code-hint
router.post('/code-hint', protect, aiLimiter, async (req, res) => {
  try {
    const { code, problem, language, messages } = req.body;
    const contextMsg = [
      ...(messages || []),
      { role: 'user', content: `Problem: ${problem || 'Not specified'}\nLanguage: ${language || 'Not specified'}\n\nMy code:\n\`\`\`\n${code || 'No code provided'}\n\`\`\`\n\nGive me hints to solve or fix this.` },
    ];
    const response = await chat('codeHint', contextMsg);
    res.json({ response });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/ai/explain
router.post('/explain', protect, aiLimiter, async (req, res) => {
  try {
    const { topic, messages } = req.body;
    const contextMsg = [
      ...(messages || []),
      { role: 'user', content: `Explain this concept: ${topic}` },
    ];
    const response = await chat('explain', contextMsg);
    res.json({ response });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;

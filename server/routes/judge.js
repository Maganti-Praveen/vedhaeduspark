const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createSubmission, LANGUAGE_IDS } = require('../utils/judge0');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');

// POST /api/judge/run - run code against sample test cases
router.post('/run', protect, async (req, res) => {
  try {
    const { code, language, input } = req.body;
    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      return res.status(400).json({ message: 'Unsupported language' });
    }

    const result = await createSubmission(code, languageId, input || '');
    
    res.json({
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: result.compile_output || '',
      status: result.status,
      time: result.time,
      memory: result.memory,
    });
  } catch (error) {
    if (error.message === 'RATE_LIMIT') {
      return res.status(429).json({ message: 'API rate limit reached. Please try again later.' });
    }
    res.status(500).json({ message: error.message });
  }
});

// POST /api/judge/submit - submit code against all test cases
router.post('/submit', protect, async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    if (!code || !language || !problemId) {
      return res.status(400).json({ message: 'Code, language, and problemId are required' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      return res.status(400).json({ message: 'Unsupported language' });
    }

    const allTestCases = [...problem.sampleTestCases, ...problem.hiddenTestCases];
    let passed = 0;
    let lastResult = null;
    let failedOutput = '';

    for (const tc of allTestCases) {
      try {
        const result = await createSubmission(code, languageId, tc.input);
        lastResult = result;

        if (result.status && result.status.id === 3) {
          const actual = (result.stdout || '').trim();
          const expected = tc.output.trim();
          if (actual === expected) {
            passed++;
          } else {
            failedOutput = `Expected: ${expected}\nGot: ${actual}`;
            break;
          }
        } else {
          failedOutput = result.stderr || result.compile_output || 'Runtime Error';
          break;
        }
      } catch (err) {
        if (err.message === 'RATE_LIMIT') {
          return res.status(429).json({ message: 'API rate limit reached. Please try again later.' });
        }
        failedOutput = err.message;
        break;
      }
    }

    const isAccepted = passed === allTestCases.length;
    const status = isAccepted ? 'Accepted' :
      (lastResult && lastResult.status && lastResult.status.id === 5) ? 'Time Limit Exceeded' :
      (lastResult && lastResult.status && lastResult.status.id === 6) ? 'Compilation Error' :
      (lastResult && lastResult.status && [7,8,9,10,11,12].includes(lastResult.status.id)) ? 'Runtime Error' :
      'Wrong Answer';

    const submission = await Submission.create({
      userId: req.user._id,
      problemId,
      code,
      language,
      status,
      runtime: lastResult ? `${lastResult.time || 0} s` : '0 s',
      memory: lastResult ? `${lastResult.memory || 0} KB` : '0 KB',
      testCasesPassed: passed,
      totalTestCases: allTestCases.length,
      output: failedOutput,
    });

    // Update user's solved problems if accepted
    if (isAccepted) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { solvedProblems: problemId },
      });
      await Problem.findByIdAndUpdate(problemId, { $inc: { solvedBy: 1 } });
    }

    res.json({
      submission,
      passed,
      total: allTestCases.length,
      status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

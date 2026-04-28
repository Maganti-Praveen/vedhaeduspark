const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chat } = require('../utils/aiService');
const rateLimit = require('express-rate-limit');
const PDFDocument = require('pdfkit');
const Resume = require('../models/Resume');

const resumeLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: { message: 'Too many resume requests. Try again later.' } });

// GET /api/resume/saved — get user's saved resume data
router.get('/saved', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    res.json(resume || null);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/resume/saved — save/update user's resume data
router.put('/saved', protect, async (req, res) => {
  try {
    const data = req.body;
    data.userId = req.user._id;
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user._id },
      data,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(resume);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/resume/ats-check — Analyze resume for ATS compatibility
router.post('/ats-check', protect, resumeLimiter, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ message: 'Please provide resume text (at least 50 characters)' });
    }

    let prompt = `Analyze this resume for ATS compatibility:\n\n${resumeText}`;
    if (jobDescription?.trim()) {
      prompt += `\n\n--- TARGET JOB DESCRIPTION ---\n${jobDescription}`;
    }

    const response = await chat('atsChecker', [{ role: 'user', content: prompt }], { temperature: 0.3, max_tokens: 2048 });

    // Parse JSON response
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(cleaned);
      res.json(analysis);
    } catch {
      res.json({ score: 0, summary: response, sections: {}, topImprovements: [], atsKeywords: [], raw: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/resume/optimize — AI-optimize resume content
router.post('/optimize', protect, resumeLimiter, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: 'Both resume text and job description are required' });
    }

    const prompt = `Optimize this resume for the target job:\n\nRESUME:\n${resumeText}\n\nTARGET JOB:\n${jobDescription}`;
    const response = await chat('resumeOptimizer', [{ role: 'user', content: prompt }], { temperature: 0.4, max_tokens: 2048 });

    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleaned);
      res.json(result);
    } catch {
      res.json({ optimizedSections: { general: [response] }, raw: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/resume/generate-summary — AI-generate professional summary
router.post('/generate-summary', protect, resumeLimiter, async (req, res) => {
  try {
    const { name, title, experience, skills, education } = req.body;
    const prompt = `Generate a professional summary for:\nName: ${name || 'Not specified'}\nTitle/Role: ${title || 'Not specified'}\nExperience: ${experience || 'Fresher'}\nKey Skills: ${skills || 'Not specified'}\nEducation: ${education || 'Not specified'}`;

    const response = await chat('resumeSummary', [{ role: 'user', content: prompt }], { temperature: 0.7, max_tokens: 256 });
    res.json({ summary: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/resume/generate-pdf — Generate PDF from resume data
router.post('/generate-pdf', protect, async (req, res) => {
  try {
    const { data, template } = req.body;
    if (!data) return res.status(400).json({ message: 'Resume data is required' });

    const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 50, right: 50 } });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => {
      const pdf = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${(data.name || 'Resume').replace(/\s/g, '_')}_Resume.pdf"`);
      res.send(pdf);
    });

    const colors = {
      clean: { primary: '#1a1a2e', accent: '#2563eb', text: '#333333', light: '#6b7280' },
      modern: { primary: '#0f172a', accent: '#7c3aed', text: '#334155', light: '#64748b' },
      academic: { primary: '#1e293b', accent: '#0369a1', text: '#374151', light: '#6b7280' },
      fresher: { primary: '#111827', accent: '#059669', text: '#374151', light: '#6b7280' },
    };
    const c = colors[template] || colors.clean;

    // ── HEADER ──
    doc.fontSize(22).fillColor(c.primary).font('Helvetica-Bold').text(data.name || 'Your Name', { align: 'left' });
    if (data.title) doc.fontSize(11).fillColor(c.accent).font('Helvetica').text(data.title);
    doc.moveDown(0.3);

    // Contact line
    const contactParts = [data.email, data.phone, data.location, data.linkedin, data.portfolio].filter(Boolean);
    if (contactParts.length) {
      doc.fontSize(8.5).fillColor(c.light).text(contactParts.join('  •  '), { align: 'left' });
    }
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(c.accent).lineWidth(1.5).stroke();
    doc.moveDown(0.6);

    // ── SUMMARY ──
    if (data.summary?.trim()) {
      doc.fontSize(11).fillColor(c.primary).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY');
      doc.moveDown(0.2);
      doc.fontSize(9.5).fillColor(c.text).font('Helvetica').text(data.summary, { lineGap: 2 });
      doc.moveDown(0.6);
    }

    // ── EXPERIENCE ──
    if (data.experience?.length) {
      doc.fontSize(11).fillColor(c.primary).font('Helvetica-Bold').text('EXPERIENCE');
      doc.moveDown(0.2);
      data.experience.forEach((exp) => {
        doc.fontSize(10).fillColor(c.primary).font('Helvetica-Bold').text(exp.title || 'Role');
        const compLine = [exp.company, exp.dates].filter(Boolean).join('  |  ');
        if (compLine) doc.fontSize(8.5).fillColor(c.accent).font('Helvetica').text(compLine);
        if (exp.bullets?.length) {
          exp.bullets.filter(b => b.trim()).forEach((b) => {
            doc.fontSize(9).fillColor(c.text).font('Helvetica').text(`•  ${b}`, { indent: 10, lineGap: 1.5 });
          });
        }
        doc.moveDown(0.4);
      });
      doc.moveDown(0.3);
    }

    // ── EDUCATION ──
    if (data.education?.length) {
      doc.fontSize(11).fillColor(c.primary).font('Helvetica-Bold').text('EDUCATION');
      doc.moveDown(0.2);
      data.education.forEach((edu) => {
        doc.fontSize(10).fillColor(c.primary).font('Helvetica-Bold').text(edu.degree || 'Degree');
        const eduLine = [edu.institution, edu.year, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join('  |  ');
        if (eduLine) doc.fontSize(8.5).fillColor(c.light).font('Helvetica').text(eduLine);
        doc.moveDown(0.3);
      });
      doc.moveDown(0.3);
    }

    // ── SKILLS ──
    if (data.skills?.length) {
      doc.fontSize(11).fillColor(c.primary).font('Helvetica-Bold').text('SKILLS');
      doc.moveDown(0.2);
      doc.fontSize(9).fillColor(c.text).font('Helvetica').text(data.skills.join('  •  '), { lineGap: 2 });
      doc.moveDown(0.6);
    }

    // ── PROJECTS ──
    if (data.projects?.length) {
      doc.fontSize(11).fillColor(c.primary).font('Helvetica-Bold').text('PROJECTS');
      doc.moveDown(0.2);
      data.projects.forEach((proj) => {
        doc.fontSize(10).fillColor(c.primary).font('Helvetica-Bold').text(proj.title || 'Project');
        if (proj.tech) doc.fontSize(8).fillColor(c.accent).font('Helvetica').text(proj.tech);
        if (proj.description) doc.fontSize(9).fillColor(c.text).font('Helvetica').text(proj.description, { lineGap: 1.5 });
        if (proj.link) doc.fontSize(8).fillColor(c.accent).text(proj.link);
        doc.moveDown(0.3);
      });
      doc.moveDown(0.3);
    }

    // ── CERTIFICATIONS ──
    if (data.certifications?.length) {
      doc.fontSize(11).fillColor(c.primary).font('Helvetica-Bold').text('CERTIFICATIONS');
      doc.moveDown(0.2);
      data.certifications.forEach((cert) => {
        doc.fontSize(9).fillColor(c.text).font('Helvetica').text(`•  ${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`, { lineGap: 1.5 });
      });
      doc.moveDown(0.3);
    }

    // ── LANGUAGES ──
    if (data.languages?.length) {
      doc.fontSize(11).fillColor(c.primary).font('Helvetica-Bold').text('LANGUAGES');
      doc.moveDown(0.2);
      doc.fontSize(9).fillColor(c.text).font('Helvetica').text(data.languages.join('  •  '));
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

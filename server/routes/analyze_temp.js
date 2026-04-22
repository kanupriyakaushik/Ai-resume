import express from 'express'
import multer from 'multer'
import Groq from 'groq-sdk'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { protect } from '../middleware/auth.js'
import Analysis from '../models/Analysis.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are allowed'), false)
  },
})

// ── POST /api/analyze ────────────────────────────────────────
router.post('/', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'Please upload a PDF file.' })

    // Parse PDF
    let resumeText = ''
    try {
      const parsed = await pdfParse(req.file.buffer)
      resumeText = parsed.text?.trim()
    } catch {
      return res.status(400).json({ message: 'Could not read the PDF. Make sure it is a text-based PDF, not a scanned image.' })
    }

    if (!resumeText)
      return res.status(400).json({ message: 'The PDF appears empty or is image-only. Please upload a text-based PDF.' })

    const jobDescription = req.body.jobDescription?.trim() || ''

    const prompt = `You are an expert resume analyst and ATS specialist.

Analyze the resume below${jobDescription ? ' against the provided job description' : ''} and return ONLY a valid JSON object. No markdown, no explanation, no backticks — just raw JSON.

Required JSON structure:
{
  "overallScore": <integer 0-100>,
  "matchScore": <integer 0-100, set to 0 if no job description provided>,
  "atsScore": <integer 0-100>,
  "verdict": "<2-3 sentence professional assessment of this candidate>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
  "sections": {
    "experience": { "score": <0-100>, "feedback": "<one sentence>" },
    "education":  { "score": <0-100>, "feedback": "<one sentence>" },
    "skills":     { "score": <0-100>, "feedback": "<one sentence>", "missing": ["<skill>", "<skill>"] },
    "formatting": { "score": <0-100>, "feedback": "<one sentence>" },
    "summary":    { "score": <0-100>, "feedback": "<one sentence>" }
  }
}

RESUME TEXT:
${resumeText.slice(0, 3500)}
${jobDescription ? `\nJOB DESCRIPTION:\n${jobDescription.slice(0, 1500)}` : ''}

Return ONLY the JSON object. Nothing else.`

    // Call Groq (free)
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a resume analysis expert. Always respond with valid JSON only. No markdown, no backticks, no explanation.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    })

    // Parse response
    let result
    try {
      const raw = completion.choices[0].message.content.trim()
      const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      return res.status(500).json({ message: 'AI returned an unexpected response. Please try again.' })
    }

    // Save to database
    const saved = await Analysis.create({
      userId:          req.user._id,
      fileName:        req.file.originalname,
      overallScore:    result.overallScore    || 0,
      matchScore:      result.matchScore      || 0,
      atsScore:        result.atsScore        || 0,
      verdict:         result.verdict         || '',
      strengths:       result.strengths       || [],
      improvements:    result.improvements    || [],
      missingKeywords: result.missingKeywords || [],
      sections:        result.sections        || {},
    })

    res.json({ ...result, id: saved._id })

  } catch (err) {
    console.error('Analyze error:', err.message)
    res.status(500).json({ message: err.message || 'Analysis failed. Please try again.' })
  }
})

// ── GET /api/analyze/history ─────────────────────────────────
router.get('/history', protect, async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
    res.json(history)
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch history.' })
  }
})

// ── GET /api/analyze/:id ─────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id })
    if (!analysis) return res.status(404).json({ message: 'Analysis not found.' })
    res.json(analysis)
  } catch {
    res.status(500).json({ message: 'Could not fetch analysis.' })
  }
})

// ── DELETE /api/analyze/:id ──────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!deleted) return res.status(404).json({ message: 'Analysis not found.' })
    res.json({ message: 'Deleted successfully.' })
  } catch {
    res.status(500).json({ message: 'Could not delete.' })
  }
})

export default router
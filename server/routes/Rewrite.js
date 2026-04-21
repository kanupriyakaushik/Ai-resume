import express from 'express'
import Groq from 'groq-sdk'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY })

// POST /api/rewrite
router.post('/', protect, async (req, res) => {
  try {
    const { bulletPoints, jobDescription } = req.body

    if (!bulletPoints?.trim())
      return res.status(400).json({ error: 'Please provide your bullet points.' })
    if (!jobDescription?.trim())
      return res.status(400).json({ error: 'Please provide the job description.' })

    const prompt = `You are an expert resume writer for tech roles.

Rewrite these resume bullet points to be stronger, metrics-driven, and ATS-optimized.

Rules:
- Start each bullet with a strong past-tense action verb
- Add specific numbers/percentages where reasonable
- Match keywords from the job description
- Keep each bullet to 1-2 lines max

Return ONLY valid JSON, no markdown:
{
  "rewritten": [
    {
      "original": "<exact original bullet>",
      "improved": "<stronger rewritten bullet>",
      "reason": "<one sentence: what was improved>"
    }
  ],
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

BULLET POINTS:
${bulletPoints.trim()}

JOB DESCRIPTION:
${jobDescription.trim().slice(0, 1500)}

Return ONLY the JSON. Nothing else.`

    const groq = getGroq()
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert resume writer. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    })

    let result
    try {
      const raw = completion.choices[0].message.content.trim()
      const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      return res.status(500).json({ error: 'AI returned unexpected response. Please try again.' })
    }

    res.json(result)

  } catch (err) {
    console.error('Rewrite error:', err.message)
    res.status(500).json({ error: err.message || 'Rewrite failed.' })
  }
})

export default router
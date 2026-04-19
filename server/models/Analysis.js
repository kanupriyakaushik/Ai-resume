import mongoose from 'mongoose'

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName:        { type: String, default: 'resume.pdf' },
    overallScore:    { type: Number, default: 0 },
    matchScore:      { type: Number, default: 0 },
    atsScore:        { type: Number, default: 0 },
    verdict:         { type: String, default: '' },
    strengths:       { type: [String], default: [] },
    improvements:    { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    sections:        { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

export default mongoose.model('Analysis', analysisSchema)
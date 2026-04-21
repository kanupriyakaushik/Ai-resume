import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes    from './routes/auth.js'
import analyzeRoutes from './routes/analyze.js'
import rewriteRoutes from './routes/rewrite.js'

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth',    authRoutes)
app.use('/api/analyze', analyzeRoutes)
app.use('/api/rewrite', rewriteRoutes)

app.get('/', (req, res) => {
  res.json({ status: 'API running ✅' })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(5000, () => {
      console.log('🚀 Server on http://localhost:5000')
      console.log('🔑 GROQ KEY:', process.env.GROQ_API_KEY ? 'LOADED ✅' : 'MISSING ❌')
    })
  })
  .catch(err => console.error('❌ MongoDB error:', err.message))
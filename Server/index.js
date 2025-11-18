import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'
import path from 'path'
import connectDB from './config/db.js'
import commonRoutes from './routes/common.js'
import wordRoute from './routes/word.js'
import wordscrambleRoute from './routes/word-scramble.js'
import whackRoute from './routes/whack.js'
import typingRoute from './routes/typing.js'
import simonRoute from './routes/simon.js'
import memoryRoute from './routes/memory.js'
import mathRoute from './routes/math.js'
import emojiRoute from './routes/emoji.js'
import scoresRoute from './routes/scores.js'
import authRoute from './routes/auth.js'
import progressRoute from './routes/progress.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5175', 'http://127.0.0.1:5175'] }))
app.use(bodyParser.json({ limit: '50kb' }))

// Basic rate limiter for api endpoints
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 })
app.use('/api/', apiLimiter)

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gaming_arcade'
connectDB(MONGO_URI).then(() => console.log('MongoDB connected')).catch(err => console.error('Mongo connect error', err))

// Mount routes
app.use('/api/auth', authRoute)
app.use('/api/common', commonRoutes)
app.use('/api/games/word', wordRoute)
app.use('/api/games/word-scramble', wordscrambleRoute)
app.use('/api/games/whack', whackRoute)
app.use('/api/games/typing', typingRoute)
app.use('/api/games/simon', simonRoute)
app.use('/api/games/memory', memoryRoute)
app.use('/api/games/math', mathRoute)
app.use('/api/games/emoji', emojiRoute)
app.use('/api/scores', scoresRoute)
app.use('/api/progress', progressRoute)

// Some convenience endpoints preserved from previous implementation where
// route modules return static/sample data.

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
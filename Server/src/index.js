import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'
import path from 'path'
import { createRequire } from 'module'

// Use createRequire to load existing CommonJS route modules
const require = createRequire(import.meta.url)

const connectDB = require('../config/db')
const commonRoutes = require('../routes/common')
const wordRoute = require('../routes/word')
const wordscrambleRoute = require('../routes/word-scramble')
const whackRoute = require('../routes/whack')
const typingRoute = require('../routes/typing')
const simonRoute = require('../routes/simon')
const memoryRoute = require('../routes/memory')
const mathRoute = require('../routes/math')
const emojiRoute = require('../routes/emoji')
const scoresRoute = require('../routes/scores')
const authRoute = require('../routes/auth')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
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

// Some convenience endpoints preserved from previous implementation where
// route modules return static/sample data.

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'
import path from 'path'
import { createRequire } from 'module'

// Use createRequire to load existing CommonJS route modules
const require = createRequire(import.meta.url)

const connectDB = require('../config/db')
const commonRoutes = require('../routes/common')
const wordRoute = require('../routes/word')
const wordscrambleRoute = require('../routes/word-scramble')
const whackRoute = require('../routes/whack')
const typingRoute = require('../routes/typing')
const simonRoute = require('../routes/simon')
const memoryRoute = require('../routes/memory')
const mathRoute = require('../routes/math')
const emojiRoute = require('../routes/emoji')
const scoresRoute = require('../routes/scores')
const authRoute = require('../routes/auth')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
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

// Some convenience endpoints preserved from previous implementation where
// route modules return static/sample data.

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))

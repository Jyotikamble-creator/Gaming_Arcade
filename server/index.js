import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'

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
import quizRoute from './routes/quiz.js'
import sudokuRoute from './routes/sudoku.js'
import wordBuilderRoute from './routes/word-builder.js'

// Load environment variables from root .env file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env') })

const app = express()

// CORS configuration using environment variables
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

app.use(cors({ origin: corsOrigins }))
app.use(bodyParser.json({ limit: '50kb' }))

// Basic rate limiter for api endpoints
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 })
app.use('/api/', apiLimiter)

// Connect to MongoDB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gaming_arcade'
connectDB(MONGO_URI).then(() => console.log('MongoDB connected')).catch(err => console.error('Mongo connect error', err))

// Mount routes
app.use('/api/auth', authRoute)
app.use('/api/common', commonRoutes)
app.use('/api/games/word', wordRoute)
app.use('/api/games/word-scramble', wordscrambleRoute)
app.use('/api/games/whack', whackRoute)
app.use('/api/games/typing', typingRoute)
app.use('/api/games/simon', simonRoute)
app.use('/api/games/memory-card', memoryRoute)
app.use('/api/games/math', mathRoute)
app.use('/api/games/emoji', emojiRoute)
app.use('/api/scores', scoresRoute)
app.use('/api/progress', progressRoute)
app.use('/api/games/quiz', quizRoute)
app.use('/api/games/sudoku', sudokuRoute)
app.use('/api/games/word-builder', wordBuilderRoute)

// POST /api/logs - for client-side logging in development
app.post('/api/logs', (req, res) => {
  const { level, tag, message, context } = req.body;
  console.log(`[CLIENT-${level.toUpperCase()}] [${tag}] ${message}`, context ? JSON.stringify(context) : '');
  res.status(200).json({ ok: true });
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
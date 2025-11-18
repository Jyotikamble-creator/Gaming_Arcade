import express from 'express'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import Score from '../models/Score.js'
import User from '../models/User.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

// Rate limiter for score submissions: 10 per minute per IP
const scoreLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: 'Too many score submissions, please try again later.' })

// Helper: try to decode token, return userId or null
async function decodeUserIdFromHeader(req) {
  try {
    const auth = req.headers.authorization
    if (!auth) return null
    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded && decoded.id ? decoded.id : null
  } catch (err) {
    return null
  }
}

// POST /api/scores
// Body: { game, score, meta?, playerName? }
router.post('/', scoreLimiter, async (req, res) => {
  try {
    const { game, score, meta, playerName } = req.body
    if (!game || typeof game !== 'string' || typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: 'game (string) and score (non-negative number) required' })
    }
    if (meta && typeof meta !== 'object') {
      return res.status(400).json({ error: 'meta must be an object if provided' })
    }
    const userId = await decodeUserIdFromHeader(req)
    const doc = await Score.create({
      game,
      score,
      meta: meta || {},
      playerName: userId ? undefined : (playerName || 'guest'),
      user: userId || null
    })
    res.status(201).json({ ok: true, score: doc })
  } catch (err) {
    console.error('scores POST err', err)
    res.status(500).json({ error: 'server error' })
  }
})

// GET /api/scores?game=word&limit=10
router.get('/', async (req, res) => {
  try {
    const { game, limit = 10 } = req.query
    const q = {}
    if (game) q.game = game
    const docs = await Score.find(q).sort({ score: -1, createdAt: 1 }).limit(Number(limit)).populate('user', 'username displayName')
    res.json(docs)
  } catch (err) {
    console.error('scores GET err', err)
    res.status(500).json({ error: 'server error' })
  }
})

// GET /api/scores/me?game=word
router.get('/me', async (req, res) => {
  try {
    const userId = await decodeUserIdFromHeader(req)
    if (!userId) return res.status(401).json({ error: 'unauthorized' })
    const { game } = req.query
    const q = { user: userId }
    if (game) q.game = game
    const docs = await Score.find(q).sort({ createdAt: -1 }).limit(100)
    res.json(docs)
  } catch (err) {
    console.error('scores me err', err)
    res.status(500).json({ error: 'server error' })
  }
})

export default router

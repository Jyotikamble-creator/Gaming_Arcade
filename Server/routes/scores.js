const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Score = require('../models/Score')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

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
router.post('/', async (req, res) => {
  try {
    const { game, score, meta, playerName } = req.body
    if (!game || typeof score !== 'number') return res.status(400).json({ error: 'game and numeric score required' })
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

module.exports = router
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Score = require('../models/Score')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

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
router.post('/', async (req, res) => {
  try {
    const { game, score, meta, playerName } = req.body
    if (!game || typeof score !== 'number') return res.status(400).json({ error: 'game and numeric score required' })
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

module.exports = router

import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'no token' })
    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'invalid token' })
  }
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email,password required' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'email already in use' })
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const user = await User.create({ email, passwordHash: hash })
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user._id, email: user.email } })
  } catch (err) {
    console.error('signup err', err)
    res.status(500).json({ error: 'server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email,password required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email } })
  } catch (err) {
    console.error('login err', err)
    res.status(500).json({ error: 'server error' })
  }
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'no token' })
    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.id).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'user not found' })
    res.json({ user })
  } catch (err) {
    console.error('me err', err)
    res.status(401).json({ error: 'invalid token' })
  }
})

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    // No fields to update currently
    res.json({ user: { id: req.user.id, email: req.user.email } })
  } catch (err) {
    console.error('profile update err', err)
    res.status(500).json({ error: 'server error' })
  }
})

export default router

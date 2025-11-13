import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body
    if (!username || !email || !password) return res.status(400).json({ error: 'username,email,password required' })
    const existing = await User.findOne({ $or: [{ username }, { email }] })
    if (existing) return res.status(409).json({ error: 'username or email already in use' })
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const user = await User.create({ username, email, passwordHash: hash, displayName })
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user._id, username: user.username, displayName: user.displayName } })
  } catch (err) {
    console.error('signup err', err)
    res.status(500).json({ error: 'server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body
    if (!usernameOrEmail || !password) return res.status(400).json({ error: 'usernameOrEmail,password required' })
    const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] })
    if (!user) return res.status(401).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, username: user.username, displayName: user.displayName } })
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

export default router

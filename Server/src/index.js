import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import rateLimit from 'express-rate-limit'
import { body, validationResult } from 'express-validator'

const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(bodyParser.json({ limit: '10kb' }))

// Basic rate limiter for api endpoints
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 })
app.use('/api/', apiLimiter)

// Put the database under the server package's own data folder. When running from
// the `Server` directory (recommended) process.cwd() will be that folder and
// data will be created at <repo>/Server/data. This avoids creating nested
// 'server/server/data' directories if started from repo root.
const DB_DIR = path.join(process.cwd(), 'data')
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
const DB_PATH = path.join(DB_DIR, 'app.db')

const db = new Database(DB_PATH)

// Initialize schema
db.exec(`
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game TEXT NOT NULL,
  word TEXT NOT NULL,
  description TEXT
);
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game TEXT NOT NULL,
  player TEXT,
  score INTEGER,
  created_at TEXT
);
`)

// Seed example words for word-guess if empty
const count = db.prepare('SELECT COUNT(*) as c FROM words WHERE game = ?').get('word-guess').c
if (count === 0) {
  const insert = db.prepare('INSERT INTO words (game, word, description) VALUES (?, ?, ?)')
  insert.run('word-guess', 'APPLE', 'A fruit')
  insert.run('word-guess', 'MANGO', 'Tropical fruit')
  insert.run('word-guess', 'HOUSE', 'Place to live')
}

app.get('/api/games/:game/words', (req, res) => {
  const game = req.params.game
  const words = db.prepare('SELECT id, word, description FROM words WHERE game = ?').all(game)
  res.json(words)
})

app.post('/api/scores',
  // validation
  body('game').isString().isLength({ min: 1, max: 50 }),
  body('player').optional().isString().isLength({ max: 100 }),
  body('score').isInt({ min: 0 }),
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const { game, player = 'guest', score } = req.body
    const stmt = db.prepare('INSERT INTO scores (game, player, score, created_at) VALUES (?, ?, ?, ?)')
    const info = stmt.run(game, player, score, new Date().toISOString())
    res.status(201).json({ id: info.lastInsertRowid })
  }
)

app.get('/api/scores', (req, res) => {
  const { game } = req.query
  if (!game) return res.status(400).json({ error: 'game query required' })
  const rows = db.prepare('SELECT player, score, created_at FROM scores WHERE game = ? ORDER BY score DESC LIMIT 20').all(game)
  res.json(rows)
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))

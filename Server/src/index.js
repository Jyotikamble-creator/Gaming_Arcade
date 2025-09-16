import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const app = express()
app.use(cors())
app.use(bodyParser.json())

const DB_DIR = path.join(process.cwd(), 'server', 'data')
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

app.post('/api/scores', (req, res) => {
  const { game, player = 'guest', score } = req.body
  if (!game || typeof score !== 'number') return res.status(400).json({ error: 'Invalid payload' })
  const stmt = db.prepare('INSERT INTO scores (game, player, score, created_at) VALUES (?, ?, ?, ?)')
  const info = stmt.run(game, player, score, new Date().toISOString())
  res.status(201).json({ id: info.lastInsertRowid })
})

app.get('/api/scores', (req, res) => {
  const { game } = req.query
  if (!game) return res.status(400).json({ error: 'game query required' })
  const rows = db.prepare('SELECT player, score, created_at FROM scores WHERE game = ? ORDER BY score DESC LIMIT 20').all(game)
  res.json(rows)
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))

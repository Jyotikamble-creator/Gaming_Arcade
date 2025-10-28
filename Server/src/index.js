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
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  answer TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS passages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game TEXT NOT NULL,
  text TEXT NOT NULL
);
`)

// Seed example words for word-guess if empty
const wordCount = db.prepare('SELECT COUNT(*) as c FROM words WHERE game = ?').get('word-guess').c
if (wordCount === 0) {
  const insertWord = db.prepare('INSERT INTO words (game, word, description) VALUES (?, ?, ?)')
  insertWord.run('word-guess', 'APPLE', 'A fruit')
  insertWord.run('word-guess', 'MANGO', 'Tropical fruit')
  insertWord.run('word-guess', 'HOUSE', 'Place to live')
  insertWord.run('word-guess', 'COMPUTER', 'Electronic device')
  insertWord.run('word-guess', 'GARDEN', 'Place for plants')
}

// Seed memory card data
const memoryCount = db.prepare('SELECT COUNT(*) as c FROM words WHERE game = ?').get('memory-card').c
if (memoryCount === 0) {
  const insertMemory = db.prepare('INSERT INTO words (game, word, description) VALUES (?, ?, ?)')
  const pairs = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']
  pairs.forEach(emoji => {
    insertMemory.run('memory-card', emoji, emoji)
  })
}

// Seed math quiz questions
const mathCount = db.prepare('SELECT COUNT(*) as c FROM questions WHERE game = ?').get('math-quiz').c
if (mathCount === 0) {
  const insertQuestion = db.prepare('INSERT INTO questions (game, question, options, answer) VALUES (?, ?, ?, ?)')
  insertQuestion.run('math-quiz', 'What is 15 + 27?', JSON.stringify([42, 41, 43, 40]), '42')
  insertQuestion.run('math-quiz', 'What is 8 × 7?', JSON.stringify([56, 54, 58, 52]), '56')
  insertQuestion.run('math-quiz', 'What is 144 ÷ 12?', JSON.stringify([12, 11, 13, 10]), '12')
  insertQuestion.run('math-quiz', 'What is 25²?', JSON.stringify([625, 525, 725, 425]), '625')
  insertQuestion.run('math-quiz', 'What is √81?', JSON.stringify([9, 8, 10, 7]), '9')
}

// Seed typing passages
const typingCount = db.prepare('SELECT COUNT(*) as c FROM passages WHERE game = ?').get('typing-test').c
if (typingCount === 0) {
  const insertPassage = db.prepare('INSERT INTO passages (game, text) VALUES (?, ?)')
  insertPassage.run('typing-test', 'The quick brown fox jumps over the lazy dog. This pangram contains all letters of the alphabet.')
  insertPassage.run('typing-test', 'Programming is the art of telling a computer what you want it to do. Code is poetry written for machines.')
  insertPassage.run('typing-test', 'React is a JavaScript library for building user interfaces. It makes interactive UIs painless to create.')
}

app.get('/api/games/:game/words', (req, res) => {
  const game = req.params.game
  const words = db.prepare('SELECT id, word, description FROM words WHERE game = ?').all(game)
  res.json(words)
})

// Memory card endpoint - returns shuffled cards
app.get('/api/games/memory-card/start', (req, res) => {
  const cards = db.prepare('SELECT word as value FROM words WHERE game = ?').all('memory-card')
  // Create pairs and shuffle
  const pairs = []
  cards.forEach((card, index) => {
    pairs.push({ id: index * 2, value: card.value })
    pairs.push({ id: index * 2 + 1, value: card.value })
  })
  // Simple shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  res.json({ cards: pairs })
})

// Math quiz questions endpoint
app.get('/api/questions/math-quiz', (req, res) => {
  const questions = db.prepare('SELECT question as q, options, answer as ans FROM questions WHERE game = ?').all('math-quiz')
  const formattedQuestions = questions.map(q => ({
    ...q,
    options: JSON.parse(q.options)
  }))
  res.json({ questions: formattedQuestions })
})

// Typing test passage endpoint
app.get('/api/typing/passage', (req, res) => {
  const passages = db.prepare('SELECT text FROM passages WHERE game = ?').all('typing-test')
  const randomPassage = passages[Math.floor(Math.random() * passages.length)]
  res.json({ text: randomPassage.text })
})

// Word scramble endpoint
app.get('/api/games/word-scramble/words', (req, res) => {
  const words = db.prepare('SELECT word FROM words WHERE game = ?').all('word-guess')
  if (words.length === 0) {
    return res.json({ word: 'EXAMPLE', scrambled: 'MELXPAE' })
  }
  const randomWord = words[Math.floor(Math.random() * words.length)]
  const word = randomWord.word
  const scrambled = word.split('').sort(() => Math.random() - 0.5).join('')
  res.json({ word, scrambled })
})

// Quiz questions endpoint (reuse math questions for now)
app.get('/api/questions/quiz', (req, res) => {
  const questions = db.prepare('SELECT question as q, options, answer as ans FROM questions WHERE game = ?').all('math-quiz')
  const formattedQuestions = questions.map(q => ({
    ...q,
    options: JSON.parse(q.options)
  }))
  res.json({ questions: formattedQuestions })
})

// Emoji guess endpoint
app.get('/api/games/emoji-guess/words', (req, res) => {
  const emojis = [
    { emojis: '🐶🏠', answer: 'doghouse' },
    { emojis: '🚗🔑', answer: 'car key' },
    { emojis: '📱💔', answer: 'broken phone' },
    { emojis: '🌧️🌈', answer: 'rainbow' },
    { emojis: '🍕❤️', answer: 'love pizza' }
  ]
  const random = emojis[Math.floor(Math.random() * emojis.length)]
  res.json(random)
})

// Whack-a-mole start endpoint
app.get('/api/games/whack/start', (req, res) => {
  res.json({ gridSize: 9, duration: 30 })
})

// Simon Says start endpoint
app.get('/api/games/simon/start', (req, res) => {
  res.json({ colors: ['red', 'blue', 'green', 'yellow'] })
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

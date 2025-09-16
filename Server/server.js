// Server/server.js
import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(bodyParser.json())

const DATA_FILE = path.join(process.cwd(), 'Server', 'scores.json')

// helper: ensure file
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]))

app.post('/api/scores', (req, res) => {
  const score = req.body
  if (!score || typeof score.score !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' })
  }
  const arr = JSON.parse(fs.readFileSync(DATA_FILE))
  arr.push({ ...score, createdAt: new Date().toISOString() })
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2))
  res.status(201).json({ ok: true })
})

app.get('/api/scores', (req, res) => {
  const arr = JSON.parse(fs.readFileSync(DATA_FILE))
  res.json(arr)
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Score server listening on ${port}`))
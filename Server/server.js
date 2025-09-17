// // Server/server.js
// import express from 'express'
// import bodyParser from 'body-parser'
// import fs from 'fs'
// import path from 'path'

// const app = express()
// app.use(bodyParser.json())

// const DATA_FILE = path.join(process.cwd(), 'Server', 'scores.json')

// // helper: ensure file
// if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]))

// app.post('/api/scores', (req, res) => {
//   const score = req.body
//   if (!score || typeof score.score !== 'number') {
//     return res.status(400).json({ error: 'Invalid payload' })
//   }
//   const arr = JSON.parse(fs.readFileSync(DATA_FILE))
//   arr.push({ ...score, createdAt: new Date().toISOString() })
//   fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2))
//   res.status(201).json({ ok: true })
// })

// app.get('/api/scores', (req, res) => {
//   const arr = JSON.parse(fs.readFileSync(DATA_FILE))
//   res.json(arr)
// })

// const port = process.env.PORT || 4000
// app.listen(port, () => console.log(`Score server listening on ${port}`))








require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gaming_arcade';
connectDB(MONGO);

// common endpoints
app.use('/api/common', require('./routes/common'));

// game specific
app.use('/api/word', require('./routes/word'));
app.use('/api/memory', require('./routes/memory'));
app.use('/api/math', require('./routes/math'));
app.use('/api/typing', require('./routes/typing'));
app.use('/api/word-scramble', require('./routes/word-scramble'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/emoji', require('./routes/emoji'));
app.use('/api/whack', require('./routes/whack'));
app.use('/api/simon', require('./routes/simon'));

app.get('/', (req,res)=> res.send('Gaming Arcade API'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log('Server listening on', PORT));

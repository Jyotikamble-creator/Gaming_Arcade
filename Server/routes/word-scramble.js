const express = require('express');
const router = express.Router();
// simple scrambling
function scramble(s){ return s.split('').sort(()=>Math.random()-0.5).join('') }

const words = ['REACT','JAVASCRIPT','PROGRAM','PUZZLE','GAMING'];
router.get('/start', (req,res) => {
  const word = words[Math.floor(Math.random()*words.length)];
  res.json({ word, scrambled: scramble(word) });
});

module.exports = router;
const express = require('express');
const router = express.Router();
// simple scrambling
function scramble(s){ return s.split('').sort(()=>Math.random()-0.5).join('') }

const words = ['REACT','JAVASCRIPT','PROGRAM','PUZZLE','GAMING'];
router.get('/start', (req,res) => {
  const word = words[Math.floor(Math.random()*words.length)];
  res.json({ word, scrambled: scramble(word) });
});

module.exports = router;

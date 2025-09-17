const express = require('express');
const router = express.Router();

const sampleWords = [
  { word: 'HELLO', description: 'A common greeting' },
  { word: 'WORLD', description: 'Our planet' },
  { word: 'JAVASCRIPT', description: 'Web language' },
  { word: 'REACT', description: 'UI library' },
  { word: 'PROGRAMMING', description: 'Coding' },
  { word: 'GEEKSFORGEEKS', description: 'Site' }
];

router.get('/random', (req,res) => {
  const idx = Math.floor(Math.random()*sampleWords.length);
  res.json(sampleWords[idx]);
});

module.exports = router;

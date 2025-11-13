import express from 'express';

const router = express.Router();

const sampleWords = [
  { word: 'HELLO', description: 'A common greeting' },
  { word: 'WORLD', description: 'Our planet' },
  { word: 'JAVASCRIPT', description: 'Web language' },
  { word: 'REACT', description: 'UI library' },
  { word: 'PROGRAMMING', description: 'Coding' },
  { word: 'GEEKSFORGEEKS', description: 'Site' }
];

router.get('/words', (req,res) => {
  res.json(sampleWords);
});

export default router;

import express from 'express';

const router = express.Router();

const questions = [
  { id:1, q: 'What is 2+2?', options: ['3','4','5','6'], ans:'4' },
  { id:2, q: 'Capital of France?', options: ['London','Berlin','Paris','Madrid'], ans:'Paris' },
  { id:3, q: 'Color of sky?', options: ['Red','Blue','Green','Yellow'], ans:'Blue' }
];

router.get('/questions', (req,res) => {
  res.json({ questions });
});

export default router;
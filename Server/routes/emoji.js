import express from 'express';

const router = express.Router();
const puzzles = [
  { id:1, emojis:'👑🐉', answer:'dragon king' },
  { id:2, emojis:'🚀🌕', answer:'moon rocket' }
];
router.get('/start', (req,res) => {
  res.json(puzzles[Math.floor(Math.random()*puzzles.length)]);
});
export default router;

import express from 'express';

const router = express.Router();
const paragraphs = [
  "Fast typing tests make you accurate and quick.",
  "Practice makes perfect: time, technique, rhythm."
];
router.get('/passage', (req,res) => {
  res.json({ text: paragraphs[Math.floor(Math.random()*paragraphs.length)] });
});
export default router;

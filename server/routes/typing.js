// Routes for Typing Test game
import express from "express";

// Create router
const router = express.Router();

// GET /api/typing/passage
// Get a random typing passage
const paragraphs = [
  "Fast typing tests make you accurate and quick.",
  "Practice makes perfect: time, technique, rhythm.",
];

// Get passage
router.get("/passage", (req, res) => {
  res.json({ text: paragraphs[Math.floor(Math.random() * paragraphs.length)] });
});
export default router;

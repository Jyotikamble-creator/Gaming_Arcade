// Routes for Word Scramble game
import express from "express";

// Create router
const router = express.Router();

// simple scrambling
function scramble(s) {
  return s
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// GET /api/games/word-scramble/words - Get a random word and its scrambled version
// Response: { word, scrambled }
const words = ["REACT", "JAVASCRIPT", "PROGRAM", "PUZZLE", "GAMING"];
router.get("/words", (req, res) => {
  // Get a random word
  const word = words[Math.floor(Math.random() * words.length)];
  res.json({ word, scrambled: scramble(word) });
});

export default router;

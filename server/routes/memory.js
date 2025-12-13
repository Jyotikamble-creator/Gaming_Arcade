// wordgame/server/routes/memory.js
// Memory card game
import express from "express";

// Create router
const router = express.Router();

// Shuffle helper
function shuffle(a) {
  return a.sort(() => Math.random() - 0.5);
}

// Start game
router.get("/start", (req, res) => {
  // Create shuffled cards
  const pairs = ["🍎", "🍌", "🍇", "🍊"];
  let cards = pairs
    .concat(pairs)
    .map((c, i) => ({ id: i, value: c, matched: false }));
  cards = shuffle(cards);
  res.json({ cards });
});

export default router;

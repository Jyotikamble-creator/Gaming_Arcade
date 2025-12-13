// Routes for common functionalities like scoring and leaderboards
// Includes posting scores and fetching leaderboards
import express from "express";
import Score from "../models/Score.js";
// Create router
const router = express.Router();

/* POST /api/common/score
  body: { game, player, score, meta }
*/
// Post a new score
router.post("/score", async (req, res) => {
  try {
    // Get game, player, score, meta
    const { game, player = "guest", score = 0, meta = {} } = req.body;
    const s = await Score.create({ game, playerName: player, score, meta });
    res.json({ ok: true, score: s });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* GET /api/common/leaderboard?game=word-guess&limit=10 */
// Get leaderboard for a game
router.get("/leaderboard", async (req, res) => {
  try {
    // Get game and limit from query
    const { game = "word-guess", limit = 10 } = req.query;
    // Get top scores
    const top = await Score.find({ game })
      .sort({ score: -1 })
      .limit(parseInt(limit));
    // Respond with leaderboard
    res.json({ ok: true, data: top });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;

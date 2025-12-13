// server/routes/progress.js
// Routes for user progress and statistics
// Provides endpoints to get user game progress and stats
import express from "express";
import jwt from "jsonwebtoken";
import Score from "../models/Score.js";

// Create router
const router = express.Router();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// Helper: try to decode token, return userId or null
async function decodeUserIdFromHeader(req) {
  try {
    // Get auth header
    const auth = req.headers.authorization;
    // If no auth header, return null
    if (!auth) return null;
    // Verify token
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && decoded.id ? decoded.id : null;
  } catch (err) {
    return null;
  }
}

// GET /api/progress/me
// Get user progress
router.get("/me", async (req, res) => {
  try {
    // Decode userId from token
    const userId = await decodeUserIdFromHeader(req);
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    // Fetch user's scores
    const scores = await Score.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100);

    // Aggregate in memory (fast for small datasets)
    const totalGames = scores.length;
    const gamesPlayed = {};
    const bestScores = {};
    const recentScores = scores.slice(0, 10).map((s) => ({
      game: s.game,
      score: s.score,
      createdAt: s.createdAt,
    }));
    // Aggregate stats
    scores.forEach((s) => {
      gamesPlayed[s.game] = (gamesPlayed[s.game] || 0) + 1;
      if (!bestScores[s.game] || s.score > bestScores[s.game]) {
        bestScores[s.game] = s.score;
      }
    });
    // Respond
    res.json({
      totalGames,
      gamesPlayed,
      bestScores,
      recentScores,
    });
  } catch (err) {
    console.error("progress me err", err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;

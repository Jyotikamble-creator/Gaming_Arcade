// Routes for brain teaser game features

import express from "express";

// Create router
const router = express.Router();

// Get puzzle difficulty ratings
// Returns predefined difficulty ratings for puzzles
router.get("/difficulty-ratings", (req, res) => {
  try {
    // Define difficulty ratings
    const ratings = {
      "match-shape": { difficulty: "easy", basePoints: 10 },
      "find-odd": { difficulty: "medium", basePoints: 15 },
      pattern: { difficulty: "hard", basePoints: 20 },
    };

    // Respond with ratings
    res.json({
      success: true,
      ratings,
    });
  } catch (error) {
    console.error("Error getting difficulty ratings:", error);
    res.status(500).json({ error: "Failed to get difficulty ratings" });
  }
});

// Calculate performance metrics
// Returns performance metrics based on score, puzzles solved, and time used
router.post("/calculate-performance", (req, res) => {
  try {
    // Extract data from request body
    const { score, puzzlesSolved, bestStreak, timeUsed } = req.body;

    // Validate input
    if (!score || !puzzlesSolved || !timeUsed) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Calculate metrics
    const avgPointsPerPuzzle = Math.round(score / puzzlesSolved);
    const puzzlesPerSecond = (puzzlesSolved / timeUsed).toFixed(2);

    // Determine performance level
    // Levels: beginner, intermediate, advanced, expert, genius
    let performanceLevel = "beginner";
    if (puzzlesSolved >= 20) performanceLevel = "genius";
    else if (puzzlesSolved >= 15) performanceLevel = "expert";
    else if (puzzlesSolved >= 10) performanceLevel = "advanced";
    else if (puzzlesSolved >= 5) performanceLevel = "intermediate";

    // Respond with calculated metrics
    res.json({
      success: true,
      metrics: {
        avgPointsPerPuzzle,
        puzzlesPerSecond,
        performanceLevel,
        streakBonus: bestStreak >= 5 ? (bestStreak - 4) * 10 : 0,
      },
    });
  } catch (error) {
    console.error("Error calculating performance:", error);
    res.status(500).json({ error: "Failed to calculate performance" });
  }
});

export default router;

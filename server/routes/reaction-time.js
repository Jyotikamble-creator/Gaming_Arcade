// Routes for Reaction Time game
import express from "express";

// Create router
const router = express.Router();

// Get reaction time benchmarks
router.get("/benchmarks", (req, res) => {
  try {
    // Define reaction time benchmarks
    const benchmarks = {
      elite: { max: 200, label: "Elite", color: "yellow" },
      excellent: { max: 250, label: "Excellent", color: "green" },
      good: { max: 300, label: "Good", color: "blue" },
      average: { max: 350, label: "Average", color: "purple" },
      belowAverage: { max: 400, label: "Below Average", color: "orange" },
      slow: { max: Infinity, label: "Needs Practice", color: "red" },
    };

    // Respond with benchmarks
    res.json({
      success: true,
      benchmarks,
    });
  } catch (error) {
    console.error("Error getting benchmarks:", error);
    res.status(500).json({ error: "Failed to get benchmarks" });
  }
});

// Calculate performance score
router.post("/calculate-score", (req, res) => {
  try {
    // Extract data from request body
    const { averageTime, bestTime, allTimes } = req.body;

    // Validate input
    if (!averageTime || !bestTime || !allTimes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Score calculation (lower time = higher score)
    // Perfect score of 500 for avg 200ms, decreasing as avg increases
    let score = Math.max(0, Math.round(500 - (averageTime - 200) * 0.5));

    // Bonus for consistent performance
    const variance = Math.max(...allTimes) - Math.min(...allTimes);
    const consistencyBonus = Math.max(
      0,
      Math.round((1 - variance / averageTime) * 50)
    );
    score += consistencyBonus;

    // Bonus for exceptional best time
    if (bestTime < 200) score += 50;
    else if (bestTime < 250) score += 25;

    // Respond with calculated score and breakdown
    // Includes base score, consistency bonus, and best time bonus
    res.json({
      success: true,
      score,
      breakdown: {
        baseScore: Math.max(0, Math.round(500 - (averageTime - 200) * 0.5)),
        consistencyBonus,
        bestTimeBonus: bestTime < 200 ? 50 : bestTime < 250 ? 25 : 0,
      },
    });
  } catch (error) {
    console.error("Error calculating score:", error);
    res.status(500).json({ error: "Failed to calculate score" });
  }
});

export default router;

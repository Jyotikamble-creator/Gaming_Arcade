// server/routes/number-maze.js
// Routes for Number Maze game
import express from "express";
// Create router
const router = express.Router();

// Get difficulty benchmarks
// returns an object with minMoves, maxMoves, and maxTime for each difficulty
router.get("/benchmarks", (req, res) => {
  // Define benchmarks
  res.json({
    beginner: { minMoves: 15, maxMoves: 25, maxTime: 300 },
    intermediate: { minMoves: 10, maxMoves: 14, maxTime: 240 },
    advanced: { minMoves: 8, maxMoves: 9, maxTime: 180 },
    expert: { minMoves: 6, maxMoves: 7, maxTime: 120 },
    master: { minMoves: 4, maxMoves: 5, maxTime: 90 },
  });
});

// Calculate score based on performance
// Returns the calculated score
router.post("/calculate-score", (req, res) => {
  // Extract data from request body
  const { moves, timeElapsed, targetNumber } = req.body;

  // Validate input
  if (!moves || typeof moves !== "number" || moves < 0) {
    return res
      .status(400)
      .json({ error: "Moves is required and must be a non-negative number" });
  }
  // Validate timeElapsed
  if (!timeElapsed || typeof timeElapsed !== "number" || timeElapsed < 0) {
    return res
      .status(400)
      .json({
        error: "Time elapsed is required and must be a non-negative number",
      });
  }

  // Base score calculation
  let score = 1000;

  // Move efficiency bonus (fewer moves = higher score)
  const moveBonus = Math.max(0, 200 - moves * 15);
  score += moveBonus;

  // Time bonus (faster completion = higher score)
  const timeBonus = Math.max(0, 300 - timeElapsed);
  score += timeBonus;

  // Target difficulty bonus (reasonable targets get bonus)
  const targetBonus = Math.abs(targetNumber || 0) <= 25 ? 100 : 0;
  score += targetBonus;

  // Perfect solve bonus (under 8 moves)
  if (moves <= 8) score += 150;

  // Speed demon bonus (under 2 minutes)
  if (timeElapsed <= 120) score += 50;

  // Ensure minimum score
  score = Math.max(50, score);

  // Respond with score and rating
  res.json({
    score,
    rating: getRating(moves, timeElapsed),
    message: getMessage(moves, timeElapsed),
    stats: {
      moveEfficiency: Math.round((200 / Math.max(moves, 1)) * 100),
      timeEfficiency: Math.round((300 / Math.max(timeElapsed, 1)) * 100),
    },
  });
});

// Helper to get rating based on performance
function getRating(moves, timeElapsed) {
  // Calculate total efficiency
  const totalEfficiency =
    (200 / Math.max(moves, 1)) * 100 + (300 / Math.max(timeElapsed, 1)) * 100;
  // Determine rating based on total efficiency
  if (totalEfficiency >= 400) return "Math Master";
  if (totalEfficiency >= 350) return "Expert Navigator";
  if (totalEfficiency >= 300) return "Skilled Solver";
  if (totalEfficiency >= 250) return "Apprentice";
  return "Beginner";
}

// Helper to get message based on performance
function getMessage(moves, timeElapsed) {
  // Determine message based on performance
  if (moves <= 8 && timeElapsed <= 120) {
    return "Outstanding! You navigated the maze with perfect efficiency!";
  }
  if (moves <= 10) {
    return "Excellent! You found a very efficient path!";
  }
  if (timeElapsed <= 180) {
    return "Great speed! You solved it quickly!";
  }
  if (moves <= 15) {
    return "Well done! Good pathfinding skills!";
  }
  return "Nice work! Keep practicing to improve your strategy!";
}

export default router;

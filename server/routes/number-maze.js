import express from 'express';
const router = express.Router();

// Get difficulty benchmarks
router.get('/benchmarks', (req, res) => {
  res.json({
    beginner: { minMoves: 15, maxMoves: 25, maxTime: 300 },
    intermediate: { minMoves: 10, maxMoves: 14, maxTime: 240 },
    advanced: { minMoves: 8, maxMoves: 9, maxTime: 180 },
    expert: { minMoves: 6, maxMoves: 7, maxTime: 120 },
    master: { minMoves: 4, maxMoves: 5, maxTime: 90 }
  });
});

// Calculate score based on performance
router.post('/calculate-score', (req, res) => {
  const { moves, timeElapsed, targetNumber } = req.body;

  if (!moves || typeof moves !== 'number' || moves < 0) {
    return res.status(400).json({ error: 'Moves is required and must be a non-negative number' });
  }

  if (!timeElapsed || typeof timeElapsed !== 'number' || timeElapsed < 0) {
    return res.status(400).json({ error: 'Time elapsed is required and must be a non-negative number' });
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

  res.json({
    score,
    rating: getRating(moves, timeElapsed),
    message: getMessage(moves, timeElapsed),
    stats: {
      moveEfficiency: Math.round((200 / Math.max(moves, 1)) * 100),
      timeEfficiency: Math.round((300 / Math.max(timeElapsed, 1)) * 100)
    }
  });
});

function getRating(moves, timeElapsed) {
  const totalEfficiency = (200 / Math.max(moves, 1) * 100) + (300 / Math.max(timeElapsed, 1) * 100);

  if (totalEfficiency >= 400) return 'Math Master';
  if (totalEfficiency >= 350) return 'Expert Navigator';
  if (totalEfficiency >= 300) return 'Skilled Solver';
  if (totalEfficiency >= 250) return 'Apprentice';
  return 'Beginner';
}

function getMessage(moves, timeElapsed) {
  if (moves <= 8 && timeElapsed <= 120) {
    return 'Outstanding! You navigated the maze with perfect efficiency!';
  }
  if (moves <= 10) {
    return 'Excellent! You found a very efficient path!';
  }
  if (timeElapsed <= 180) {
    return 'Great speed! You solved it quickly!';
  }
  if (moves <= 15) {
    return 'Well done! Good pathfinding skills!';
  }
  return 'Nice work! Keep practicing to improve your strategy!';
}

export default router;
const express = require('express');
const router = express.Router();

// Get difficulty benchmarks
router.get('/benchmarks', (req, res) => {
  res.json({
    beginner: { minMoves: 150, maxMoves: 300, maxTime: 600 },
    intermediate: { minMoves: 100, maxMoves: 149, maxTime: 450 },
    advanced: { minMoves: 80, maxMoves: 99, maxTime: 300 },
    expert: { minMoves: 60, maxMoves: 79, maxTime: 240 },
    master: { minMoves: 40, maxMoves: 59, maxTime: 180 }
  });
});

// Calculate score based on performance
router.post('/calculate-score', (req, res) => {
  const { moves, timeElapsed } = req.body;

  if (!moves || typeof moves !== 'number' || moves < 0) {
    return res.status(400).json({ error: 'Moves is required and must be a non-negative number' });
  }

  if (!timeElapsed || typeof timeElapsed !== 'number' || timeElapsed < 0) {
    return res.status(400).json({ error: 'Time elapsed is required and must be a non-negative number' });
  }

  // Base score calculation
  let score = 1000;

  // Move efficiency bonus (fewer moves = higher score)
  const moveBonus = Math.max(0, 200 - moves * 2);
  score += moveBonus;

  // Time bonus (faster completion = higher score)
  const timeBonus = Math.max(0, 300 - timeElapsed);
  score += timeBonus;

  // Perfect solve bonus
  if (moves <= 80) score += 100;

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

  if (totalEfficiency >= 400) return 'Puzzle Master';
  if (totalEfficiency >= 350) return 'Expert';
  if (totalEfficiency >= 300) return 'Advanced';
  if (totalEfficiency >= 250) return 'Intermediate';
  return 'Beginner';
}

function getMessage(moves, timeElapsed) {
  if (moves <= 80 && timeElapsed <= 180) {
    return 'Outstanding! You solved it efficiently and quickly!';
  }
  if (moves <= 100) {
    return 'Great job! You found an efficient solution!';
  }
  if (timeElapsed <= 240) {
    return 'Well done! You solved it quickly!';
  }
  if (moves <= 150) {
    return 'Good work! You completed the puzzle!';
  }
  return 'Nice try! Keep practicing to improve your efficiency!';
}

module.exports = router;

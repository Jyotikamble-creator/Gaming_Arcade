const express = require('express');
const router = express.Router();

// Get difficulty benchmarks
router.get('/benchmarks', (req, res) => {
  res.json({
    beginner: { minLevel: 1, maxLevel: 5 },
    intermediate: { minLevel: 6, maxLevel: 10 },
    advanced: { minLevel: 11, maxLevel: 15 },
    expert: { minLevel: 16, maxLevel: 19 },
    master: { minLevel: 20, maxLevel: 20 }
  });
});

// Calculate score based on performance
router.post('/calculate-score', (req, res) => {
  const { level, perfectDrops } = req.body;

  if (!level) {
    return res.status(400).json({ error: 'Level is required' });
  }

  // Base score calculation
  let score = level * 10;

  // Perfect drops bonus
  score += perfectDrops * 20;

  // Completion bonus
  if (level >= 20) {
    score += 200; // Win bonus
  }

  // Level milestone bonuses
  if (level >= 5) score += 50;
  if (level >= 10) score += 100;
  if (level >= 15) score += 150;

  res.json({ 
    score,
    rating: getRating(level),
    message: getMessage(level, perfectDrops)
  });
});

function getRating(level) {
  if (level >= 20) return 'Tower Master';
  if (level >= 15) return 'Excellent';
  if (level >= 10) return 'Great';
  if (level >= 5) return 'Good';
  return 'Beginner';
}

function getMessage(level, perfectDrops) {
  if (level >= 20) {
    return 'Perfect! You built a complete tower!';
  }
  if (perfectDrops >= 10) {
    return 'Amazing accuracy! Keep it up!';
  }
  if (level >= 15) {
    return 'So close to perfection!';
  }
  if (level >= 10) {
    return 'Great balance and timing!';
  }
  return 'Keep practicing your timing!';
}

module.exports = router;

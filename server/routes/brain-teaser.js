import express from 'express';

const router = express.Router();

// Get puzzle difficulty ratings
router.get('/difficulty-ratings', (req, res) => {
  try {
    const ratings = {
      'match-shape': { difficulty: 'easy', basePoints: 10 },
      'find-odd': { difficulty: 'medium', basePoints: 15 },
      'pattern': { difficulty: 'hard', basePoints: 20 }
    };
    
    res.json({
      success: true,
      ratings
    });
  } catch (error) {
    console.error('Error getting difficulty ratings:', error);
    res.status(500).json({ error: 'Failed to get difficulty ratings' });
  }
});

// Calculate performance metrics
router.post('/calculate-performance', (req, res) => {
  try {
    const { score, puzzlesSolved, bestStreak, timeUsed } = req.body;
    
    if (!score || !puzzlesSolved || !timeUsed) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const avgPointsPerPuzzle = Math.round(score / puzzlesSolved);
    const puzzlesPerSecond = (puzzlesSolved / timeUsed).toFixed(2);
    
    let performanceLevel = 'beginner';
    if (puzzlesSolved >= 20) performanceLevel = 'genius';
    else if (puzzlesSolved >= 15) performanceLevel = 'expert';
    else if (puzzlesSolved >= 10) performanceLevel = 'advanced';
    else if (puzzlesSolved >= 5) performanceLevel = 'intermediate';
    
    res.json({
      success: true,
      metrics: {
        avgPointsPerPuzzle,
        puzzlesPerSecond,
        performanceLevel,
        streakBonus: bestStreak >= 5 ? (bestStreak - 4) * 10 : 0
      }
    });
  } catch (error) {
    console.error('Error calculating performance:', error);
    res.status(500).json({ error: 'Failed to calculate performance' });
  }
});

export default router;

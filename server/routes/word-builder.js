import express from 'express';

const router = express.Router();

// Word challenges database
const wordChallenges = [
  {
    id: 1,
    difficulty: 'easy',
    letters: ['C', 'A', 'T', 'S', 'R', 'E'],
    targetWords: ['CAT', 'CATS', 'CAST', 'CARE', 'CASE', 'RACE', 'SCARE', 'CRATE', 'STARE', 'CARES', 'REACT', 'CASTER', 'RECAST', 'TRACES', 'CRATES'],
    minWords: 5
  },
  {
    id: 2,
    difficulty: 'easy',
    letters: ['D', 'O', 'G', 'S', 'R', 'E'],
    targetWords: ['DOG', 'DOGS', 'DOSE', 'DOES', 'RODE', 'ROSE', 'GOES', 'SORE', 'REDO', 'DOERS', 'GOERS', 'GORED', 'RODES'],
    minWords: 5
  },
  {
    id: 3,
    difficulty: 'easy',
    letters: ['F', 'I', 'S', 'H', 'E', 'R'],
    targetWords: ['FISH', 'FIRE', 'HIRE', 'RESH', 'FRESH', 'FRIES', 'FISHER', 'SHERIF'],
    minWords: 5
  },
  {
    id: 4,
    difficulty: 'medium',
    letters: ['P', 'L', 'A', 'Y', 'E', 'R', 'S'],
    targetWords: ['PLAY', 'PLAYS', 'LAYER', 'RELAY', 'EARLY', 'YEARS', 'SPRAY', 'REPAY', 'LEAPS', 'SLAYER', 'PLAYER', 'PARLEY', 'REPLAY', 'PLAYERS', 'PARSLEY'],
    minWords: 7
  },
  {
    id: 5,
    difficulty: 'medium',
    letters: ['T', 'R', 'A', 'I', 'N', 'E', 'D'],
    targetWords: ['TRAIN', 'TRADE', 'TREND', 'DRAIN', 'DINER', 'TREAD', 'RATED', 'RETINA', 'DETAIN', 'RAINED', 'TRAINED'],
    minWords: 7
  },
  {
    id: 6,
    difficulty: 'medium',
    letters: ['G', 'A', 'R', 'D', 'E', 'N', 'S'],
    targetWords: ['GARDEN', 'GRADE', 'GRAND', 'RANGE', 'SNARE', 'DANGER', 'GANDERS', 'GARDENS'],
    minWords: 7
  },
  {
    id: 7,
    difficulty: 'hard',
    letters: ['C', 'R', 'E', 'A', 'T', 'I', 'V', 'E'],
    targetWords: ['CREATE', 'ACTIVE', 'NATIVE', 'REACTIVE', 'CREATIVE'],
    minWords: 3
  },
  {
    id: 8,
    difficulty: 'hard',
    letters: ['S', 'T', 'U', 'D', 'E', 'N', 'T', 'S'],
    targetWords: ['STUDENT', 'STUDENTS', 'STUNTED', 'DENTIST', 'NESTED'],
    minWords: 3
  },
  {
    id: 9,
    difficulty: 'hard',
    letters: ['M', 'O', 'U', 'N', 'T', 'A', 'I', 'N'],
    targetWords: ['MOUNTAIN', 'AMOUNT', 'NATION', 'MANIA', 'MAINTAIN'],
    minWords: 3
  }
];

// GET /api/games/word-builder/challenge - Get a random word challenge
router.get('/challenge', (req, res) => {
  try {
    const difficulty = req.query.difficulty || 'medium';
    
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty. Use: easy, medium, or hard' });
    }
    
    const challenges = wordChallenges.filter(c => c.difficulty === difficulty);
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    res.json({
      id: challenge.id,
      difficulty: challenge.difficulty,
      letters: challenge.letters,
      targetWords: challenge.targetWords,
      minWords: challenge.minWords,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting word challenge:', error);
    res.status(500).json({ error: 'Failed to get challenge' });
  }
});

// GET /api/games/word-builder/challenges - Get all challenges
router.get('/challenges', (req, res) => {
  try {
    const difficulty = req.query.difficulty;
    
    let challenges = wordChallenges;
    
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      challenges = wordChallenges.filter(c => c.difficulty === difficulty);
    }
    
    res.json({
      challenges,
      total: challenges.length
    });
  } catch (error) {
    console.error('Error getting challenges:', error);
    res.status(500).json({ error: 'Failed to get challenges' });
  }
});

// POST /api/games/word-builder/validate - Validate a word
router.post('/validate', (req, res) => {
  try {
    const { word, challengeId, availableLetters } = req.body;
    
    if (!word || !challengeId || !availableLetters) {
      return res.status(400).json({ error: 'Word, challengeId, and availableLetters are required' });
    }
    
    const challenge = wordChallenges.find(c => c.id === challengeId);
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    // Check if word uses only available letters
    const wordLetters = word.toUpperCase().split('');
    const available = [...availableLetters];
    
    let validLetters = true;
    for (let letter of wordLetters) {
      const index = available.indexOf(letter);
      if (index === -1) {
        validLetters = false;
        break;
      }
      available.splice(index, 1);
    }
    
    // Check if word is in target words
    const isValidWord = challenge.targetWords.includes(word.toUpperCase());
    
    // Calculate score
    const baseScore = word.length * 10;
    const bonusMultiplier = word.length >= 6 ? 2 : 1;
    const score = baseScore * bonusMultiplier;
    
    res.json({
      valid: validLetters && isValidWord,
      validLetters,
      isValidWord,
      score: validLetters && isValidWord ? score : 0,
      wordLength: word.length
    });
  } catch (error) {
    console.error('Error validating word:', error);
    res.status(500).json({ error: 'Failed to validate word' });
  }
});

export default router;

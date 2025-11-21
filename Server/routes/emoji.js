import express from 'express';

const router = express.Router();

const puzzles = [
  // Nature & Environment
  { id: 1, emojis: '👑🐉', answer: 'dragon king', category: 'Fantasy', difficulty: 'Medium' },
  { id: 2, emojis: '🚀🌕', answer: 'moon rocket', category: 'Space', difficulty: 'Easy' },
  { id: 3, emojis: '🌞🏖️🌊', answer: 'beach day', category: 'Nature', difficulty: 'Easy' },
  { id: 4, emojis: '🌧️🌈🌟', answer: 'rainbow after rain', category: 'Weather', difficulty: 'Medium' },
  { id: 5, emojis: '🌲🏔️❄️', answer: 'mountain winter', category: 'Nature', difficulty: 'Easy' },

  // Food & Cooking
  { id: 6, emojis: '🍕🔥❤️', answer: 'hot pizza love', category: 'Food', difficulty: 'Medium' },
  { id: 7, emojis: '☕📖🛋️', answer: 'cozy reading time', category: 'Lifestyle', difficulty: 'Medium' },
  { id: 8, emojis: '🍎🍌🍊', answer: 'fruit basket', category: 'Food', difficulty: 'Easy' },
  { id: 9, emojis: '🥤🧊🍋', answer: 'lemonade ice', category: 'Beverage', difficulty: 'Easy' },
  { id: 10, emojis: '🍔🍟🥤', answer: 'fast food meal', category: 'Food', difficulty: 'Easy' },

  // Technology & Work
  { id: 11, emojis: '💻☕📱', answer: 'work from home', category: 'Work', difficulty: 'Medium' },
  { id: 12, emojis: '⌚⏰⌛', answer: 'time management', category: 'Productivity', difficulty: 'Medium' },
  { id: 13, emojis: '🎵🎧📱', answer: 'music streaming', category: 'Entertainment', difficulty: 'Easy' },
  { id: 14, emojis: '📧💼🕒', answer: 'business email', category: 'Work', difficulty: 'Easy' },
  { id: 15, emojis: '🔋📱💡', answer: 'phone charging', category: 'Technology', difficulty: 'Easy' },

  // Emotions & Feelings
  { id: 16, emojis: '😊🌞🌈', answer: 'happy sunshine', category: 'Emotions', difficulty: 'Easy' },
  { id: 17, emojis: '😴🛏️🌙', answer: 'sleepy bedtime', category: 'Lifestyle', difficulty: 'Easy' },
  { id: 18, emojis: '🎂🎉🎈', answer: 'birthday party', category: 'Celebration', difficulty: 'Easy' },
  { id: 19, emojis: '💔😢🌧️', answer: 'broken heart rain', category: 'Emotions', difficulty: 'Medium' },
  { id: 20, emojis: '😎🌴🏄', answer: 'cool surfer', category: 'Lifestyle', difficulty: 'Easy' },

  // Sports & Activities
  { id: 21, emojis: '⚽🏆🎉', answer: 'soccer championship', category: 'Sports', difficulty: 'Medium' },
  { id: 22, emojis: '🏃‍♂️💨🌟', answer: 'fast runner', category: 'Sports', difficulty: 'Easy' },
  { id: 23, emojis: '🎸🎵🎤', answer: 'rock concert', category: 'Music', difficulty: 'Easy' },
  { id: 24, emojis: '🎨🖌️🖼️', answer: 'art painting', category: 'Art', difficulty: 'Easy' },
  { id: 25, emojis: '📚✏️🎓', answer: 'student studying', category: 'Education', difficulty: 'Easy' },

  // Travel & Adventure
  { id: 26, emojis: '✈️🌍🗺️', answer: 'world travel', category: 'Travel', difficulty: 'Easy' },
  { id: 27, emojis: '🏖️🌴🍹', answer: 'tropical vacation', category: 'Travel', difficulty: 'Medium' },
  { id: 28, emojis: '⛰️🥾🧭', answer: 'mountain hiking', category: 'Adventure', difficulty: 'Easy' },
  { id: 29, emojis: '🚗🛣️🌅', answer: 'road trip sunset', category: 'Travel', difficulty: 'Medium' },
  { id: 30, emojis: '🏰👑🛡️', answer: 'castle kingdom', category: 'Fantasy', difficulty: 'Easy' },

  // Animals & Pets
  { id: 31, emojis: '🐱🐶❤️', answer: 'pet love', category: 'Animals', difficulty: 'Easy' },
  { id: 32, emojis: '🦁🌳👑', answer: 'lion king', category: 'Animals', difficulty: 'Easy' },
  { id: 33, emojis: '🐠🌊🏊', answer: 'swimming fish', category: 'Animals', difficulty: 'Easy' },
  { id: 34, emojis: '🦋🌸🌼', answer: 'butterfly garden', category: 'Nature', difficulty: 'Easy' },
  { id: 35, emojis: '🐘🌍🦒', answer: 'safari animals', category: 'Animals', difficulty: 'Medium' },

  // More Challenging Puzzles
  { id: 36, emojis: '🔥🐉⚔️', answer: 'dragon fire sword', category: 'Fantasy', difficulty: 'Hard' },
  { id: 37, emojis: '🌟🎭🎪', answer: 'circus performance', category: 'Entertainment', difficulty: 'Medium' },
  { id: 38, emojis: '🎨🌈🖌️', answer: 'colorful painting', category: 'Art', difficulty: 'Easy' },
  { id: 39, emojis: '☕📖🕯️', answer: 'cozy reading night', category: 'Lifestyle', difficulty: 'Medium' },
  { id: 40, emojis: '🎵🎹🎤', answer: 'piano singing', category: 'Music', difficulty: 'Easy' }
];

router.get('/start', (req, res) => {
  const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  console.log('[EMOJI] Serving puzzle:', { id: randomPuzzle.id, answer: randomPuzzle.answer });
  res.json(randomPuzzle);
});

// Get all puzzles (for admin/debugging)
router.get('/all', (req, res) => {
  res.json(puzzles);
});

// Get puzzle by difficulty
router.get('/difficulty/:level', (req, res) => {
  const { level } = req.params;
  const filteredPuzzles = puzzles.filter(p => p.difficulty.toLowerCase() === level.toLowerCase());
  if (filteredPuzzles.length === 0) {
    return res.status(404).json({ error: 'No puzzles found for this difficulty' });
  }
  const randomPuzzle = filteredPuzzles[Math.floor(Math.random() * filteredPuzzles.length)];
  console.log('[EMOJI] Serving', level, 'puzzle:', { id: randomPuzzle.id, answer: randomPuzzle.answer });
  res.json(randomPuzzle);
});

export default router;

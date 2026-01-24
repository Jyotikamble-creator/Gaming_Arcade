/**
 * Utility functions and puzzle bank for Emoji Guess Game
 */

import type { EmojiPuzzle, DifficultyLevel, PuzzleCategory, PuzzleFilterOptions } from '@/types/games/emoji';

/**
 * Complete puzzle bank with 40 emoji puzzles
 */
export const EMOJI_PUZZLES: EmojiPuzzle[] = [
  // Nature & Environment
  {
    id: 1,
    emojis: "👑🐉",
    answer: "dragon king",
    category: "Fantasy",
    difficulty: "Medium",
  },
  {
    id: 2,
    emojis: "🚀🌕",
    answer: "moon rocket",
    category: "Space",
    difficulty: "Easy",
  },
  {
    id: 3,
    emojis: "🌞🏖️🌊",
    answer: "beach day",
    category: "Nature",
    difficulty: "Easy",
  },
  {
    id: 4,
    emojis: "🌧️🌈🌟",
    answer: "rainbow after rain",
    category: "Weather",
    difficulty: "Medium",
  },
  {
    id: 5,
    emojis: "🌲🏔️❄️",
    answer: "mountain winter",
    category: "Nature",
    difficulty: "Easy",
  },

  // Food & Cooking
  {
    id: 6,
    emojis: "🍕🔥❤️",
    answer: "hot pizza love",
    category: "Food",
    difficulty: "Medium",
  },
  {
    id: 7,
    emojis: "☕📖🛋️",
    answer: "cozy reading time",
    category: "Lifestyle",
    difficulty: "Medium",
  },
  {
    id: 8,
    emojis: "🍎🍌🍊",
    answer: "fruit basket",
    category: "Food",
    difficulty: "Easy",
  },
  {
    id: 9,
    emojis: "🥤🧊🍋",
    answer: "lemonade ice",
    category: "Beverage",
    difficulty: "Easy",
  },
  {
    id: 10,
    emojis: "🍔🍟🥤",
    answer: "fast food meal",
    category: "Food",
    difficulty: "Easy",
  },

  // Technology & Work
  {
    id: 11,
    emojis: "💻☕📱",
    answer: "work from home",
    category: "Work",
    difficulty: "Medium",
  },
  {
    id: 12,
    emojis: "⌚⏰⌛",
    answer: "time management",
    category: "Productivity",
    difficulty: "Medium",
  },
  {
    id: 13,
    emojis: "🎵🎧📱",
    answer: "music streaming",
    category: "Entertainment",
    difficulty: "Easy",
  },
  {
    id: 14,
    emojis: "📧💼🕒",
    answer: "business email",
    category: "Work",
    difficulty: "Easy",
  },
  {
    id: 15,
    emojis: "🔋📱💡",
    answer: "phone charging",
    category: "Technology",
    difficulty: "Easy",
  },

  // Emotions & Feelings
  {
    id: 16,
    emojis: "😊🌞🌈",
    answer: "happy sunshine",
    category: "Emotions",
    difficulty: "Easy",
  },
  {
    id: 17,
    emojis: "😴🛏️🌙",
    answer: "sleepy bedtime",
    category: "Lifestyle",
    difficulty: "Easy",
  },
  {
    id: 18,
    emojis: "🎂🎉🎈",
    answer: "birthday party",
    category: "Celebration",
    difficulty: "Easy",
  },
  {
    id: 19,
    emojis: "💔😢🌧️",
    answer: "broken heart rain",
    category: "Emotions",
    difficulty: "Medium",
  },
  {
    id: 20,
    emojis: "😎🌴🏄",
    answer: "cool surfer",
    category: "Lifestyle",
    difficulty: "Easy",
  },

  // Sports & Activities
  {
    id: 21,
    emojis: "⚽🏆🎉",
    answer: "soccer championship",
    category: "Sports",
    difficulty: "Medium",
  },
  {
    id: 22,
    emojis: "🏃‍♂️💨🌟",
    answer: "fast runner",
    category: "Sports",
    difficulty: "Easy",
  },
  {
    id: 23,
    emojis: "🎸🎵🎤",
    answer: "rock concert",
    category: "Music",
    difficulty: "Easy",
  },
  {
    id: 24,
    emojis: "🎨🖌️🖼️",
    answer: "art painting",
    category: "Art",
    difficulty: "Easy",
  },
  {
    id: 25,
    emojis: "📚✏️🎓",
    answer: "student studying",
    category: "Education",
    difficulty: "Easy",
  },

  // Travel & Adventure
  {
    id: 26,
    emojis: "✈️🌍🗺️",
    answer: "world travel",
    category: "Travel",
    difficulty: "Easy",
  },
  {
    id: 27,
    emojis: "🏖️🌴🍹",
    answer: "tropical vacation",
    category: "Travel",
    difficulty: "Medium",
  },
  {
    id: 28,
    emojis: "⛰️🥾🧭",
    answer: "mountain hiking",
    category: "Adventure",
    difficulty: "Easy",
  },
  {
    id: 29,
    emojis: "🚗🛣️🌅",
    answer: "road trip sunset",
    category: "Travel",
    difficulty: "Medium",
  },
  {
    id: 30,
    emojis: "🏰👑🛡️",
    answer: "castle kingdom",
    category: "Fantasy",
    difficulty: "Easy",
  },

  // Animals & Pets
  {
    id: 31,
    emojis: "🐱🐶❤️",
    answer: "pet love",
    category: "Animals",
    difficulty: "Easy",
  },
  {
    id: 32,
    emojis: "🦁🌳👑",
    answer: "lion king",
    category: "Animals",
    difficulty: "Easy",
  },
  {
    id: 33,
    emojis: "🐠🌊🏊",
    answer: "swimming fish",
    category: "Animals",
    difficulty: "Easy",
  },
  {
    id: 34,
    emojis: "🦋🌸🌼",
    answer: "butterfly garden",
    category: "Nature",
    difficulty: "Easy",
  },
  {
    id: 35,
    emojis: "🐘🌍🦒",
    answer: "safari animals",
    category: "Animals",
    difficulty: "Medium",
  },

  // More Challenging Puzzles
  {
    id: 36,
    emojis: "🔥🐉⚔️",
    answer: "dragon fire sword",
    category: "Fantasy",
    difficulty: "Hard",
  },
  {
    id: 37,
    emojis: "🌟🎭🎪",
    answer: "circus performance",
    category: "Entertainment",
    difficulty: "Medium",
  },
  {
    id: 38,
    emojis: "🎨🌈🖌️",
    answer: "colorful painting",
    category: "Art",
    difficulty: "Easy",
  },
  {
    id: 39,
    emojis: "☕📖🕯️",
    answer: "cozy reading night",
    category: "Lifestyle",
    difficulty: "Medium",
  },
  {
    id: 40,
    emojis: "🎵🎹🎤",
    answer: "piano singing",
    category: "Music",
    difficulty: "Easy",
  },
];

/**
 * Get a random puzzle from the puzzle bank
 */
export function getRandomPuzzle(options?: PuzzleFilterOptions): EmojiPuzzle {
  const filteredPuzzles = filterPuzzles(options);
  const randomIndex = Math.floor(Math.random() * filteredPuzzles.length);
  return filteredPuzzles[randomIndex];
}

/**
 * Filter puzzles based on options
 */
export function filterPuzzles(options?: PuzzleFilterOptions): EmojiPuzzle[] {
  if (!options) return EMOJI_PUZZLES;

  let filtered = [...EMOJI_PUZZLES];

  if (options.difficulty) {
    filtered = filtered.filter(p => p.difficulty === options.difficulty);
  }

  if (options.category) {
    filtered = filtered.filter(p => p.category === options.category);
  }

  if (options.excludeIds && options.excludeIds.length > 0) {
    filtered = filtered.filter(p => !options.excludeIds!.includes(p.id));
  }

  if (options.limit && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered.length > 0 ? filtered : EMOJI_PUZZLES;
}

/**
 * Get puzzle by ID
 */
export function getPuzzleById(id: number): EmojiPuzzle | undefined {
  return EMOJI_PUZZLES.find(p => p.id === id);
}

/**
 * Get all available categories
 */
export function getAllCategories(): PuzzleCategory[] {
  const categories = new Set<PuzzleCategory>();
  EMOJI_PUZZLES.forEach(p => categories.add(p.category));
  return Array.from(categories).sort();
}

/**
 * Get puzzles by category
 */
export function getPuzzlesByCategory(category: PuzzleCategory): EmojiPuzzle[] {
  return EMOJI_PUZZLES.filter(p => p.category === category);
}

/**
 * Get puzzles by difficulty
 */
export function getPuzzlesByDifficulty(difficulty: DifficultyLevel): EmojiPuzzle[] {
  return EMOJI_PUZZLES.filter(p => p.difficulty === difficulty);
}

/**
 * Strip answer from puzzle (for client-side safety)
 */
export function stripAnswer(puzzle: EmojiPuzzle): Omit<EmojiPuzzle, 'answer'> {
  const { answer, ...rest } = puzzle;
  return rest;
}

/**
 * Calculate hint based on answer
 */
export function generateHint(answer: string, revealPercentage: number = 0.3): string {
  const words = answer.split(' ');
  const numWordsToReveal = Math.max(1, Math.floor(words.length * revealPercentage));
  
  const revealedWords = words.map((word, index) => {
    if (index < numWordsToReveal) {
      return word;
    }
    return '_'.repeat(word.length);
  });

  return revealedWords.join(' ');
}

/**
 * Normalize answer for comparison
 */
export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'Easy':
      return 'text-green-600';
    case 'Medium':
      return 'text-yellow-600';
    case 'Hard':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get category emoji icon
 */
export function getCategoryIcon(category: PuzzleCategory): string {
  const icons: Record<PuzzleCategory, string> = {
    Fantasy: '🐉',
    Space: '🚀',
    Nature: '🌳',
    Weather: '🌤️',
    Food: '🍕',
    Beverage: '🥤',
    Lifestyle: '☕',
    Work: '💼',
    Productivity: '⏰',
    Entertainment: '🎬',
    Technology: '💻',
    Emotions: '😊',
    Celebration: '🎉',
    Sports: '⚽',
    Music: '🎵',
    Art: '🎨',
    Education: '📚',
    Travel: '✈️',
    Adventure: '🗺️',
    Animals: '🐾'
  };

  return icons[category] || '🎮';
}

/**
 * Calculate score based on attempts and time
 */
export function calculateScore(
  attempts: number,
  timeTaken: number,
  difficulty: DifficultyLevel,
  hintsUsed: number
): number {
  let baseScore = 100;

  // Penalty for multiple attempts
  baseScore -= (attempts - 1) * 10;

  // Penalty for time (slower = less score)
  const timeInSeconds = timeTaken / 1000;
  if (timeInSeconds > 60) {
    baseScore -= Math.floor((timeInSeconds - 60) / 10) * 5;
  }

  // Penalty for hints
  baseScore -= hintsUsed * 20;

  // Bonus for difficulty
  if (difficulty === 'Medium') baseScore += 20;
  if (difficulty === 'Hard') baseScore += 50;

  return Math.max(0, baseScore);
}

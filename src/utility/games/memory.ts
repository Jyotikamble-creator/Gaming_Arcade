/**
 * Utility functions and card generation for Memory Card Game
 */

import type {
  MemoryCard,
  CardTheme,
  MemoryDifficultyLevel,
  ThemeConfig,
  DifficultyConfig
} from '@/types/games/memory';

/**
 * Theme configurations with card values
 */
export const THEME_CONFIGS: Record<CardTheme, ThemeConfig> = {
  fruits: {
    theme: 'fruits',
    values: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍑', '🥝', '🍍', '🍉', '🍒', '🥭', '🍐'],
    displayName: 'Fruits',
    icon: '🍎'
  },
  animals: {
    theme: 'animals',
    values: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
    displayName: 'Animals',
    icon: '🐶'
  },
  emojis: {
    theme: 'emojis',
    values: ['😀', '😎', '🤩', '😍', '🥳', '😂', '🤔', '😴', '🤗', '😇', '🥰', '😋'],
    displayName: 'Emojis',
    icon: '😀'
  },
  numbers: {
    theme: 'numbers',
    values: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '0️⃣', '#️⃣'],
    displayName: 'Numbers',
    icon: '1️⃣'
  },
  letters: {
    theme: 'letters',
    values: ['🅰️', '🅱️', '🆎', '🅾️', '🆑', '🆒', '🆓', '🆕', '🆗', '🆙', '🆚', '🈁'],
    displayName: 'Letters',
    icon: '🅰️'
  }
};

/**
 * Difficulty configurations
 */
export const DIFFICULTY_CONFIGS: Record<MemoryDifficultyLevel, DifficultyConfig> = {
  Easy: {
    difficulty: 'Easy',
    pairs: 8,
    scoreMultiplier: 1
  },
  Medium: {
    difficulty: 'Medium',
    pairs: 12,
    scoreMultiplier: 1.5
  },
  Hard: {
    difficulty: 'Hard',
    pairs: 16,
    scoreMultiplier: 2
  },
  Expert: {
    difficulty: 'Expert',
    pairs: 20,
    scoreMultiplier: 2.5
  }
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate cards for a memory game
 */
export function generateCards(
  difficulty: MemoryDifficultyLevel,
  theme: CardTheme
): MemoryCard[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const themeConfig = THEME_CONFIGS[theme];
  const pairCount = config.pairs;

  // Select required number of values
  const selectedValues = shuffle(themeConfig.values).slice(0, pairCount);

  // Create pairs of cards
  const cards: MemoryCard[] = [];
  selectedValues.forEach((value, index) => {
    // First card of the pair
    cards.push({
      id: index * 2,
      value,
      matched: false,
      flipped: false,
      pairId: index
    });

    // Second card of the pair
    cards.push({
      id: index * 2 + 1,
      value,
      matched: false,
      flipped: false,
      pairId: index
    });
  });

  // Shuffle the cards
  return shuffle(cards);
}

/**
 * Strip card values from cards (for client-side safety)
 */
export function stripCardValues(cards: MemoryCard[]): Omit<MemoryCard, 'value' | 'pairId'>[] {
  return cards.map(({ id, matched, flipped }) => ({
    id,
    matched,
    flipped
  }));
}

/**
 * Get cards by IDs with values
 */
export function getCardsByIds(cards: MemoryCard[], cardIds: number[]): MemoryCard[] {
  return cardIds
    .map(id => cards.find(card => card.id === id))
    .filter(card => card !== undefined) as MemoryCard[];
}

/**
 * Check if two cards match
 */
export function checkMatch(card1: MemoryCard, card2: MemoryCard): boolean {
  return card1.value === card2.value || card1.pairId === card2.pairId;
}

/**
 * Calculate score based on moves, time, and difficulty
 */
export function calculateScore(
  moves: number,
  timeTaken: number,
  totalPairs: number,
  difficulty: MemoryDifficultyLevel
): number {
  // Base score from moves
  const perfectMoves = totalPairs;
  const movesPenalty = Math.max(0, moves - perfectMoves) * 5;
  let score = 1000 - movesPenalty;

  // Time bonus (faster = higher score)
  const timeInSeconds = timeTaken / 1000;
  const timeBonus = Math.max(0, 500 - timeInSeconds * 2);
  score += timeBonus;

  // Difficulty multiplier
  const config = DIFFICULTY_CONFIGS[difficulty];
  score *= config.scoreMultiplier;

  // Perfect game bonus
  if (moves === perfectMoves) {
    score += 500;
  }

  return Math.round(Math.max(0, score));
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(difficulty: MemoryDifficultyLevel): string {
  switch (difficulty) {
    case 'Easy':
      return 'text-green-600';
    case 'Medium':
      return 'text-yellow-600';
    case 'Hard':
      return 'text-orange-600';
    case 'Expert':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get theme icon
 */
export function getThemeIcon(theme: CardTheme): string {
  return THEME_CONFIGS[theme]?.icon || '🎮';
}

/**
 * Format time in milliseconds to readable string
 */
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${seconds}s`;
}

/**
 * Calculate efficiency percentage
 */
export function calculateEfficiency(moves: number, totalPairs: number): number {
  if (moves === 0) return 0;
  return Math.round((totalPairs / moves) * 100);
}

/**
 * Get performance rating based on efficiency
 */
export function getPerformanceRating(efficiency: number): string {
  if (efficiency >= 90) return 'Excellent';
  if (efficiency >= 75) return 'Great';
  if (efficiency >= 60) return 'Good';
  if (efficiency >= 45) return 'Fair';
  return 'Needs Practice';
}

/**
 * Get badge for achievements
 */
export function getBadge(moves: number, totalPairs: number, timeTaken: number): string | null {
  const perfectMoves = totalPairs;
  const timeInSeconds = timeTaken / 1000;

  if (moves === perfectMoves && timeInSeconds < 30) {
    return '🏆 Speed Master';
  }
  if (moves === perfectMoves) {
    return '⭐ Perfect Memory';
  }
  if (moves <= perfectMoves * 1.2) {
    return '🎯 Sharp Mind';
  }
  if (timeInSeconds < 60) {
    return '⚡ Lightning Fast';
  }
  return null;
}

/**
 * Validate flip request
 */
export function validateFlipRequest(
  cardIds: number[],
  cards: MemoryCard[]
): { valid: boolean; error?: string } {
  if (cardIds.length !== 2) {
    return { valid: false, error: 'Must flip exactly 2 cards' };
  }

  if (cardIds[0] === cardIds[1]) {
    return { valid: false, error: 'Cannot flip the same card twice' };
  }

  const card1 = cards.find(c => c.id === cardIds[0]);
  const card2 = cards.find(c => c.id === cardIds[1]);

  if (!card1 || !card2) {
    return { valid: false, error: 'Invalid card IDs' };
  }

  if (card1.matched || card2.matched) {
    return { valid: false, error: 'Cannot flip already matched cards' };
  }

  return { valid: true };
}

/**
 * Get all available themes
 */
export function getAllThemes(): ThemeConfig[] {
  return Object.values(THEME_CONFIGS);
}

/**
 * Get all difficulty levels
 */
export function getAllDifficulties(): DifficultyConfig[] {
  return Object.values(DIFFICULTY_CONFIGS);
}

/**
 * Get recommended difficulty based on past performance
 */
export function getRecommendedDifficulty(averageEfficiency: number): MemoryDifficultyLevel {
  if (averageEfficiency >= 90) return 'Expert';
  if (averageEfficiency >= 75) return 'Hard';
  if (averageEfficiency >= 60) return 'Medium';
  return 'Easy';
}

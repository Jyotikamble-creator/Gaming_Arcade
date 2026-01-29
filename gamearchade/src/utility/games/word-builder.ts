// Word Builder Game Utility Functions
import {
  WordBuilderDifficulty,
  WordBuilderGameMode,
  WordBuilderChallenge,
  WordBuilderLetter,
  WordBuilderCurrentWordLetter
} from '@/types/games/word-builder';

// Specific word challenges for the classic game
export const wordChallenges: WordBuilderChallenge[] = [
  {
    difficulty: 'easy',
    letters: ['C', 'A', 'T', 'S', 'R', 'E'],
    targetWords: ['CAT', 'CATS', 'CAST', 'CARE', 'CASE', 'RACE', 'SCARE', 'CRATE', 'STARE', 'CARES', 'REACT', 'CASTER', 'RECAST', 'TRACES', 'CRATES'],
    minWords: 5
  },
  {
    difficulty: 'easy',
    letters: ['D', 'O', 'G', 'S', 'R', 'E'],
    targetWords: ['DOG', 'DOGS', 'DOSE', 'DOES', 'RODE', 'ROSE', 'GOES', 'SORE', 'REDO', 'DOERS', 'GOERS', 'GORED', 'RODES'],
    minWords: 5
  },
  {
    difficulty: 'medium',
    letters: ['P', 'L', 'A', 'Y', 'E', 'R', 'S'],
    targetWords: ['PLAY', 'PLAYS', 'LAYER', 'RELAY', 'EARLY', 'YEARS', 'SPRAY', 'REPAY', 'LEAPY', 'SLAYER', 'PLAYER', 'PARLEY', 'REPLAY', 'PLAYERS', 'PARSLEY'],
    minWords: 7
  },
  {
    difficulty: 'medium',
    letters: ['T', 'R', 'A', 'I', 'N', 'E', 'D'],
    targetWords: ['TRAIN', 'TRADE', 'TREND', 'DRAIN', 'DINER', 'TREAD', 'RATED', 'RETINA', 'DETAIN', 'RAINED', 'TRAINED'],
    minWords: 7
  },
  {
    difficulty: 'hard',
    letters: ['C', 'R', 'E', 'A', 'T', 'I', 'V', 'E'],
    targetWords: ['CREATE', 'ACTIVE', 'NATIVE', 'REACTIVE', 'CREATIVE'],
    minWords: 3
  },
  {
    difficulty: 'hard',
    letters: ['S', 'T', 'U', 'D', 'E', 'N', 'T', 'S'],
    targetWords: ['STUDENT', 'STUDENTS', 'STUNTED', 'DENTIST', 'NESTLED'],
    minWords: 3
  }
];

/**
 * Get random challenge for specified difficulty
 */
export function getRandomChallenge(difficulty: WordBuilderDifficulty): WordBuilderChallenge {
  const challenges = wordChallenges.filter(c => c.difficulty === difficulty);
  return challenges[Math.floor(Math.random() * challenges.length)];
}

/**
 * Initialize available letters from challenge
 */
export function initializeLetters(challenge: WordBuilderChallenge): WordBuilderLetter[] {
  return challenge.letters.map((letter, idx) => ({
    letter,
    id: idx,
    used: false
  }));
}

/**
 * Calculate word score based on length and complexity
 */
export function calculateWordScore(word: string): number {
  const baseScore = word.length * 10;
  const bonusMultiplier = word.length >= 6 ? 2 : 1;
  return baseScore * bonusMultiplier;
}

/**
 * Generate unique session ID
 */
export function generateWordBuilderSessionId(): string {
  return `wb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffle letters for display
 */
export function shuffleLetters(letters: string[]): string[] {
  return shuffleArray([...letters]);
}

/**
 * Check if word can be formed from available letters
 */
export function canFormWord(word: string, availableLetters: string[]): boolean {
  const letterCount = new Map<string, number>();
  
  // Count available letters
  for (const letter of availableLetters) {
    letterCount.set(letter, (letterCount.get(letter) || 0) + 1);
  }
  
  // Check if word can be formed
  for (const letter of word.toUpperCase()) {
    const available = letterCount.get(letter) || 0;
    if (available <= 0) {
      return false;
    }
    letterCount.set(letter, available - 1);
  }
  
  return true;
}

/**
 * Get remaining letters after forming a word
 */
export function getRemainingLetters(
  word: string,
  availableLetters: string[]
): string[] {
  const remaining = [...availableLetters];
  const wordLetters = word.toUpperCase().split('');
  
  for (const letter of wordLetters) {
    const index = remaining.indexOf(letter);
    if (index !== -1) {
      remaining.splice(index, 1);
    }
  }
  
  return remaining;
}

/**
 * Calculate letter values based on Scrabble-like scoring
 */
export function calculateLetterValue(letter: string): number {
  return WORD_BUILDER_CONSTANTS.SCORING.LETTER_VALUES[letter.toUpperCase()] || 1;
}

/**
 * Calculate total letter value for a word
 */
export function calculateWordLetterValue(word: string): number {
  return word.toUpperCase().split('').reduce((total, letter) => {
    return total + calculateLetterValue(letter);
  }, 0);
}

/**
 * Format score for display
 */
export function formatWordBuilderScore(score: number): string {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}M`;
  } else if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}K`;
  }
  return score.toString();
}

/**
 * Format time for display
 */
export function formatGameTime(seconds: number): string {
  if (seconds < 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format reaction time for display
 */
export function formatReactionTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  }
  return `${(milliseconds / 1000).toFixed(1)}s`;
}

/**
 * Format accuracy percentage
 */
export function formatWordBuilderAccuracy(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(difficulty: WordBuilderDifficulty): string {
  const colors = {
    easy: '#4CAF50',      // Green
    medium: '#FF9800',    // Orange
    hard: '#F44336',      // Red
    expert: '#9C27B0',    // Purple
    master: '#FFD700'     // Gold
  };
  
  return colors[difficulty] || '#757575';
}

/**
 * Get difficulty display name
 */
export function getDifficultyDisplayName(difficulty: WordBuilderDifficulty): string {
  const names = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
    master: 'Master'
  };
  
  return names[difficulty] || difficulty;
}

/**
 * Get game mode display name
 */
export function getGameModeDisplayName(gameMode: WordBuilderGameMode): string {
  const names = {
    classic: 'Classic',
    timed: 'Timed Challenge',
    endless: 'Endless Mode',
    puzzle: 'Word Puzzle',
    challenge: 'Daily Challenge'
  };
  
  return names[gameMode] || gameMode;
}

/**
 * Get color for reaction time performance
 */
export function getReactionTimeColor(milliseconds: number): string {
  if (milliseconds <= 3000) return '#4CAF50';    // Green - Fast
  if (milliseconds <= 5000) return '#8BC34A';    // Light Green - Good
  if (milliseconds <= 8000) return '#FFEB3B';    // Yellow - Average
  if (milliseconds <= 12000) return '#FF9800';   // Orange - Slow
  return '#F44336';                              // Red - Very Slow
}

/**
 * Get color for accuracy performance
 */
export function getWordBuilderAccuracyColor(accuracy: number): string {
  if (accuracy >= 0.9) return '#4CAF50';         // Green
  if (accuracy >= 0.8) return '#8BC34A';         // Light Green
  if (accuracy >= 0.7) return '#FFEB3B';         // Yellow
  if (accuracy >= 0.6) return '#FF9800';         // Orange
  return '#F44336';                              // Red
}

/**
 * Convert letters array to letter tiles for UI
 */
export function createLetterTiles(letters: string[]): WordBuilderLetterTile[] {
  return letters.map((letter, index) => ({
    letter: letter.toUpperCase(),
    isSelected: false,
    isUsed: false,
    position: index,
    value: calculateLetterValue(letter),
    multiplier: 1
  }));
}

/**
 * Validate word length
 */
export function isValidWordLength(word: string): boolean {
  const length = word.length;
  return length >= WORD_BUILDER_CONSTANTS.MIN_WORD_LENGTH && 
         length <= WORD_BUILDER_CONSTANTS.MAX_WORD_LENGTH;
}

/**
 * Calculate difficulty-based time limits
 */
export function getDifficultyTimeLimit(difficulty: WordBuilderDifficulty): number {
  const timeLimits = {
    easy: 300,      // 5 minutes
    medium: 240,    // 4 minutes
    hard: 180,      // 3 minutes
    expert: 150,    // 2.5 minutes
    master: 120     // 2 minutes
  };
  
  return timeLimits[difficulty] || 240;
}

/**
 * Calculate game mode settings
 */
export function getGameModeSettings(gameMode: WordBuilderGameMode): {
  timeLimit: number;
  scoreMultiplier: number;
  description: string;
  features: string[];
} {
  const settings = {
    classic: {
      timeLimit: 0, // Unlimited
      scoreMultiplier: 1.0,
      description: 'Find words at your own pace',
      features: ['No time limit', 'Standard scoring']
    },
    timed: {
      timeLimit: 240, // 4 minutes
      scoreMultiplier: 1.2,
      description: 'Race against the clock',
      features: ['Time pressure', '20% score bonus', 'Quick thinking']
    },
    endless: {
      timeLimit: 0, // Unlimited
      scoreMultiplier: 0.8,
      description: 'Keep playing indefinitely',
      features: ['No time limit', 'Continuous play', 'Reduced scoring']
    },
    puzzle: {
      timeLimit: 600, // 10 minutes
      scoreMultiplier: 1.5,
      description: 'Solve the complete word puzzle',
      features: ['Extended time', 'All words required', '50% score bonus']
    },
    challenge: {
      timeLimit: 300, // 5 minutes
      scoreMultiplier: 2.0,
      description: 'Daily special challenge',
      features: ['Special rules', 'Double points', 'Limited attempts']
    }
  };
  
  return settings[gameMode];
}

/**
 * Generate hint text based on word properties
 */
export function generateWordHintText(
  word: string,
  hintType: 'first-letter' | 'word-length' | 'definition' | 'rhyme' | 'category'
): string {
  const upperWord = word.toUpperCase();
  
  switch (hintType) {
    case 'first-letter':
      return `Starts with: ${upperWord[0]}`;
      
    case 'word-length':
      return `${upperWord.length} letters`;
      
    case 'definition':
      return getSimpleDefinition(upperWord);
      
    case 'category':
      return `Category: ${getWordCategory(upperWord)}`;
      
    case 'rhyme':
      return `Rhymes with: ${getSimpleRhyme(upperWord)}`;
      
    default:
      return `Think of a ${upperWord.length}-letter word`;
  }
}

/**
 * Check if two words are anagrams
 */
export function areAnagrams(word1: string, word2: string): boolean {
  const normalize = (str: string) => str.toUpperCase().split('').sort().join('');
  return normalize(word1) === normalize(word2);
}

/**
 * Find all possible anagrams from letters
 */
export function findPossibleAnagrams(
  letters: string[],
  minLength: number = 3
): string[] {
  const anagrams: string[] = [];
  const letterCount = new Map<string, number>();
  
  // Count available letters
  for (const letter of letters) {
    letterCount.set(letter, (letterCount.get(letter) || 0) + 1);
  }
  
  // This is a simplified version - in practice, you'd use a dictionary
  // For now, return empty array as this would require a full word list
  return anagrams;
}

/**
 * Calculate word complexity score
 */
export function calculateWordComplexity(word: string): number {
  const length = word.length;
  const uniqueLetters = new Set(word.toUpperCase()).size;
  const letterValues = word.toUpperCase().split('').map(calculateLetterValue);
  const avgLetterValue = letterValues.reduce((sum, val) => sum + val, 0) / letterValues.length;
  
  // Combine length, uniqueness, and letter rarity
  return (length * 0.4) + (uniqueLetters * 0.3) + (avgLetterValue * 0.3);
}

/**
 * Get performance rating text
 */
export function getPerformanceRating(score: number): string {
  if (score >= 0.95) return 'Legendary';
  if (score >= 0.90) return 'Master';
  if (score >= 0.80) return 'Expert';
  if (score >= 0.70) return 'Advanced';
  if (score >= 0.60) return 'Intermediate';
  if (score >= 0.50) return 'Beginner';
  return 'Novice';
}

/**
 * Calculate streak bonus multiplier
 */
export function calculateStreakBonus(streak: number): number {
  if (streak >= 10) return 3.0;
  if (streak >= 7) return 2.5;
  if (streak >= 5) return 2.0;
  if (streak >= 3) return 1.5;
  return 1.0;
}

/**
 * Generate encouragement message based on performance
 */
export function generateEncouragementMessage(
  wordsFound: number,
  accuracy: number,
  streak: number
): string {
  const messages = [];
  
  if (accuracy >= 0.9) messages.push('Amazing accuracy!');
  if (streak >= 5) messages.push('Incredible streak!');
  if (wordsFound >= 10) messages.push('Word master!');
  
  if (messages.length === 0) {
    if (wordsFound > 0) messages.push('Keep going!');
    else messages.push('You can do it!');
  }
  
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Validate game settings
 */
export function validateWordBuilderSettings(settings: any): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  if (settings.customTimeLimit) {
    if (settings.customTimeLimit < 30) {
      errors.push('Time limit must be at least 30 seconds');
    }
    if (settings.customTimeLimit > 1800) {
      errors.push('Time limit cannot exceed 30 minutes');
    }
  }
  
  if (settings.customLetters) {
    if (settings.customLetters.length < 4) {
      errors.push('Must have at least 4 letters');
    }
    if (settings.customLetters.length > 15) {
      errors.push('Cannot have more than 15 letters');
    }
  }
  
  if (settings.customTargetWords) {
    if (settings.customTargetWords.length === 0) {
      errors.push('Must have at least one target word');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get next level requirements
 */
export function getNextLevelRequirements(currentLevel: number): {
  wordsRequired: number;
  accuracyRequired: number;
  scoreRequired: number;
} {
  return {
    wordsRequired: currentLevel * 5 + 10,
    accuracyRequired: Math.min(0.95, 0.6 + (currentLevel * 0.05)),
    scoreRequired: currentLevel * 500 + 1000
  };
}

/**
 * Calculate achievement progress
 */
export function getAchievementProgress(
  wordsFound: number,
  accuracy: number,
  streak: number,
  longestWord: string
): Record<string, number> {
  return {
    'words_10': Math.min(1, wordsFound / 10),
    'words_25': Math.min(1, wordsFound / 25),
    'accuracy_80': Math.min(1, accuracy / 0.8),
    'accuracy_90': Math.min(1, accuracy / 0.9),
    'streak_5': Math.min(1, streak / 5),
    'streak_10': Math.min(1, streak / 10),
    'long_word_7': Math.min(1, (longestWord.length || 0) / 7),
    'long_word_10': Math.min(1, (longestWord.length || 0) / 10)
  };
}

// Helper functions for word properties

function getSimpleDefinition(word: string): string {
  const definitions: Record<string, string> = {
    'CAT': 'Feline pet',
    'DOG': 'Loyal pet',
    'FISH': 'Aquatic animal',
    'BIRD': 'Flying animal',
    'TREE': 'Large plant',
    'HOUSE': 'Dwelling place',
    'WATER': 'Clear liquid',
    'FIRE': 'Hot flame',
    'EARTH': 'Our planet',
    'WIND': 'Moving air'
  };
  
  return definitions[word] || `A ${word.length}-letter word`;
}

function getWordCategory(word: string): string {
  const categories: Record<string, string> = {
    'CAT': 'Animal',
    'DOG': 'Animal',
    'FISH': 'Animal',
    'BIRD': 'Animal',
    'TREE': 'Nature',
    'FLOWER': 'Nature',
    'HOUSE': 'Building',
    'SCHOOL': 'Building',
    'WATER': 'Element',
    'FIRE': 'Element'
  };
  
  return categories[word] || 'General';
}

function getSimpleRhyme(word: string): string {
  const rhymes: Record<string, string> = {
    'CAT': 'HAT',
    'DOG': 'LOG',
    'FISH': 'DISH',
    'TREE': 'FREE',
    'HOUSE': 'MOUSE',
    'FIRE': 'TIRE'
  };
  
  return rhymes[word] || '...';
}
// Word Scramble Game Utility Functions
import {
  WordScrambleDifficulty,
  WordScrambleGameMode,
  WordScrambleCategory,
  WordScrambleWord,
  WORD_SCRAMBLE_CONSTANTS
} from '@/types/games/word-scramble';

/**
 * Generate unique session ID
 */
export function generateWordScrambleSessionId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Shuffle string characters
 */
export function shuffleWord(word: string, preserveFirst: boolean = false, preserveLast: boolean = false): string {
  const chars = word.toUpperCase().split('');
  
  if (chars.length <= 2) return word;
  
  let startIndex = preserveFirst ? 1 : 0;
  let endIndex = preserveLast ? chars.length - 1 : chars.length;
  
  const middle = chars.slice(startIndex, endIndex);
  
  // Fisher-Yates shuffle
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middle[i], middle[j]] = [middle[j], middle[i]];
  }
  
  const result = [
    ...(preserveFirst ? [chars[0]] : []),
    ...middle,
    ...(preserveLast ? [chars[chars.length - 1]] : [])
  ];
  
  return result.join('');
}

/**
 * Advanced word scrambling with multiple algorithms
 */
export function scrambleWordAdvanced(
  word: string, 
  difficulty: WordScrambleDifficulty = 'medium'
): string {
  const originalWord = word.toUpperCase();
  let scrambled = originalWord;
  let attempts = 0;
  const maxAttempts = 20;
  
  // Ensure the scrambled word is different from original
  while (scrambled === originalWord && attempts < maxAttempts) {
    switch (difficulty) {
      case 'easy':
        // Keep first and last letters in place
        scrambled = shuffleWord(originalWord, true, true);
        break;
        
      case 'medium':
        // Keep first letter in place
        scrambled = shuffleWord(originalWord, true, false);
        break;
        
      case 'hard':
        // Complete shuffle
        scrambled = shuffleWord(originalWord, false, false);
        break;
        
      case 'expert':
        // Reverse + shuffle
        scrambled = shuffleWord(originalWord.split('').reverse().join(''), false, false);
        break;
        
      case 'insane':
        // Multiple scrambling passes
        scrambled = originalWord;
        for (let i = 0; i < 3; i++) {
          scrambled = shuffleWord(scrambled, false, false);
        }
        break;
    }
    attempts++;
  }
  
  return scrambled !== originalWord ? scrambled : shuffleWord(originalWord, false, false);
}

/**
 * Check if a guess contains valid characters
 */
export function isValidGuess(guess: string): boolean {
  return /^[A-Za-z]+$/.test(guess.trim());
}

/**
 * Format score for display
 */
export function formatWordScrambleScore(score: number): string {
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
export function formatScrambleTime(seconds: number): string {
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
export function formatScrambleAccuracy(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(difficulty: WordScrambleDifficulty): string {
  const colors = {
    easy: '#4CAF50',      // Green
    medium: '#FF9800',    // Orange
    hard: '#F44336',      // Red
    expert: '#9C27B0',    // Purple
    insane: '#E91E63'     // Pink
  };
  
  return colors[difficulty] || '#757575';
}

/**
 * Get game mode color for UI
 */
export function getGameModeColor(gameMode: WordScrambleGameMode): string {
  const colors = {
    classic: '#2196F3',   // Blue
    timed: '#FF5722',     // Deep Orange
    streak: '#4CAF50',    // Green
    marathon: '#795548',  // Brown
    blitz: '#E91E63',     // Pink
    zen: '#009688'        // Teal
  };
  
  return colors[gameMode] || '#757575';
}

/**
 * Get category color for UI
 */
export function getCategoryColor(category: WordScrambleCategory): string {
  const colors = {
    programming: '#2196F3',  // Blue
    science: '#4CAF50',      // Green
    animals: '#FF9800',      // Orange
    countries: '#9C27B0',    // Purple
    technology: '#607D8B',   // Blue Grey
    general: '#795548',      // Brown
    mixed: '#FF5722'         // Deep Orange
  };
  
  return colors[category] || '#757575';
}

/**
 * Get difficulty display name
 */
export function getDifficultyDisplayName(difficulty: WordScrambleDifficulty): string {
  const names = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
    insane: 'Insane'
  };
  
  return names[difficulty] || difficulty;
}

/**
 * Get game mode display name
 */
export function getGameModeDisplayName(gameMode: WordScrambleGameMode): string {
  const names = {
    classic: 'Classic',
    timed: 'Timed Challenge',
    streak: 'Streak Mode',
    marathon: 'Marathon',
    blitz: 'Blitz',
    zen: 'Zen Mode'
  };
  
  return names[gameMode] || gameMode;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: WordScrambleCategory): string {
  const names = {
    programming: 'Programming',
    science: 'Science',
    animals: 'Animals',
    countries: 'Countries',
    technology: 'Technology',
    general: 'General',
    mixed: 'Mixed Categories'
  };
  
  return names[category] || category;
}

/**
 * Get color for reaction time performance
 */
export function getReactionTimeColor(milliseconds: number): string {
  if (milliseconds <= 2000) return '#4CAF50';    // Green - Excellent
  if (milliseconds <= 4000) return '#8BC34A';    // Light Green - Good
  if (milliseconds <= 6000) return '#FFEB3B';    // Yellow - Average
  if (milliseconds <= 10000) return '#FF9800';   // Orange - Slow
  return '#F44336';                              // Red - Very Slow
}

/**
 * Get color for accuracy performance
 */
export function getScrambleAccuracyColor(accuracy: number): string {
  if (accuracy >= 0.9) return '#4CAF50';         // Green
  if (accuracy >= 0.8) return '#8BC34A';         // Light Green
  if (accuracy >= 0.7) return '#FFEB3B';         // Yellow
  if (accuracy >= 0.6) return '#FF9800';         // Orange
  return '#F44336';                              // Red
}

/**
 * Get color for streak performance
 */
export function getStreakColor(streak: number): string {
  if (streak >= 20) return '#E91E63';            // Pink - Legendary
  if (streak >= 15) return '#9C27B0';            // Purple - Amazing
  if (streak >= 10) return '#3F51B5';            // Indigo - Excellent
  if (streak >= 5) return '#2196F3';             // Blue - Great
  if (streak >= 3) return '#4CAF50';             // Green - Good
  return '#757575';                              // Grey - Starting
}

/**
 * Calculate difficulty-based time limits
 */
export function getDifficultyTimeLimit(difficulty: WordScrambleDifficulty): number {
  return WORD_SCRAMBLE_CONSTANTS.TIME_LIMITS[difficulty] || 30;
}

/**
 * Calculate word complexity score
 */
export function calculateWordComplexity(word: string): number {
  const length = word.length;
  const uniqueLetters = new Set(word.toUpperCase()).size;
  
  // Factors: length, letter uniqueness, common patterns
  const lengthScore = Math.min(10, length) / 10;
  const uniquenessScore = uniqueLetters / length;
  
  return (lengthScore * 0.6) + (uniquenessScore * 0.4);
}

/**
 * Validate word length
 */
export function isValidWordLength(word: string): boolean {
  const length = word.length;
  return length >= WORD_SCRAMBLE_CONSTANTS.MIN_WORD_LENGTH && 
         length <= WORD_SCRAMBLE_CONSTANTS.MAX_WORD_LENGTH;
}

/**
 * Calculate streak bonus multiplier
 */
export function calculateStreakBonus(streak: number): number {
  if (streak >= 20) return 4.0;
  if (streak >= 15) return 3.5;
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
  streak: number,
  accuracy: number,
  speed: number
): string {
  const messages = [];
  
  if (streak >= 10) messages.push('Incredible streak!');
  if (accuracy >= 0.9) messages.push('Amazing accuracy!');
  if (speed <= 3000) messages.push('Lightning fast!');
  
  if (messages.length === 0) {
    if (streak >= 3) messages.push('Good streak going!');
    else if (accuracy >= 0.7) messages.push('Nice work!');
    else messages.push('Keep it up!');
  }
  
  return messages[Math.floor(Math.random() * messages.length)];
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
 * Analyze word patterns for hints
 */
export function analyzeWordPattern(word: string): {
  vowels: string[];
  consonants: string[];
  firstLetter: string;
  lastLetter: string;
  doubleLetters: string[];
} {
  const vowelChars = 'AEIOU';
  const chars = word.toUpperCase().split('');
  
  const vowels = chars.filter(char => vowelChars.includes(char));
  const consonants = chars.filter(char => !vowelChars.includes(char));
  
  // Find double letters
  const doubleLetters = [];
  for (let i = 0; i < chars.length - 1; i++) {
    if (chars[i] === chars[i + 1] && !doubleLetters.includes(chars[i])) {
      doubleLetters.push(chars[i]);
    }
  }
  
  return {
    vowels,
    consonants,
    firstLetter: chars[0],
    lastLetter: chars[chars.length - 1],
    doubleLetters
  };
}

/**
 * Calculate hint effectiveness score
 */
export function calculateHintEffectiveness(
  hintType: string,
  word: string,
  previousHints: string[]
): number {
  // Return a score 0-1 indicating how helpful this hint would be
  const pattern = analyzeWordPattern(word);
  
  switch (hintType) {
    case 'first-letter':
      return previousHints.includes('first-letter') ? 0.1 : 0.8;
      
    case 'last-letter':
      return previousHints.includes('last-letter') ? 0.1 : 0.7;
      
    case 'vowels':
      return pattern.vowels.length > 0 ? 0.9 : 0.2;
      
    case 'definition':
      return previousHints.includes('definition') ? 0.1 : 0.6;
      
    case 'category':
      return previousHints.includes('category') ? 0.1 : 0.5;
      
    case 'length':
      return previousHints.includes('length') ? 0.1 : 0.4;
      
    default:
      return 0.5;
  }
}

/**
 * Validate game settings
 */
export function validateWordScrambleSettings(settings: any): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  if (settings.customTimeLimit) {
    if (settings.customTimeLimit < 10) {
      errors.push('Time limit must be at least 10 seconds');
    }
    if (settings.customTimeLimit > 1800) {
      errors.push('Time limit cannot exceed 30 minutes');
    }
  }
  
  if (settings.customWords) {
    if (settings.customWords.length === 0) {
      errors.push('Must provide at least one custom word');
    }
    
    for (const word of settings.customWords) {
      if (!isValidWordLength(word)) {
        errors.push(`Word "${word}" is not valid length`);
      }
      if (!isValidGuess(word)) {
        errors.push(`Word "${word}" contains invalid characters`);
      }
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
  streakRequired: number;
  speedRequired: number;
} {
  return {
    wordsRequired: currentLevel * 3 + 5,
    accuracyRequired: Math.min(0.95, 0.6 + (currentLevel * 0.05)),
    streakRequired: Math.min(15, currentLevel * 2 + 2),
    speedRequired: Math.max(2000, 8000 - (currentLevel * 500)) // milliseconds
  };
}

/**
 * Calculate achievement progress
 */
export function getAchievementProgress(
  wordsCompleted: number,
  accuracy: number,
  maxStreak: number,
  fastestTime: number
): Record<string, number> {
  return {
    'words_10': Math.min(1, wordsCompleted / 10),
    'words_25': Math.min(1, wordsCompleted / 25),
    'accuracy_80': Math.min(1, accuracy / 0.8),
    'accuracy_90': Math.min(1, accuracy / 0.9),
    'streak_5': Math.min(1, maxStreak / 5),
    'streak_10': Math.min(1, maxStreak / 10),
    'speed_3000': Math.min(1, Math.max(0, 1 - (fastestTime - 2000) / 1000)),
    'speed_2000': Math.min(1, Math.max(0, 1 - (fastestTime - 1500) / 500))
  };
}

/**
 * Generate scramble variants for testing
 */
export function generateScrambleVariants(word: string, count: number = 5): string[] {
  const variants = new Set<string>();
  const originalWord = word.toUpperCase();
  
  variants.add(originalWord); // Include original for comparison
  
  while (variants.size < count + 1) {
    const scrambled = scrambleWordAdvanced(originalWord, 'medium');
    if (scrambled !== originalWord) {
      variants.add(scrambled);
    }
  }
  
  // Remove original and return variants
  variants.delete(originalWord);
  return Array.from(variants);
}

/**
 * Check if scrambled word is solvable
 */
export function isScrambleSolvable(scrambled: string, original: string): boolean {
  const scrambledChars = scrambled.toUpperCase().split('').sort();
  const originalChars = original.toUpperCase().split('').sort();
  
  return scrambledChars.join('') === originalChars.join('');
}

/**
 * Calculate scramble difficulty score
 */
export function calculateScrambleDifficulty(original: string, scrambled: string): number {
  const originalChars = original.toUpperCase().split('');
  const scrambledChars = scrambled.toUpperCase().split('');
  
  let changedPositions = 0;
  for (let i = 0; i < originalChars.length; i++) {
    if (originalChars[i] !== scrambledChars[i]) {
      changedPositions++;
    }
  }
  
  return changedPositions / originalChars.length;
}

/**
 * Format game duration for display
 */
export function formatGameDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
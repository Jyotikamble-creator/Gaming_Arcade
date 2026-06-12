import type { SimonColor, ISimonStats } from '@/types/games/simon';

/**
 * Generate a unique session ID
 * @returns Unique identifier string
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `simon_${timestamp}_${random}`;
}

/**
 * Get color hex value for Simon colors
 * @param color - Simon color name
 * @returns Hex color value
 */
export function getSimonColorHex(color: SimonColor): string {
  const colorMap: Record<SimonColor, string> = {
    red: '#FF4444',
    blue: '#4444FF',
    green: '#44FF44',
    yellow: '#FFFF44',
    purple: '#FF44FF',
    orange: '#FF8844',
    pink: '#FFB6C1',
    cyan: '#44FFFF'
  };
  
  return colorMap[color] || '#CCCCCC';
}

/**
 * Get Simon color RGB values
 * @param color - Simon color name
 * @returns RGB object
 */
export function getSimonColorRGB(color: SimonColor): { r: number; g: number; b: number } {
  const hex = getSimonColorHex(color);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return { r, g, b };
}

/**
 * Validate Simon color
 * @param color - Color to validate
 * @returns True if valid Simon color
 */
export function isValidSimonColor(color: string): color is SimonColor {
  const validColors: SimonColor[] = [
    'red', 'blue', 'green', 'yellow', 
    'purple', 'orange', 'pink', 'cyan'
  ];
  
  return validColors.includes(color as SimonColor);
}

/**
 * Shuffle Simon colors array
 * @param colors - Colors to shuffle
 * @param seed - Random seed for deterministic shuffle
 * @returns Shuffled colors array
 */
export function shuffleSimonColors(colors: SimonColor[], seed: number = Date.now()): SimonColor[] {
  const shuffled = [...colors];
  let currentIndex = shuffled.length;
  
  // Use seed for deterministic randomness
  let randomSeed = seed;
  
  while (currentIndex !== 0) {
    // Generate pseudo-random index
    randomSeed = (randomSeed * 9301 + 49297) % 233280;
    const randomIndex = Math.floor((randomSeed / 233280) * currentIndex);
    currentIndex--;
    
    // Swap elements
    [shuffled[currentIndex], shuffled[randomIndex]] = 
    [shuffled[randomIndex], shuffled[currentIndex]];
  }
  
  return shuffled;
}

/**
 * Format Simon game time
 * @param milliseconds - Time in milliseconds
 * @returns Formatted time string
 */
export function formatSimonTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const ms = milliseconds % 1000;
  
  if (seconds < 60) {
    return `${seconds}.${Math.floor(ms / 100)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate Simon game accuracy
 * @param correctMoves - Number of correct moves
 * @param totalMoves - Total number of moves
 * @returns Accuracy percentage
 */
export function calculateSimonAccuracy(correctMoves: number, totalMoves: number): number {
  if (totalMoves === 0) return 0;
  return Math.round((correctMoves / totalMoves) * 100);
}

/**
 * Get Simon difficulty level based on score
 * @param score - Player's score
 * @returns Difficulty level
 */
export function getSimonDifficultyFromScore(score: number): 'easy' | 'medium' | 'hard' {
  if (score < 100) return 'easy';
  if (score < 500) return 'medium';
  return 'hard';
}

/**
 * Generate Simon color sequence pattern
 * @param length - Sequence length
 * @param colors - Available colors
 * @param seed - Random seed
 * @returns Generated sequence
 */
export function generateSimonSequence(
  length: number, 
  colors: SimonColor[], 
  seed: number = Date.now()
): SimonColor[] {
  const sequence: SimonColor[] = [];
  let currentSeed = seed;
  
  for (let i = 0; i < length; i++) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const colorIndex = Math.floor((currentSeed / 233280) * colors.length);
    sequence.push(colors[colorIndex]);
  }
  
  return sequence;
}

/**
 * Validate Simon move timing
 * @param expectedTime - Expected move time in ms
 * @param actualTime - Actual move time in ms
 * @param tolerance - Time tolerance in ms
 * @returns True if timing is acceptable
 */
export function validateSimonTiming(
  expectedTime: number, 
  actualTime: number, 
  tolerance: number = 1000
): boolean {
  const timeDiff = Math.abs(actualTime - expectedTime);
  return timeDiff <= tolerance;
}

/**
 * Calculate Simon level progression
 * @param currentLevel - Current level
 * @param score - Current score
 * @returns Next level threshold
 */
export function calculateSimonLevelProgression(currentLevel: number, score: number): number {
  const baseThreshold = 50;
  const multiplier = Math.pow(1.5, currentLevel - 1);
  return Math.round(baseThreshold * multiplier);
}

/**
 * Get Simon game statistics summary
 * @param games - Array of game results
 * @returns Statistics summary
 */
export function getSimonStatsSummary(games: any[]): ISimonStats {
  if (games.length === 0) {
    return {
      totalGames: 0,
      averageScore: 0,
      highestLevel: 0,
      totalCorrectMoves: 0,
      averageAccuracy: 0,
      longestStreak: 0
    };
  }
  
  const totalGames = games.length;
  const totalScore = games.reduce((sum, game) => sum + (game.score || 0), 0);
  const averageScore = Math.round(totalScore / totalGames);
  const highestLevel = Math.max(...games.map(game => game.level || 0));
  const totalCorrectMoves = games.reduce((sum, game) => sum + (game.correctMoves || 0), 0);
  const totalMoves = games.reduce((sum, game) => sum + (game.totalMoves || 0), 0);
  const averageAccuracy = calculateSimonAccuracy(totalCorrectMoves, totalMoves);
  
  // Calculate longest streak
  let longestStreak = 0;
  let currentStreak = 0;
  
  games.forEach(game => {
    if (game.completed && game.score > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return {
    totalGames,
    averageScore,
    highestLevel,
    totalCorrectMoves,
    averageAccuracy,
    longestStreak
  };
}
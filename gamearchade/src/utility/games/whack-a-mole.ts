// Whack-a-Mole Game Utility Functions
import {
  WhackMoleType,
  WhackDifficulty,
  WhackGameMode,
  WhackMolePosition,
  WhackPerformanceMetrics
} from "@/types/games/whack-a-mole";

/**
 * Default whack-a-mole configuration
 */
export const WHACK_MOLE_CONFIG = {
  gridSize: 9, // 3x3 grid
  duration: 30, // 30 seconds
  maxMoles: 3,
  spawnRate: 1500, // milliseconds
  moleSpeed: 1500 // milliseconds
};

/**
 * Generate initial game grid
 */
export function generateGrid(size: number): any[] {
  const grid = [];
  for (let i = 0; i < size; i++) {
    grid.push({
      id: i,
      hasMole: false,
      moleType: null
    });
  }
  return grid;
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(hits: number, total: number): number {
  return total > 0 ? (hits / total) * 100 : 0;
}

/**
 * Generate a random mole for the game
 */
export function generateRandomMole(gridSize: number): any {
  const position = Math.floor(Math.random() * gridSize);
  return {
    id: `mole_${Date.now()}`,
    position,
    type: 'normal',
    points: 10
  };
}

/**
 * Calculate final score with bonuses
 */
export function calculateFinalScore(baseScore: number, accuracy: number, streak: number): number {
  const accuracyBonus = Math.floor(baseScore * (accuracy / 100) * 0.5);
  const streakBonus = Math.floor(streak * 5);
  return baseScore + accuracyBonus + streakBonus;
}

/**
 * Validate game configuration
 */
export function validateGameConfig(config: any): boolean {
  return config && 
         typeof config.gridSize === 'number' && 
         config.gridSize > 0 &&
         typeof config.duration === 'number' && 
         config.duration > 0;
}

/**
 * Check if hit is valid
 */
export function isValidHit(hitPosition: number, molePosition: number): boolean {
  return hitPosition === molePosition;
}

/**
 * Generate unique mole ID
 */
export function generateMoleId(): string {
  return `mole_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate points for different mole types
 */
export function calculateMolePoints(
  moleType: WhackMoleType, 
  pointValues: Record<WhackMoleType, number>
): number {
  return pointValues[moleType] || pointValues.normal;
}

/**
 * Get random mole type with weighted probabilities
 */
export function getRandomMoleType(enableSpecialMoles: boolean = true): WhackMoleType {
  if (!enableSpecialMoles) {
    return 'normal';
  }
  
  const weights = {
    normal: 50,
    fast: 15,
    slow: 10,
    bonus: 10,
    golden: 5,
    bomb: 3,
    freeze: 2,
    double: 3,
    giant: 1,
    mini: 1
  };
  
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [type, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return type as WhackMoleType;
    }
  }
  
  return 'normal';
}

/**
 * Get mole colors for different types
 */
export function getMoleColors(): Record<WhackMoleType, string> {
  return {
    normal: '#8B4513',      // Brown
    fast: '#FF4500',        // Red-Orange
    slow: '#32CD32',        // Lime Green
    bonus: '#9370DB',       // Medium Purple
    golden: '#FFD700',      // Gold
    bomb: '#DC143C',        // Crimson
    freeze: '#00BFFF',      // Deep Sky Blue
    double: '#FF69B4',      // Hot Pink
    giant: '#4B0082',       // Indigo
    mini: '#00FF7F'         // Spring Green
  };
}

/**
 * Convert grid index to row/col position
 */
export function indexToPosition(index: number, gridSize: number): WhackMolePosition {
  const cols = Math.sqrt(gridSize);
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  return { row, col, index };
}

/**
 * Convert row/col to grid index
 */
export function positionToIndex(row: number, col: number, gridSize: number): number {
  const cols = Math.sqrt(gridSize);
  return row * cols + col;
}

/**
 * Validate hit accuracy based on distance from center
 */
export function validateHitAccuracy(
  hitPosition: { x: number; y: number },
  targetCenter: { x: number; y: number }
): number {
  const distance = Math.sqrt(
    Math.pow(hitPosition.x - targetCenter.x, 2) + 
    Math.pow(hitPosition.y - targetCenter.y, 2)
  );
  
  // Convert distance to accuracy score (0-1)
  // Assume maximum distance of 0.5 (from center to corner)
  const maxDistance = 0.5;
  return Math.max(0, 1 - (distance / maxDistance));
}

/**
 * Calculate optimal spawn positions to avoid clustering
 */
export function getOptimalSpawnPositions(
  gridSize: number,
  currentMoles: WhackMolePosition[],
  count: number = 1
): WhackMolePosition[] {
  const cols = Math.sqrt(gridSize);
  const rows = cols;
  const occupiedPositions = new Set(currentMoles.map(m => m.index));
  const availablePositions: WhackMolePosition[] = [];
  
  // Generate all available positions
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      if (!occupiedPositions.has(index)) {
        availablePositions.push({ row, col, index });
      }
    }
  }
  
  if (availablePositions.length === 0) {
    return [];
  }
  
  // For multiple moles, try to distribute them evenly
  if (count === 1 || availablePositions.length <= count) {
    return shuffleArray(availablePositions).slice(0, count);
  }
  
  // Use a simple distribution algorithm
  const selected: WhackMolePosition[] = [];
  const remaining = [...availablePositions];
  
  for (let i = 0; i < count && remaining.length > 0; i++) {
    let bestPosition = remaining[0];
    let maxMinDistance = 0;
    
    for (const position of remaining) {
      const minDistance = Math.min(
        ...selected.map(s => getPositionDistance(position, s)),
        Number.MAX_VALUE
      );
      
      if (minDistance > maxMinDistance) {
        maxMinDistance = minDistance;
        bestPosition = position;
      }
    }
    
    selected.push(bestPosition);
    remaining.splice(remaining.indexOf(bestPosition), 1);
  }
  
  return selected;
}

/**
 * Calculate distance between two grid positions
 */
export function getPositionDistance(pos1: WhackMolePosition, pos2: WhackMolePosition): number {
  return Math.sqrt(
    Math.pow(pos1.row - pos2.row, 2) + 
    Math.pow(pos1.col - pos2.col, 2)
  );
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
 * Format reaction time for display
 */
export function formatReactionTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  }
  return `${(milliseconds / 1000).toFixed(1)}s`;
}

/**
 * Format score for display
 */
export function formatWhackScore(score: number): string {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}M`;
  } else if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}K`;
  }
  return score.toString();
}

/**
 * Format accuracy percentage
 */
export function formatWhackAccuracy(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

/**
 * Get color for reaction time display
 */
export function getReactionTimeColor(reactionTime: number): string {
  if (reactionTime <= 200) return '#4CAF50';   // Green - Excellent
  if (reactionTime <= 300) return '#8BC34A';   // Light Green - Good
  if (reactionTime <= 400) return '#FFEB3B';   // Yellow - Average
  if (reactionTime <= 500) return '#FF9800';   // Orange - Slow
  return '#F44336';                            // Red - Very Slow
}

/**
 * Get color for accuracy display
 */
export function getWhackAccuracyColor(accuracy: number): string {
  if (accuracy >= 0.9) return '#4CAF50';       // Green
  if (accuracy >= 0.8) return '#8BC34A';       // Light Green
  if (accuracy >= 0.7) return '#FFEB3B';       // Yellow
  if (accuracy >= 0.6) return '#FF9800';       // Orange
  return '#F44336';                            // Red
}

/**
 * Get difficulty settings
 */
export function getDifficultySettings(difficulty: WhackDifficulty): {
  spawnRate: number;
  moleSpeed: number;
  maxMoles: number;
  pointMultiplier: number;
} {
  const settings = {
    easy: {
      spawnRate: 2000,      // 2 seconds
      moleSpeed: 2000,      // 2 seconds visible
      maxMoles: 1,
      pointMultiplier: 1.0
    },
    normal: {
      spawnRate: 1500,      // 1.5 seconds
      moleSpeed: 1500,      // 1.5 seconds visible
      maxMoles: 2,
      pointMultiplier: 1.0
    },
    hard: {
      spawnRate: 1200,      // 1.2 seconds
      moleSpeed: 1200,      // 1.2 seconds visible
      maxMoles: 3,
      pointMultiplier: 1.2
    },
    expert: {
      spawnRate: 1000,      // 1 second
      moleSpeed: 1000,      // 1 second visible
      maxMoles: 4,
      pointMultiplier: 1.5
    },
    insane: {
      spawnRate: 800,       // 0.8 seconds
      moleSpeed: 800,       // 0.8 seconds visible
      maxMoles: 5,
      pointMultiplier: 2.0
    }
  };
  
  return settings[difficulty];
}

/**
 * Get game mode settings
 */
export function getGameModeSettings(gameMode: WhackGameMode): {
  duration: number;
  specialRules?: string[];
  scoreMultiplier: number;
} {
  const settings = {
    classic: {
      duration: 30,
      scoreMultiplier: 1.0
    },
    arcade: {
      duration: 60,
      specialRules: ['Power-ups enabled', 'Special moles frequent'],
      scoreMultiplier: 1.2
    },
    zen: {
      duration: 120,
      specialRules: ['No time pressure', 'Focus on accuracy'],
      scoreMultiplier: 0.8
    },
    survival: {
      duration: 180,
      specialRules: ['Increasing difficulty', 'No mistakes allowed'],
      scoreMultiplier: 1.5
    },
    'time-attack': {
      duration: 45,
      specialRules: ['Fast-paced', 'Double spawn rate'],
      scoreMultiplier: 1.3
    },
    precision: {
      duration: 30,
      specialRules: ['Accuracy focused', 'Perfect hits only'],
      scoreMultiplier: 2.0
    },
    endurance: {
      duration: 300,
      specialRules: ['5-minute marathon', 'Stamina test'],
      scoreMultiplier: 1.8
    },
    chaos: {
      duration: 90,
      specialRules: ['Random events', 'Unpredictable spawns'],
      scoreMultiplier: 1.4
    }
  };
  
  return settings[gameMode];
}

/**
 * Calculate performance rating
 */
export function getWhackPerformanceRating(metrics: WhackPerformanceMetrics): string {
  const score = metrics.overallRating;
  
  if (score >= 0.95) return 'Legendary';
  if (score >= 0.90) return 'Master';
  if (score >= 0.80) return 'Expert';
  if (score >= 0.70) return 'Advanced';
  if (score >= 0.60) return 'Intermediate';
  if (score >= 0.50) return 'Beginner';
  return 'Novice';
}

/**
 * Generate achievement progress
 */
export function getAchievementProgress(
  currentScore: number,
  accuracy: number,
  streak: number,
  reactionTime: number
): Record<string, number> {
  return {
    'score_100': Math.min(1, currentScore / 100),
    'score_500': Math.min(1, currentScore / 500),
    'score_1000': Math.min(1, currentScore / 1000),
    'accuracy_80': Math.min(1, accuracy / 0.8),
    'accuracy_90': Math.min(1, accuracy / 0.9),
    'streak_10': Math.min(1, streak / 10),
    'streak_20': Math.min(1, streak / 20),
    'speed_300': Math.min(1, Math.max(0, 1 - (reactionTime - 200) / 100)),
    'speed_200': Math.min(1, Math.max(0, 1 - (reactionTime - 150) / 50))
  };
}

/**
 * Validate game settings
 */
export function validateWhackSettings(settings: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (settings.customDuration && (settings.customDuration < 10 || settings.customDuration > 600)) {
    errors.push('Custom duration must be between 10 and 600 seconds');
  }
  
  if (settings.customGridSize && (settings.customGridSize < 4 || settings.customGridSize > 36)) {
    errors.push('Custom grid size must be between 4 and 36');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate streak bonus
 */
export function calculateStreakBonus(streak: number): number {
  if (streak >= 30) return 3.0;
  if (streak >= 20) return 2.5;
  if (streak >= 15) return 2.0;
  if (streak >= 10) return 1.5;
  if (streak >= 5) return 1.2;
  return 1.0;
}

/**
 * Get mole spawn timing based on difficulty and game progress
 */
export function calculateSpawnTiming(
  difficulty: WhackDifficulty,
  gameProgress: number, // 0-1, how far through the game
  baseSpawnRate: number
): number {
  const difficultyMultipliers = {
    easy: 1.2,
    normal: 1.0,
    hard: 0.8,
    expert: 0.6,
    insane: 0.4
  };
  
  // Gradually increase spawn rate as game progresses
  const progressMultiplier = 1 - (gameProgress * 0.3);
  
  return baseSpawnRate * difficultyMultipliers[difficulty] * progressMultiplier;
}

/**
 * Determine if position is adjacent to existing moles
 */
export function isPositionAdjacent(
  position: WhackMolePosition,
  existingPositions: WhackMolePosition[],
  gridSize: number
): boolean {
  const cols = Math.sqrt(gridSize);
  
  for (const existing of existingPositions) {
    const rowDiff = Math.abs(position.row - existing.row);
    const colDiff = Math.abs(position.col - existing.col);
    
    // Adjacent if difference is 1 in any direction (including diagonal)
    if (rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate random power-up type
 */
export function getRandomPowerUpType(): string {
  const powerUps = [
    'slow-motion',
    'freeze',
    'double-points',
    'big-targets',
    'extra-time',
    'score-bonus'
  ];
  
  return powerUps[Math.floor(Math.random() * powerUps.length)];
}

/**
 * Calculate combo multiplier based on consecutive hits
 */
export function calculateComboMultiplier(consecutiveHits: number): number {
  return Math.min(5.0, 1 + Math.floor(consecutiveHits / 5) * 0.5);
}

/**
 * Format game duration for display
 */
export function formatGameDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Get performance rating with details
 */
export function getPerformanceRating(score: number): { text: string; color: string; description: string } {
  const ratings = {
    'Legendary': { color: 'text-purple-400', description: 'Outstanding performance!' },
    'Master': { color: 'text-blue-400', description: 'Excellent skills!' },
    'Expert': { color: 'text-green-400', description: 'Great job!' },
    'Advanced': { color: 'text-yellow-400', description: 'Good performance!' },
    'Intermediate': { color: 'text-orange-400', description: 'Keep practicing!' },
    'Beginner': { color: 'text-gray-400', description: 'Nice try!' },
    'Novice': { color: 'text-red-400', description: 'Practice makes perfect!' }
  };

  let rating: string;
  if (score >= 500) rating = 'Legendary';
  else if (score >= 300) rating = 'Master';
  else if (score >= 200) rating = 'Expert';
  else if (score >= 100) rating = 'Advanced';
  else if (score >= 50) rating = 'Intermediate';
  else if (score >= 10) rating = 'Beginner';
  else rating = 'Novice';

  return {
    text: rating,
    color: ratings[rating as keyof typeof ratings].color,
    description: ratings[rating as keyof typeof ratings].description
  };
}
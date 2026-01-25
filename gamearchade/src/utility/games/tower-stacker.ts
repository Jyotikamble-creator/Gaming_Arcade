// Tower Stacker Game Utility Functions
import {
  TowerStackerBlock,
  TowerStackerValidation,
  TowerStackerGameConfiguration,
  TowerStackerDifficulty,
  TowerStackerScoreCalculation,
  TowerStackerPerformanceMetrics
} from "@/types/games/tower-stacker";

/**
 * Generate colors for Tower Stacker blocks
 */
export function generateTowerStackerColors(baseColors: string[]): string[] {
  const colors = [...baseColors];
  
  // Add gradient variations
  const gradientColors = baseColors.map(color => {
    // Create lighter and darker variations
    return [
      color,
      lightenColor(color, 20),
      darkenColor(color, 20)
    ];
  }).flat();
  
  return [...colors, ...gradientColors];
}

/**
 * Lighten a hex color
 */
export function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

/**
 * Darken a hex color
 */
export function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  
  return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B))
    .toString(16).slice(1);
}

/**
 * Calculate block position based on movement
 */
export function calculateBlockPosition(
  block: TowerStackerBlock, 
  deltaTime: number,
  containerWidth: number = 400
): number {
  const speed = block.speed * deltaTime / 16.67; // Normalize to 60fps
  const movement = block.direction === 'left' ? -speed : speed;
  
  let newPosition = block.position + movement;
  
  // Bounce off walls
  const halfWidth = block.width / 2;
  const leftBound = -containerWidth / 2 + halfWidth;
  const rightBound = containerWidth / 2 - halfWidth;
  
  if (newPosition <= leftBound) {
    newPosition = leftBound;
    block.direction = 'right';
  } else if (newPosition >= rightBound) {
    newPosition = rightBound;
    block.direction = 'left';
  }
  
  return newPosition;
}

/**
 * Validate a block drop
 */
export function validateDrop(
  currentBlock: TowerStackerBlock,
  previousBlock: TowerStackerBlock | null,
  dropPosition: number
): TowerStackerValidation {
  if (!previousBlock) {
    // First block - always valid
    return {
      isValidDrop: true,
      accuracy: 1.0,
      newWidth: currentBlock.width,
      isPerfect: true,
      blocksLost: 0,
      canContinue: true
    };
  }
  
  const blockLeft = dropPosition - currentBlock.width / 2;
  const blockRight = dropPosition + currentBlock.width / 2;
  const targetLeft = previousBlock.position - previousBlock.width / 2;
  const targetRight = previousBlock.position + previousBlock.width / 2;
  
  // Calculate overlap
  const overlapLeft = Math.max(blockLeft, targetLeft);
  const overlapRight = Math.min(blockRight, targetRight);
  const overlapWidth = Math.max(0, overlapRight - overlapLeft);
  
  // Calculate accuracy based on overlap
  const maxPossibleOverlap = Math.min(currentBlock.width, previousBlock.width);
  const accuracy = maxPossibleOverlap > 0 ? overlapWidth / maxPossibleOverlap : 0;
  
  // Calculate how much of the block is lost
  const blocksLost = currentBlock.width - overlapWidth;
  
  // New width is the overlap width
  const newWidth = overlapWidth;
  
  // Perfect drop threshold
  const isPerfect = accuracy >= 0.95; // 95% accuracy is considered perfect
  
  // Can continue if there's enough overlap
  const minWidth = 10; // Minimum width to continue
  const canContinue = newWidth >= minWidth;
  
  return {
    isValidDrop: overlapWidth > 0,
    accuracy,
    newWidth,
    isPerfect,
    blocksLost,
    canContinue
  };
}

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: number, pos2: number): number {
  return Math.abs(pos1 - pos2);
}

/**
 * Format score for display
 */
export function formatTowerStackerScore(score: number): string {
  if (score >= 1000000) {
    return (score / 1000000).toFixed(1) + 'M';
  } else if (score >= 1000) {
    return (score / 1000).toFixed(1) + 'K';
  }
  return score.toString();
}

/**
 * Format time for display
 */
export function formatTowerStackerTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Format accuracy percentage
 */
export function formatAccuracy(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: TowerStackerDifficulty): string {
  const colors = {
    beginner: '#4CAF50',    // Green
    intermediate: '#FF9800', // Orange
    advanced: '#F44336',    // Red
    expert: '#9C27B0',      // Purple
    master: '#E91E63'       // Pink
  };
  
  return colors[difficulty] || colors.beginner;
}

/**
 * Get level color based on progress
 */
export function getLevelColor(level: number): string {
  if (level >= 20) return '#FFD700'; // Gold
  if (level >= 15) return '#C0C0C0'; // Silver
  if (level >= 10) return '#CD7F32'; // Bronze
  if (level >= 5) return '#4CAF50';  // Green
  return '#2196F3'; // Blue
}

/**
 * Calculate streak bonus
 */
export function calculateStreakBonus(streak: number): number {
  if (streak >= 10) return 100;
  if (streak >= 5) return 50;
  if (streak >= 3) return 25;
  return 0;
}

/**
 * Validate Tower Stacker score calculation parameters
 */
export function validateTowerStackerScore(params: {
  level: number;
  perfectDrops?: number;
  totalDrops?: number;
  averageAccuracy?: number;
}): { isValid: boolean; error?: string } {
  const { level, perfectDrops = 0, totalDrops = 0, averageAccuracy = 0 } = params;
  
  if (typeof level !== 'number' || level < 1 || level > 20) {
    return { isValid: false, error: 'Level must be between 1 and 20' };
  }
  
  if (typeof perfectDrops !== 'number' || perfectDrops < 0) {
    return { isValid: false, error: 'Perfect drops must be non-negative' };
  }
  
  if (typeof totalDrops !== 'number' || totalDrops < 0) {
    return { isValid: false, error: 'Total drops must be non-negative' };
  }
  
  if (perfectDrops > totalDrops) {
    return { isValid: false, error: 'Perfect drops cannot exceed total drops' };
  }
  
  if (typeof averageAccuracy !== 'number' || averageAccuracy < 0 || averageAccuracy > 1) {
    return { isValid: false, error: 'Average accuracy must be between 0 and 1' };
  }
  
  return { isValid: true };
}

/**
 * Get performance rating based on metrics
 */
export function getPerformanceRating(metrics: TowerStackerPerformanceMetrics): string {
  const score = metrics.overallRating;
  
  if (score >= 0.95) return 'Legendary';
  if (score >= 0.90) return 'Exceptional';
  if (score >= 0.80) return 'Excellent';
  if (score >= 0.70) return 'Good';
  if (score >= 0.60) return 'Average';
  if (score >= 0.50) return 'Below Average';
  return 'Needs Improvement';
}

/**
 * Calculate level progression requirements
 */
export function calculateLevelRequirements(level: number): {
  targetWidth: number;
  speed: number;
  perfectDropsNeeded: number;
  accuracyThreshold: number;
} {
  return {
    targetWidth: Math.max(20, 150 - (level - 1) * 5),
    speed: Math.min(8.0, 2.0 + (level - 1) * 0.2),
    perfectDropsNeeded: Math.ceil(level * 0.6),
    accuracyThreshold: Math.max(0.5, 0.8 - (level - 1) * 0.01)
  };
}

/**
 * Generate random block color
 */
export function getRandomBlockColor(colors: string[], level: number): string {
  // Use level to create some variation
  const colorIndex = (level - 1) % colors.length;
  return colors[colorIndex];
}

/**
 * Calculate drop timing score
 */
export function calculateDropTiming(reactionTime: number): {
  score: number;
  rating: 'Perfect' | 'Excellent' | 'Good' | 'Average' | 'Slow';
} {
  if (reactionTime <= 200) {
    return { score: 100, rating: 'Perfect' };
  } else if (reactionTime <= 400) {
    return { score: 85, rating: 'Excellent' };
  } else if (reactionTime <= 600) {
    return { score: 70, rating: 'Good' };
  } else if (reactionTime <= 1000) {
    return { score: 50, rating: 'Average' };
  } else {
    return { score: 25, rating: 'Slow' };
  }
}

/**
 * Get achievement progress
 */
export function getAchievementProgress(
  currentLevel: number,
  perfectDrops: number,
  averageAccuracy: number
): { [key: string]: number } {
  return {
    'first_tower': Math.min(1, currentLevel / 5),
    'halfway_there': Math.min(1, currentLevel / 10),
    'almost_perfect': Math.min(1, currentLevel / 15),
    'tower_master': Math.min(1, currentLevel / 20),
    'perfect_aim': Math.min(1, perfectDrops / 5),
    'sharpshooter': Math.min(1, perfectDrops / 10),
    'precision_master': Math.min(1, averageAccuracy / 0.9)
  };
}

/**
 * Calculate block physics
 */
export function calculateBlockPhysics(
  block: TowerStackerBlock,
  gravity: number = 0.5,
  friction: number = 0.98
): Partial<TowerStackerBlock> {
  // Simple physics simulation for block movement
  const newSpeed = block.speed * friction;
  
  return {
    speed: Math.max(0.1, newSpeed)
  };
}

/**
 * Generate game configuration for difficulty
 */
export function getConfigurationForDifficulty(difficulty: TowerStackerDifficulty): TowerStackerGameConfiguration {
  const baseConfig: TowerStackerGameConfiguration = {
    initialWidth: 150,
    minWidth: 20,
    baseSpeed: 2.0,
    speedIncrement: 0.2,
    maxSpeed: 8.0,
    perfectDropThreshold: 0.95,
    colors: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
    ],
    levelProgressionRules: {
      speedIncrease: 0.2,
      widthDecrease: 5,
      colorChange: true
    }
  };
  
  switch (difficulty) {
    case 'beginner':
      return {
        ...baseConfig,
        baseSpeed: 1.5,
        speedIncrement: 0.1,
        perfectDropThreshold: 0.9
      };
      
    case 'intermediate':
      return baseConfig;
      
    case 'advanced':
      return {
        ...baseConfig,
        baseSpeed: 2.5,
        speedIncrement: 0.25,
        perfectDropThreshold: 0.95
      };
      
    case 'expert':
      return {
        ...baseConfig,
        baseSpeed: 3.0,
        speedIncrement: 0.3,
        maxSpeed: 10.0,
        perfectDropThreshold: 0.98
      };
      
    case 'master':
      return {
        ...baseConfig,
        baseSpeed: 3.5,
        speedIncrement: 0.35,
        maxSpeed: 12.0,
        perfectDropThreshold: 0.99,
        levelProgressionRules: {
          speedIncrease: 0.35,
          widthDecrease: 7,
          colorChange: true
        }
      };
      
    default:
      return baseConfig;
  }
}
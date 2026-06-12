/**
 * Utility functions and helpers for Number Maze Game
 */

import type {
  NumberMazeDifficultyLevel,
  DifficultyBenchmark,
  PerformanceRating,
  MazeConfig,
  MazeOperation
} from '@/types/games/number-maze';

/**
 * Difficulty benchmarks configuration
 */
export const DIFFICULTY_BENCHMARKS: Record<NumberMazeDifficultyLevel, DifficultyBenchmark> = {
  beginner: { minMoves: 15, maxMoves: 25, maxTime: 300 },
  intermediate: { minMoves: 10, maxMoves: 14, maxTime: 240 },
  advanced: { minMoves: 8, maxMoves: 9, maxTime: 180 },
  expert: { minMoves: 6, maxMoves: 7, maxTime: 120 },
  master: { minMoves: 4, maxMoves: 5, maxTime: 90 }
};

/**
 * Generate start and target numbers based on difficulty
 */
export function generateNumbers(difficulty: NumberMazeDifficultyLevel): {
  startNumber: number;
  targetNumber: number;
} {
  let startNumber: number;
  let targetNumber: number;

  switch (difficulty) {
    case 'beginner':
      startNumber = Math.floor(Math.random() * 10) + 1; // 1-10
      targetNumber = Math.floor(Math.random() * 20) + 10; // 10-30
      break;
    case 'intermediate':
      startNumber = Math.floor(Math.random() * 15) + 1; // 1-15
      targetNumber = Math.floor(Math.random() * 40) + 20; // 20-60
      break;
    case 'advanced':
      startNumber = Math.floor(Math.random() * 20) + 1; // 1-20
      targetNumber = Math.floor(Math.random() * 80) + 40; // 40-120
      break;
    case 'expert':
      startNumber = Math.floor(Math.random() * 25) + 1; // 1-25
      targetNumber = Math.floor(Math.random() * 150) + 50; // 50-200
      break;
    case 'master':
      startNumber = Math.floor(Math.random() * 30) + 1; // 1-30
      targetNumber = Math.floor(Math.random() * 400) + 100; // 100-500
      break;
    default:
      startNumber = 5;
      targetNumber = 20;
  }

  return { startNumber, targetNumber };
}

/**
 * Calculate score based on performance
 */
export function calculateScore(
  moves: number,
  timeElapsed: number,
  targetNumber: number = 0,
  difficulty: NumberMazeDifficultyLevel = 'beginner'
): number {
  // Base score calculation
  let score = 1000;

  // Move efficiency bonus (fewer moves = higher score)
  const moveBonus = Math.max(0, 200 - moves * 15);
  score += moveBonus;

  // Time bonus (faster completion = higher score)
  const timeBonus = Math.max(0, 300 - timeElapsed);
  score += timeBonus;

  // Target difficulty bonus (reasonable targets get bonus)
  const targetBonus = Math.abs(targetNumber) <= 25 ? 100 : 0;
  score += targetBonus;

  // Perfect solve bonus (under 8 moves)
  if (moves <= 8) score += 150;

  // Speed demon bonus (under 2 minutes)
  if (timeElapsed <= 120) score += 50;

  // Difficulty multiplier
  const multipliers: Record<NumberMazeDifficultyLevel, number> = {
    beginner: 1,
    intermediate: 1.2,
    advanced: 1.5,
    expert: 2,
    master: 2.5
  };
  score *= multipliers[difficulty];

  // Ensure minimum score
  return Math.max(50, Math.round(score));
}

/**
 * Get performance rating based on efficiency
 */
export function getRating(moves: number, timeElapsed: number): PerformanceRating {
  // Calculate total efficiency
  const totalEfficiency =
    (200 / Math.max(moves, 1)) * 100 + (300 / Math.max(timeElapsed, 1)) * 100;
  
  // Determine rating based on total efficiency
  if (totalEfficiency >= 400) return 'Math Master';
  if (totalEfficiency >= 350) return 'Expert Navigator';
  if (totalEfficiency >= 300) return 'Skilled Solver';
  if (totalEfficiency >= 250) return 'Apprentice';
  return 'Beginner';
}

/**
 * Get performance message
 */
export function getMessage(moves: number, timeElapsed: number): string {
  // Determine message based on performance
  if (moves <= 8 && timeElapsed <= 120) {
    return 'Outstanding! You navigated the maze with perfect efficiency!';
  }
  if (moves <= 10) {
    return 'Excellent! You found a very efficient path!';
  }
  if (timeElapsed <= 180) {
    return 'Great speed! You solved it quickly!';
  }
  if (moves <= 15) {
    return 'Well done! Good pathfinding skills!';
  }
  return 'Nice work! Keep practicing to improve your strategy!';
}

/**
 * Calculate move efficiency percentage
 */
export function calculateMoveEfficiency(moves: number): number {
  return Math.round((200 / Math.max(moves, 1)) * 100);
}

/**
 * Calculate time efficiency percentage
 */
export function calculateTimeEfficiency(timeElapsed: number): number {
  return Math.round((300 / Math.max(timeElapsed, 1)) * 100);
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(difficulty: NumberMazeDifficultyLevel): string {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-600';
    case 'intermediate':
      return 'text-blue-600';
    case 'advanced':
      return 'text-yellow-600';
    case 'expert':
      return 'text-orange-600';
    case 'master':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get operation emoji/icon
 */
export function getOperationIcon(operation: MazeOperation): string {
  const icons: Record<MazeOperation, string> = {
    add: '➕',
    subtract: '➖',
    multiply: '✖️',
    divide: '➗',
    square: '²',
    sqrt: '√'
  };
  return icons[operation] || '🔢';
}

/**
 * Validate move operation
 */
export function validateMove(
  currentNumber: number,
  operation: MazeOperation,
  operand?: number
): { valid: boolean; error?: string } {
  switch (operation) {
    case 'add':
    case 'subtract':
    case 'multiply':
      if (operand === undefined) {
        return { valid: false, error: 'Operand is required for this operation' };
      }
      break;
    case 'divide':
      if (operand === undefined) {
        return { valid: false, error: 'Operand is required for division' };
      }
      if (operand === 0) {
        return { valid: false, error: 'Cannot divide by zero' };
      }
      break;
    case 'sqrt':
      if (currentNumber < 0) {
        return { valid: false, error: 'Cannot take square root of negative number' };
      }
      break;
    case 'square':
      // Always valid
      break;
    default:
      return { valid: false, error: 'Invalid operation' };
  }

  return { valid: true };
}

/**
 * Apply operation to a number
 */
export function applyOperation(
  currentNumber: number,
  operation: MazeOperation,
  operand?: number
): number {
  let result = currentNumber;

  switch (operation) {
    case 'add':
      result += operand || 0;
      break;
    case 'subtract':
      result -= operand || 0;
      break;
    case 'multiply':
      result *= operand || 1;
      break;
    case 'divide':
      if (operand && operand !== 0) {
        result = Math.floor(result / operand);
      }
      break;
    case 'square':
      result = result * result;
      break;
    case 'sqrt':
      result = Math.floor(Math.sqrt(result));
      break;
  }

  return result;
}

/**
 * Format time in seconds to readable string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${secs}s`;
}

/**
 * Get all available operations
 */
export function getAllOperations(): MazeOperation[] {
  return ['add', 'subtract', 'multiply', 'divide', 'square', 'sqrt'];
}

/**
 * Get maze configuration for difficulty
 */
export function getMazeConfig(difficulty: NumberMazeDifficultyLevel): MazeConfig {
  const { startNumber, targetNumber } = generateNumbers(difficulty);
  const benchmark = DIFFICULTY_BENCHMARKS[difficulty];

  return {
    difficulty,
    startNumber,
    targetNumber,
    allowedOperations: getAllOperations(),
    benchmark
  };
}

/**
 * Calculate path optimality percentage
 */
export function calculatePathOptimality(
  actualMoves: number,
  difficulty: NumberMazeDifficultyLevel
): number {
  const benchmark = DIFFICULTY_BENCHMARKS[difficulty];
  const optimalMoves = benchmark.minMoves;
  
  if (actualMoves <= optimalMoves) return 100;
  
  const percentage = (optimalMoves / actualMoves) * 100;
  return Math.round(percentage);
}

/**
 * Check if move count meets benchmark
 */
export function meetsBenchmark(
  moves: number,
  timeElapsed: number,
  difficulty: NumberMazeDifficultyLevel
): boolean {
  const benchmark = DIFFICULTY_BENCHMARKS[difficulty];
  return moves <= benchmark.maxMoves && timeElapsed <= benchmark.maxTime;
}

/**
 * Get recommended difficulty based on performance
 */
export function getRecommendedDifficulty(
  averageScore: number,
  completionRate: number
): NumberMazeDifficultyLevel {
  if (averageScore >= 1500 && completionRate >= 0.8) return 'master';
  if (averageScore >= 1200 && completionRate >= 0.7) return 'expert';
  if (averageScore >= 900 && completionRate >= 0.6) return 'advanced';
  if (averageScore >= 600 && completionRate >= 0.5) return 'intermediate';
  return 'beginner';
}

/**
 * Generate hint for next move (simple heuristic)
 */
export function generateHint(currentNumber: number, targetNumber: number): string {
  const difference = targetNumber - currentNumber;

  if (difference === 0) {
    return '🎯 You\'ve reached the target!';
  }

  if (difference > 0) {
    if (difference > 100) {
      return '💡 Try multiplying to get closer to the target faster';
    } else if (difference > 10) {
      return '💡 Try adding or multiplying to reach the target';
    } else {
      return '💡 You\'re close! Try adding to reach the target';
    }
  } else {
    const absDiff = Math.abs(difference);
    if (absDiff > 100) {
      return '💡 Try dividing to reduce the number';
    } else if (absDiff > 10) {
      return '💡 Try subtracting or dividing';
    } else {
      return '💡 You\'re close! Try subtracting to reach the target';
    }
  }
}

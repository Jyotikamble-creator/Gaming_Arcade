// Helper functions for Coding Puzzle game logic
import { 
  DifficultyLevel, 
  PuzzleCategory,
  CategoryStats 
} from '@/types/games/coding-puzzle';

/**
 * Calculate points for a puzzle based on difficulty and time
 */
export function calculatePuzzlePoints(
  difficulty: DifficultyLevel,
  timeSpent: number,
  timeLimit: number = 60,
  hintsUsed: number = 0
): number {
  // Base points by difficulty
  const basePoints: Record<DifficultyLevel, number> = {
    easy: 10,
    medium: 20,
    hard: 30,
  };

  const base = basePoints[difficulty];

  // Time bonus: faster completion = more points
  const timeBonus = Math.max(0, Math.floor((timeLimit - timeSpent) / 5));

  // Hint penalty: each hint reduces points
  const hintPenalty = hintsUsed * 5;

  return Math.max(base + timeBonus - hintPenalty, base / 2);
}

/**
 * Validate user answer against correct answer
 */
export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  // Normalize both answers for comparison
  const normalize = (str: string) => 
    str.trim().toLowerCase().replace(/\s+/g, ' ');
  
  return normalize(userAnswer) === normalize(correctAnswer);
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Update category statistics
 */
export function updateCategoryStats(
  stats: CategoryStats,
  category: PuzzleCategory,
  isCorrect: boolean
): CategoryStats {
  const current = stats[category] || { attempted: 0, correct: 0, accuracy: 0 };
  
  const attempted = current.attempted + 1;
  const correct = current.correct + (isCorrect ? 1 : 0);
  const accuracy = calculateAccuracy(correct, attempted);

  return {
    ...stats,
    [category]: { attempted, correct, accuracy },
  };
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate total score with bonuses
 */
export function calculateTotalScore(
  baseScore: number,
  accuracyBonus: number = 0,
  speedBonus: number = 0
): number {
  return Math.round(baseScore + accuracyBonus + speedBonus);
}

/**
 * Get difficulty multiplier for scoring
 */
export function getDifficultyMultiplier(difficulty: DifficultyLevel): number {
  const multipliers: Record<DifficultyLevel, number> = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
  };
  return multipliers[difficulty];
}

/**
 * Format time in seconds to mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate speed bonus based on time spent
 */
export function calculateSpeedBonus(
  timeSpent: number,
  timeLimit: number
): number {
  const percentage = (timeLimit - timeSpent) / timeLimit;
  if (percentage > 0.75) return 20; // Solved in < 25% of time
  if (percentage > 0.5) return 15;  // Solved in < 50% of time
  if (percentage > 0.25) return 10; // Solved in < 75% of time
  return 0;
}

/**
 * Calculate accuracy bonus
 */
export function calculateAccuracyBonus(accuracy: number): number {
  if (accuracy === 100) return 50;
  if (accuracy >= 90) return 30;
  if (accuracy >= 80) return 20;
  if (accuracy >= 70) return 10;
  return 0;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: PuzzleCategory): string {
  const names: Record<PuzzleCategory, string> = {
    patterns: 'Pattern Recognition',
    codeOutput: 'Code Output Prediction',
    logic: 'Logical Reasoning',
    bitwise: 'Bitwise Operations',
  };
  return names[category];
}

/**
 * Get difficulty color class for UI
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  const colors: Record<DifficultyLevel, string> = {
    easy: 'text-green-500',
    medium: 'text-yellow-500',
    hard: 'text-red-500',
  };
  return colors[difficulty];
}

/**
 * Normalize code output for comparison
 */
export function normalizeCodeOutput(output: string): string {
  return output
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

// Helper functions for Brain Teaser game logic
import { 
  PerformanceLevel, 
  PerformanceMetrics,
  DifficultyLevel,
  PuzzleType,
  Puzzle 
} from '@/types/games/brain-teaser';

/**
 * Calculate performance level based on puzzles solved
 */
export function calculatePerformanceLevel(puzzlesSolved: number): PerformanceLevel {
  if (puzzlesSolved >= 20) return 'genius';
  if (puzzlesSolved >= 15) return 'expert';
  if (puzzlesSolved >= 10) return 'advanced';
  if (puzzlesSolved >= 5) return 'intermediate';
  return 'beginner';
}

/**
 * Calculate performance metrics from game data
 */
export function calculatePerformanceMetrics(
  score: number,
  puzzlesSolved: number,
  bestStreak: number,
  timeUsed: number
): PerformanceMetrics {
  const avgPointsPerPuzzle = Math.round(score / puzzlesSolved);
  const puzzlesPerSecond = (puzzlesSolved / timeUsed).toFixed(2);
  const performanceLevel = calculatePerformanceLevel(puzzlesSolved);
  const streakBonus = bestStreak >= 5 ? (bestStreak - 4) * 10 : 0;

  return {
    avgPointsPerPuzzle,
    puzzlesPerSecond,
    performanceLevel,
    streakBonus,
  };
}

/**
 * Get base points for a puzzle type
 */
export function getBasePoints(puzzleType: PuzzleType): number {
  const pointsMap: Record<PuzzleType, number> = {
    'match-shape': 10,
    'find-odd': 15,
    'pattern': 20,
  };
  return pointsMap[puzzleType];
}

/**
 * Calculate points earned for a puzzle
 */
export function calculatePuzzlePoints(
  puzzleType: PuzzleType,
  timeSpent: number,
  timeLimit: number = 30,
  isCorrect: boolean = true
): number {
  if (!isCorrect) return 0;

  const basePoints = getBasePoints(puzzleType);
  
  // Time bonus: faster completion = more points
  const timeBonus = Math.max(0, Math.floor((timeLimit - timeSpent) / 2));
  
  return basePoints + timeBonus;
}

/**
 * Update streak based on answer correctness
 */
export function updateStreak(
  currentStreak: number,
  bestStreak: number,
  isCorrect: boolean
): { currentStreak: number; bestStreak: number } {
  if (!isCorrect) {
    return { currentStreak: 0, bestStreak };
  }

  const newStreak = currentStreak + 1;
  return {
    currentStreak: newStreak,
    bestStreak: Math.max(bestStreak, newStreak),
  };
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate puzzle answer
 */
export function validateAnswer(
  userAnswer: string,
  correctAnswer: string
): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
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
 * Calculate final score with all bonuses
 */
export function calculateFinalScore(
  baseScore: number,
  streakBonus: number,
  timeBonus: number = 0
): number {
  return Math.round(baseScore + streakBonus + timeBonus);
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
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

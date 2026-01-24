// Type definitions for Brain Teaser game
import { Types } from 'mongoose';

// Difficulty levels
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Performance levels
export type PerformanceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'genius';

// Puzzle types
export type PuzzleType = 'match-shape' | 'find-odd' | 'pattern';

// Difficulty rating structure
export interface DifficultyRating {
  difficulty: DifficultyLevel;
  basePoints: number;
}

// All difficulty ratings
export interface DifficultyRatings {
  'match-shape': DifficultyRating;
  'find-odd': DifficultyRating;
  pattern: DifficultyRating;
}

// Performance calculation request
export interface PerformanceRequest {
  score: number;
  puzzlesSolved: number;
  bestStreak: number;
  timeUsed: number;
}

// Performance metrics response
export interface PerformanceMetrics {
  avgPointsPerPuzzle: number;
  puzzlesPerSecond: string;
  performanceLevel: PerformanceLevel;
  streakBonus: number;
}

// Puzzle data structure
export interface Puzzle {
  id: string;
  type: PuzzleType;
  difficulty: DifficultyLevel;
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
  timeLimit?: number;
}

// Game session
export interface BrainTeaserSession {
  sessionId: string;
  userId?: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  score: number;
  puzzlesSolved: number;
  bestStreak: number;
  currentStreak: number;
  timeUsed: number;
  puzzles: PuzzleAttempt[];
}

// Individual puzzle attempt
export interface PuzzleAttempt {
  puzzleId: string;
  puzzleType: PuzzleType;
  answered: boolean;
  correct: boolean;
  timeSpent: number;
  pointsEarned: number;
  attemptedAt: Date;
}

// Game stats
export interface BrainTeaserStats {
  totalGames: number;
  totalPuzzlesSolved: number;
  averageScore: number;
  bestScore: number;
  bestStreak: number;
  totalTimeSpent: number;
  performanceLevel: PerformanceLevel;
  puzzleTypeStats: {
    [key in PuzzleType]: {
      attempted: number;
      correct: number;
      accuracy: number;
    };
  };
}

// API Response types
export interface DifficultyRatingsResponse {
  success: boolean;
  ratings: DifficultyRatings;
}

export interface PerformanceResponse {
  success: boolean;
  metrics: PerformanceMetrics;
}

export interface ErrorResponse {
  error: string;
}

// Game state for frontend
export interface GameState {
  currentPuzzle: Puzzle | null;
  score: number;
  puzzlesSolved: number;
  currentStreak: number;
  bestStreak: number;
  timeElapsed: number;
  isGameActive: boolean;
  isGameOver: boolean;
  performanceLevel?: PerformanceLevel;
}

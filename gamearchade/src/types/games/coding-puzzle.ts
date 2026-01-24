// Type definitions for Coding Puzzle game
import { Types } from 'mongoose';

// Difficulty levels
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Puzzle categories
export type PuzzleCategory = 'patterns' | 'codeOutput' | 'logic' | 'bitwise';

// Category display information
export interface CategoryInfo {
  id: PuzzleCategory;
  name: string;
  count: number;
  description?: string;
}

// Puzzle structure
export interface Puzzle {
  id?: string;
  question: string;
  answer: string;
  hint: string;
  difficulty: DifficultyLevel;
  category?: PuzzleCategory;
  points?: number;
  timeLimit?: number;
}

// Puzzle with ID
export interface PuzzleWithId extends Puzzle {
  id: string;
  category: PuzzleCategory;
  points: number;
}

// Puzzle attempt tracking
export interface PuzzleAttempt {
  puzzleId: string;
  category: PuzzleCategory;
  difficulty: DifficultyLevel;
  answered: boolean;
  correct: boolean;
  timeSpent: number;
  pointsEarned: number;
  hintsUsed: number;
  attemptedAt: Date;
}

// Game session
export interface CodingPuzzleSession {
  sessionId: string;
  userId?: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  score: number;
  puzzlesSolved: number;
  totalAttempts: number;
  correctAnswers: number;
  hintsUsed: number;
  timeSpent: number;
  puzzles: PuzzleAttempt[];
  categoryStats: CategoryStats;
}

// Category statistics
export interface CategoryStats {
  [key: string]: {
    attempted: number;
    correct: number;
    accuracy: number;
  };
}

// Game statistics
export interface CodingPuzzleStats {
  totalGames: number;
  totalPuzzlesSolved: number;
  totalCorrect: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  accuracy: number;
  categoryStats: CategoryStats;
  difficultyStats: {
    [key in DifficultyLevel]: {
      attempted: number;
      correct: number;
      accuracy: number;
    };
  };
}

// API Request types
export interface ValidateAnswerRequest {
  answer: string;
  correctAnswer: string;
}

// API Response types
export interface PuzzleResponse {
  success: boolean;
  puzzle: PuzzleWithId;
}

export interface CategoriesResponse {
  success: boolean;
  categories: CategoryInfo[];
}

export interface ValidateAnswerResponse {
  success: boolean;
  isCorrect: boolean;
}

export interface ErrorResponse {
  error: string;
}

// Game state for frontend
export interface GameState {
  currentPuzzle: PuzzleWithId | null;
  score: number;
  puzzlesSolved: number;
  correctAnswers: number;
  hintsUsed: number;
  timeElapsed: number;
  isGameActive: boolean;
  isGameOver: boolean;
  currentCategory?: PuzzleCategory;
  showHint: boolean;
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  userId?: string;
  playerName: string;
  score: number;
  puzzlesSolved: number;
  accuracy: number;
  createdAt: Date;
}

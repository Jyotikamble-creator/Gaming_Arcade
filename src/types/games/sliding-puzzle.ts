/**
 * Sliding Puzzle Game Types
 * Defines interfaces for sliding puzzle game functionality
 */

// Sliding puzzle difficulty levels
export type SlidingPuzzleDifficulty = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced' 
  | 'expert' 
  | 'master';

// Rating levels for performance
export type SlidingPuzzleRating = 
  | 'Beginner' 
  | 'Intermediate' 
  | 'Advanced' 
  | 'Expert' 
  | 'Puzzle Master';

// Difficulty benchmark configuration
export interface ISlidingPuzzleBenchmark {
  minMoves: number;
  maxMoves: number;
  maxTime: number; // in seconds
}

// Complete benchmarks for all difficulties
export interface ISlidingPuzzleBenchmarks {
  beginner: ISlidingPuzzleBenchmark;
  intermediate: ISlidingPuzzleBenchmark;
  advanced: ISlidingPuzzleBenchmark;
  expert: ISlidingPuzzleBenchmark;
  master: ISlidingPuzzleBenchmark;
}

// Game session data
export interface ISlidingPuzzleSession {
  sessionId: string;
  userId?: string;
  playerName?: string;
  difficulty: SlidingPuzzleDifficulty;
  puzzleSize: number; // 3x3, 4x4, etc.
  initialState: number[];
  currentState: number[];
  moves: number;
  startTime: Date;
  endTime?: Date;
  timeElapsed?: number; // in seconds
  isCompleted: boolean;
  score?: number;
  rating?: SlidingPuzzleRating;
}

// Score calculation request
export interface SlidingPuzzleScoreRequest {
  moves: number;
  timeElapsed: number;
  difficulty?: SlidingPuzzleDifficulty;
  puzzleSize?: number;
}

// Score calculation response
export interface SlidingPuzzleScoreResponse {
  score: number;
  rating: SlidingPuzzleRating;
  message: string;
  stats: {
    moveEfficiency: number;
    timeEfficiency: number;
  };
  breakdown?: {
    baseScore: number;
    moveBonus: number;
    timeBonus: number;
    perfectSolveBonus?: number;
    speedBonus?: number;
  };
}

// Game statistics
export interface ISlidingPuzzleStats {
  totalGames: number;
  averageScore: number;
  averageMoves: number;
  averageTime: number;
  bestScore: number;
  bestMoves: number;
  bestTime: number;
  completionRate: number;
  difficultyBreakdown: Record<SlidingPuzzleDifficulty, {
    games: number;
    averageScore: number;
    averageMoves: number;
    averageTime: number;
  }>;
}

// Move in the puzzle
export interface ISlidingPuzzleMove {
  fromPosition: number;
  toPosition: number;
  tileNumber: number;
  moveNumber: number;
  timestamp: Date;
}

// Game state validation
export interface ISlidingPuzzleValidation {
  isValid: boolean;
  isSolved: boolean;
  nextMoves: number[];
  hint?: {
    suggestedMove: number;
    reason: string;
  };
}

// Leaderboard entry
export interface ISlidingPuzzleLeaderboard {
  rank: number;
  playerName: string;
  userId?: string;
  score: number;
  moves: number;
  timeElapsed: number;
  difficulty: SlidingPuzzleDifficulty;
  rating: SlidingPuzzleRating;
  completedAt: Date;
}

// Game configuration
export interface ISlidingPuzzleConfig {
  size: number;
  difficulty: SlidingPuzzleDifficulty;
  enableHints: boolean;
  enableTimer: boolean;
  shuffleMoves: number;
}

export default ISlidingPuzzleSession;
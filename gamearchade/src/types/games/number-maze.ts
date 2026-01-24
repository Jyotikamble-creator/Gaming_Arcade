/**
 * TypeScript type definitions for Number Maze Game
 */

/**
 * Difficulty levels for number maze
 */
export type NumberMazeDifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

/**
 * Mathematical operations available in the maze
 */
export type MazeOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'square' | 'sqrt';

/**
 * Performance rating
 */
export type PerformanceRating = 'Math Master' | 'Expert Navigator' | 'Skilled Solver' | 'Apprentice' | 'Beginner';

/**
 * Single move/step in the maze
 */
export interface MazeMove {
  operation: MazeOperation;
  operand?: number; // Not needed for square/sqrt
  resultValue: number;
  timestamp: Date;
  moveNumber: number;
}

/**
 * Difficulty benchmark configuration
 */
export interface DifficultyBenchmark {
  minMoves: number;
  maxMoves: number;
  maxTime: number; // in seconds
}

/**
 * Number maze session
 */
export interface NumberMazeSession {
  _id?: string;
  userId?: string;
  sessionId: string;
  startNumber: number;
  targetNumber: number;
  currentNumber: number;
  moves: MazeMove[];
  moveCount: number;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  success: boolean;
  difficulty: NumberMazeDifficultyLevel;
  score: number;
  timeElapsed: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request body for starting a new maze
 */
export interface StartMazeRequest {
  difficulty?: NumberMazeDifficultyLevel;
  userId?: string;
  customTarget?: number;
  customStart?: number;
}

/**
 * Response for starting a new maze
 */
export interface StartMazeResponse {
  sessionId: string;
  startNumber: number;
  targetNumber: number;
  currentNumber: number;
  difficulty: NumberMazeDifficultyLevel;
  benchmark: DifficultyBenchmark;
  startTime: Date;
}

/**
 * Request body for making a move
 */
export interface MakeMoveRequest {
  sessionId: string;
  operation: MazeOperation;
  operand?: number;
}

/**
 * Response for making a move
 */
export interface MakeMoveResponse {
  success: boolean;
  currentNumber: number;
  targetNumber: number;
  moveCount: number;
  completed: boolean;
  reachedTarget: boolean;
  message: string;
  timeElapsed: number;
}

/**
 * Request body for calculating score
 */
export interface CalculateScoreRequest {
  moves: number;
  timeElapsed: number;
  targetNumber?: number;
  difficulty?: NumberMazeDifficultyLevel;
}

/**
 * Response for calculating score
 */
export interface CalculateScoreResponse {
  score: number;
  rating: PerformanceRating;
  message: string;
  stats: {
    moveEfficiency: number;
    timeEfficiency: number;
  };
}

/**
 * Request body for submitting a completed maze
 */
export interface SubmitMazeRequest {
  sessionId: string;
}

/**
 * Response for submitting a completed maze
 */
export interface SubmitMazeResponse {
  sessionId: string;
  completed: boolean;
  success: boolean;
  moves: number;
  timeElapsed: number;
  score: number;
  rating: PerformanceRating;
  message: string;
  performance: {
    moveEfficiency: number;
    timeEfficiency: number;
    pathOptimality: number;
  };
}

/**
 * Number maze statistics
 */
export interface NumberMazeStats {
  totalMazesAttempted: number;
  totalMazesCompleted: number;
  completionRate: number;
  averageMoves: number;
  bestMoves: number;
  averageTime: number;
  bestTime: number;
  averageScore: number;
  bestScore: number;
  perfectSolves: number; // Under benchmark minMoves
  fastestDifficulty: NumberMazeDifficultyLevel;
  difficultiesMastered: NumberMazeDifficultyLevel[];
  favoriteOperations: MazeOperation[];
  currentStreak: number;
  bestStreak: number;
}

/**
 * Operation statistics
 */
export interface OperationStats {
  operation: MazeOperation;
  timesUsed: number;
  successRate: number;
  averageImpact: number;
}

/**
 * Leaderboard entry
 */
export interface NumberMazeLeaderboardEntry {
  playerName: string;
  bestScore: number;
  bestMoves: number;
  bestTime: number;
  perfectSolves: number;
  totalCompleted: number;
  rank: number;
}

/**
 * Maze configuration
 */
export interface MazeConfig {
  difficulty: NumberMazeDifficultyLevel;
  startNumber: number;
  targetNumber: number;
  allowedOperations: MazeOperation[];
  benchmark: DifficultyBenchmark;
}

/**
 * Path solution (for hints/optimal path)
 */
export interface PathSolution {
  moves: Array<{
    operation: MazeOperation;
    operand?: number;
    result: number;
  }>;
  totalMoves: number;
  isOptimal: boolean;
}

/**
 * Game state for client
 */
export interface MazeGameState {
  sessionId: string;
  startNumber: number;
  targetNumber: number;
  currentNumber: number;
  moveCount: number;
  timeElapsed: number;
  completed: boolean;
  success: boolean;
  moveHistory: MazeMove[];
}
